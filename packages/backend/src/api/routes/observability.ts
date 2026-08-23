import { Router } from 'express';
import { and, desc, eq, gte } from 'drizzle-orm';
import { auditRecords, logEntries } from '../../persistence/schema/audit.js';
import { metrics } from '../../persistence/schema/monitoring.js';
import type { DrizzleClient } from '../../persistence/connection.js';
import { collectSystemMetrics } from '../../infrastructure/systemMetrics/service.js';
import { resolveSystemWorkspaceId, SYSTEM_SERVER_ID } from '../../infrastructure/systemMetrics/collector.js';
import { createRequestContext, sendOk } from '../../transport/http/response.js';

type DI = { resolve: (key: string) => unknown };
type MetricRow = { id: string; metricType: string; data: unknown; recordedAt: Date | string };
type RecordValue = Record<string, unknown>;
type RangeKey = '1h' | '6h' | '24h' | '7d' | '30d';
const rangeMap: Record<RangeKey, number> = { '1h': 3600000, '6h': 21600000, '24h': 86400000, '7d': 604800000, '30d': 2592000000 };
const serviceNames = ['nginx', 'wings', 'pteroq', 'docker', 'cloudflared-kafa-store2', 'mydash-vps-backend', 'mydash-vps-postgres', 'mydash-vps-redis', 'mydash-cloudflared'];

function record(value: unknown): RecordValue {
  return value && typeof value === 'object' ? value as RecordValue : {};
}
function finite(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}
function number(value: unknown, fallback = 0): number {
  const result = finite(value);
  return result ?? fallback;
}
function text(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback;
}
function dateValue(value: Date | string | unknown): Date | null {
  const result = value instanceof Date ? value : new Date(String(value));
  return Number.isFinite(result.getTime()) ? result : null;
}
function iso(value: Date | string | unknown): string | null {
  const result = dateValue(value);
  return result ? result.toISOString() : null;
}
function normalizeRange(value: unknown): RangeKey {
  return typeof value === 'string' && value in rangeMap ? value as RangeKey : '24h';
}
function metricRecord(row: MetricRow): RecordValue {
  const root = record(row.data);
  const header = record(root.header);
  return { ...root, ...header };
}
function metricTimestamp(row: MetricRow): string | null {
  return iso(record(row.data).header && record(record(row.data).header).timestamp) ?? iso(row.recordedAt);
}
function metricValue(row: MetricRow): number | null {
  const data = metricRecord(row);
  if (row.metricType === 'cpu') return finite(data.usagePercent);
  if (row.metricType === 'memory') {
    const total = number(data.totalBytes);
    const used = number(data.usedBytes);
    return total > 0 ? used / total * 100 : null;
  }
  if (row.metricType === 'disk' || row.metricType === 'filesystem') return finite(data.usedPercent);
  if (row.metricType === 'network') {
    const rx = finite(data.rxBytesPerSec);
    const tx = finite(data.txBytesPerSec);
    return rx !== null && tx !== null && data.rateAvailable === true ? (rx + tx) / 1048576 : null;
  }
  return null;
}
function clamp(value: number, minimum = 0, maximum = 100): number {
  return Math.min(maximum, Math.max(minimum, value));
}
function latest(rows: MetricRow[], type: string): MetricRow | null {
  return rows.filter((row) => row.metricType === type).sort((a, b) => String(b.recordedAt).localeCompare(String(a.recordedAt)))[0] ?? null;
}
function rowsIn(rows: MetricRow[], start: number, end: number): MetricRow[] {
  return rows.filter((row) => {
    const timestamp = dateValue(row.recordedAt)?.getTime() ?? 0;
    return timestamp >= start && timestamp < end;
  });
}
function average(rows: MetricRow[], type: string): { value: number | null; sampleCount: number } {
  const values = rows.filter((row) => row.metricType === type).map(metricValue).filter((value): value is number => value !== null && Number.isFinite(value));
  return { value: values.length > 0 ? values.reduce((sum, value) => sum + value, 0) / values.length : null, sampleCount: values.length };
}
function comparison(rows: MetricRow[], rangeMs: number) {
  const now = Date.now();
  const current = rowsIn(rows, now - rangeMs, now + 1);
  const previous = rowsIn(rows, now - rangeMs * 2, now - rangeMs);
  return ['cpu', 'memory', 'disk', 'network'].map((metricType) => {
    const currentValue = average(current, metricType);
    const previousValue = average(previous, metricType);
    const delta = currentValue.value !== null && previousValue.value !== null ? currentValue.value - previousValue.value : null;
    const deltaPercent = delta !== null && previousValue.value !== null && previousValue.value !== 0 ? delta / Math.abs(previousValue.value) * 100 : null;
    const targetSamples = Math.max(1, Math.ceil(rangeMs / 60000));
    const confidence = Math.round(clamp(currentValue.sampleCount / targetSamples * 100));
    return { metric: metricType, current: currentValue.value, previous: previousValue.value, delta, deltaPercent, currentSamples: currentValue.sampleCount, previousSamples: previousValue.sampleCount, confidence, status: currentValue.value === null ? 'unavailable' : previousValue.value === null ? 'baseline-unavailable' : 'available' };
  });
}
function diskDetails(system: ReturnType<typeof collectSystemMetrics>, rows: MetricRow[]) {
  const row = latest(rows, 'disk');
  const data = row ? metricRecord(row) : {};
  const topDirectoriesRaw = Array.isArray(data.topDirectories) ? data.topDirectories : system.diskTopDirectories;
  const topDirectories = topDirectoriesRaw.flatMap((item) => {
    const value = record(item);
    const path = text(value.path);
    const bytes = finite(value.bytes);
    if (!path || bytes === null || bytes < 0) return [];
    return [{ path, bytes, sizeMb: Math.round(bytes / 1048576 * 100) / 100, percentOfRoot: system.totalDiskMB > 0 ? Math.round(bytes / (system.totalDiskMB * 1048576) * 10000) / 100 : null }];
  }).sort((a, b) => b.bytes - a.bytes).slice(0, 12);
  const totalBytes = system.totalDiskMB * 1048576;
  const usedBytes = system.usedDiskMB * 1048576;
  return {
    status: totalBytes > 0 ? 'available' : 'unavailable',
    scope: 'root-filesystem',
    filesystem: system.filesystem || 'unknown',
    mount: '/',
    totalBytes,
    usedBytes,
    availableBytes: system.freeDiskMB * 1048576,
    usedPercent: finite(system.diskUsagePercent),
    inodeUsage: null,
    readSpeedBps: finite(data.readSpeedBps),
    writeSpeedBps: finite(data.writeSpeedBps),
    topDirectories,
    directoryScanStatus: topDirectories.length > 0 ? 'available' : 'unavailable',
    sampledAt: iso(row?.recordedAt) ?? new Date().toISOString(),
  };
}
function serviceStatus(value: string): 'running' | 'failed' | 'stopped' | 'unavailable' {
  if (value === 'active') return 'running';
  if (value === 'failed') return 'failed';
  if (value === 'inactive' || value === 'dead') return 'stopped';
  return 'unavailable';
}
function serviceDetails(system: ReturnType<typeof collectSystemMetrics>, rows: MetricRow[]) {
  const currentByName = new Map(system.serviceDetails.map((item) => [item.name, item]));
  for (const row of rows.filter((item) => item.metricType === 'service')) {
    const data = metricRecord(row);
    const name = text(data.serviceName);
    if (!name || currentByName.has(name)) continue;
    currentByName.set(name, { name, activeState: text(data.activeState, text(data.status, 'unknown')), enabledState: data.enabled === true ? 'enabled' : 'unknown', observedAt: number(data.observedAt, dateValue(row.recordedAt)?.getTime() ?? 0) });
  }
  return serviceNames.map((name) => {
    const item = currentByName.get(name);
    const activeState = item?.activeState ?? 'unavailable';
    const history = rows.filter((row) => row.metricType === 'service' && text(metricRecord(row).serviceName) === name);
    const lastSeen = history.map((row) => iso(row.recordedAt)).filter((value): value is string => Boolean(value)).sort().at(-1) ?? null;
    const runningSamples = history.filter((row) => serviceStatus(text(metricRecord(row).activeState, text(metricRecord(row).status))) === 'running').length;
    return { name, status: serviceStatus(activeState), activeState, enabledState: item?.enabledState ?? 'unavailable', lastSeen, sampleCount: history.length, runningSamplePercent: history.length > 0 ? Math.round(runningSamples / history.length * 10000) / 100 : null, scope: name.startsWith('mydash-') || name === 'mydash-cloudflared' ? 'mydash' : 'pterodactyl-or-host' };
  });
}
function healthFactors(system: ReturnType<typeof collectSystemMetrics>, rows: MetricRow[]) {
  const latestScore = latest(rows, 'health_score');
  const rawScore = latestScore ? metricRecord(latestScore) : {};
  const overall = finite(rawScore.overall) ?? finite(rawScore.score);
  const reportedFactors = Array.isArray(rawScore.factors) ? rawScore.factors : [];
  const reportedDomains = Array.isArray(rawScore.domainScores) ? rawScore.domainScores : [];
  const observed: Array<{ domain: string; label: string; value: number | null; unit: string; threshold: number | null; weight: number; score: number | null; penalty: number | null; status: string; evidence: string; includedInOverall: boolean }> = [];
  const core = [
    { domain: 'cpu', label: 'CPU utilization', value: finite(system.cpuUsagePercent), unit: '%', threshold: 80, weight: 0.3 },
    { domain: 'memory', label: 'Memory utilization', value: finite(system.ramUsagePercent), unit: '%', threshold: 85, weight: 0.3 },
    { domain: 'disk', label: 'Root disk utilization', value: finite(system.diskUsagePercent), unit: '%', threshold: 80, weight: 0.3 },
    { domain: 'network', label: 'Network telemetry', value: system.network.rateAvailable ? finite((system.network.rxSpeed + system.network.txSpeed)) : null, unit: 'MB/s', threshold: null, weight: 0.1 },
  ];
  for (const item of core) {
    const domain = reportedDomains.map(record).find((value) => text(value.domain) === item.domain);
    const factor = reportedFactors.map(record).find((value) => text(value.domain) === item.domain);
    const score = domain ? finite(domain.score) : item.value === null ? null : item.threshold === null ? 100 : clamp(100 - Math.max(0, item.value - item.threshold) * 5);
    const penalty = factor ? finite(factor.penalty) : score === null ? null : Math.max(0, 100 - score);
    observed.push({ ...item, score, penalty, status: score === null ? 'unavailable' : score >= 80 ? 'healthy' : score >= 60 ? 'warning' : 'critical', evidence: item.value === null ? 'No valid telemetry in latest host snapshot' : `Observed ${item.value.toFixed(2)}${item.unit}`, includedInOverall: true });
  }
  const serviceRows = serviceDetails(system, rows);
  const serviceEvidence = serviceRows.filter((item) => item.status !== 'unavailable');
  if (serviceEvidence.length > 0) {
    const running = serviceEvidence.filter((item) => item.status === 'running').length;
    const score = running / serviceEvidence.length * 100;
    observed.push({ domain: 'services', label: 'Critical service availability', value: score, unit: '% running', threshold: 100, weight: 0, score, penalty: 0, status: score === 100 ? 'healthy' : score >= 75 ? 'warning' : 'critical', evidence: `${String(running)} of ${String(serviceEvidence.length)} observed services running`, includedInOverall: false });
  }
  const rawConfidence = finite(rawScore.confidence);
  const confidence = rawConfidence === null ? null : rawConfidence <= 1 ? rawConfidence * 100 : clamp(rawConfidence);
  const fallbackGrade = overall === null ? 'Unavailable' : overall >= 90 ? 'A' : overall >= 80 ? 'B' : overall >= 70 ? 'C' : overall >= 60 ? 'D' : 'F';
  return { overall, grade: text(rawScore.grade, fallbackGrade), confidence, calculatedAt: iso(rawScore.calculatedAt) ?? iso(latestScore?.recordedAt), factors: observed, explanation: 'Overall score is the persisted health score. Core factor rows show observed evidence and the score model contribution; service evidence is diagnostic only when it is not part of the persisted score model.' };
}
function networkDetails(system: ReturnType<typeof collectSystemMetrics>, rows: MetricRow[]) {
  const networkRows = rows.filter((row) => row.metricType === 'network');
  const valid = networkRows.map((row) => {
    const data = metricRecord(row);
    const rx = finite(data.rxBytesPerSec);
    const tx = finite(data.txBytesPerSec);
    return { timestamp: metricTimestamp(row), rxBytesPerSec: rx, txBytesPerSec: tx, totalBytesPerSec: rx !== null && tx !== null && data.rateAvailable === true ? rx + tx : null, rateAvailable: data.rateAvailable === true };
  });
  const rates = valid.map((item) => item.totalBytesPerSec).filter((value): value is number => value !== null && Number.isFinite(value));
  const latestRow = latest(rows, 'network');
  const latestData = latestRow ? metricRecord(latestRow) : {};
  const interfacesRaw = Array.isArray(latestData.interfaces) ? latestData.interfaces : system.networkInterfaces;
  const interfaces = interfacesRaw.flatMap((item) => {
    const value = record(item);
    const name = text(value.name);
    const rxBytes = finite(value.rxBytes);
    const txBytes = finite(value.txBytes);
    return name && rxBytes !== null && txBytes !== null ? [{ name, rxBytes, txBytes, rxGiB: Math.round(rxBytes / 1073741824 * 100) / 100, txGiB: Math.round(txBytes / 1073741824 * 100) / 100 }] : [];
  }).sort((a, b) => b.rxBytes + b.txBytes - (a.rxBytes + a.txBytes));
  return { status: rates.length > 0 ? 'available' : system.network.rateAvailable ? 'available' : 'unavailable', activeInterface: system.network.interface || 'unavailable', ipv4: system.network.ipv4 || null, ipv6: system.network.ipv6 || null, rxSpeed: system.network.rateAvailable ? system.network.rxSpeed : null, txSpeed: system.network.rateAvailable ? system.network.txSpeed : null, totalSpeed: system.network.rateAvailable ? system.network.rxSpeed + system.network.txSpeed : null, averageSpeed: rates.length > 0 ? rates.reduce((sum, value) => sum + value, 0) / rates.length / 1048576 : null, peakSpeed: rates.length > 0 ? Math.max(...rates) / 1048576 : null, rateUnit: 'MB/s', rateAvailable: system.network.rateAvailable || rates.length > 0, sampleCount: rates.length, dominantDirection: system.network.rxSpeed > system.network.txSpeed ? 'rx' : system.network.txSpeed > system.network.rxSpeed ? 'tx' : system.network.rateAvailable ? 'balanced' : 'unavailable', packetLoss: null, latencyMs: null, packetLossAvailable: false, latencyAvailable: false, interfaces, samples: valid.slice(-120) };
}
function availability(system: ReturnType<typeof collectSystemMetrics>, rows: MetricRow[], rangeMs: number) {
  const now = Date.now();
  const start = now - rangeMs;
  const scopedRows = rowsIn(rows, start, now + 1);
  const bucket = (value: Date | string | unknown): string | null => {
    const date = dateValue(value);
    if (!date) return null;
    const time = Math.floor(date.getTime() / 60000) * 60000;
    return new Date(time).toISOString();
  };
  const observedBuckets = new Set(scopedRows.map((row) => bucket(row.recordedAt)).filter((value): value is string => Boolean(value)));
  const expectedBuckets = Math.max(1, Math.ceil(rangeMs / 60000));
  const observed = Math.min(expectedBuckets, observedBuckets.size);
  const missing = Math.max(0, expectedBuckets - observed);
  const serviceHistory = serviceNames.map((name) => {
    const serviceRows = scopedRows.filter((row) => row.metricType === 'service' && text(metricRecord(row).serviceName) === name);
    const serviceBuckets = new Set(serviceRows.map((row) => bucket(row.recordedAt)).filter((value): value is string => Boolean(value)));
    const running = serviceRows.filter((row) => serviceStatus(text(metricRecord(row).activeState, text(metricRecord(row).status))) === 'running').length;
    return { name, expectedBuckets, observedBuckets: serviceBuckets.size, coveragePercent: Math.round(Math.min(100, serviceBuckets.size / expectedBuckets * 10000)) / 100, runningPercent: serviceRows.length > 0 ? Math.round(running / serviceRows.length * 10000) / 100 : null, lastSeen: serviceRows.map((row) => iso(row.recordedAt)).filter((value): value is string => Boolean(value)).sort().at(-1) ?? null, status: serviceRows.length === 0 ? 'unavailable' : serviceBuckets.size / expectedBuckets >= 0.95 && running / serviceRows.length >= 0.95 ? 'available' : 'degraded' };
  });
  const uptimePoints = scopedRows.filter((row) => row.metricType === 'service' || row.metricType === 'cpu').map((row) => {
    const data = metricRecord(row);
    return { timestamp: metricTimestamp(row), uptimeSeconds: finite(data.uptimeSeconds), bootTime: iso(data.bootTime), heartbeat: true };
  }).filter((point) => point.timestamp !== null).sort((a, b) => String(a.timestamp).localeCompare(String(b.timestamp))).slice(-240);
  return { status: observed > 0 ? 'available' : 'unavailable', rangeMs, expectedBuckets, observedBuckets: observed, missingBuckets: missing, coveragePercent: Math.round(observed / expectedBuckets * 10000) / 100, lastSeen: rows.map((row) => iso(row.recordedAt)).filter((value): value is string => Boolean(value)).sort().at(-1) ?? null, host: { hostname: system.hostname, uptimeSeconds: system.uptimeSeconds || null, uptimeFormatted: system.uptimeFormatted || null, bootTime: iso(system.bootTime) }, serviceHistory, uptimePoints, gaps: missing > 0 ? [{ from: iso(start), to: new Date(now).toISOString(), missingBuckets: missing }] : [] };
}
function eventTimeline(rows: MetricRow[], audits: RecordValue[], logs: RecordValue[]) {
  const events: RecordValue[] = [];
  for (const item of logs) {
    const timestamp = iso(item.createdAt);
    if (!timestamp) continue;
    const level = text(item.level, 'info');
    events.push({ id: `log:${String(item.id)}`, timestamp, kind: 'log', severity: level === 'error' ? 'critical' : level === 'warning' ? 'warning' : 'info', source: text(item.module, 'backend'), title: `${level.toUpperCase()} log`, message: text(item.message, 'Operational log'), status: 'observed', metadata: record(item.metadata) });
  }
  for (const item of audits) {
    const timestamp = iso(item.createdAt);
    if (!timestamp) continue;
    events.push({ id: `audit:${String(item.id)}`, timestamp, kind: 'audit', severity: 'info', source: 'audit', title: text(item.action, 'Audit event'), message: `${text(item.entityType, 'resource')} ${text(item.entityId, '')}`.trim(), status: 'observed', metadata: { actorType: item.actorType ?? null, ipAddress: item.ipAddress ?? null, correlationId: item.correlationId ?? null } });
  }
  const serviceRows = rows.filter((row) => row.metricType === 'service').sort((a, b) => String(a.recordedAt).localeCompare(String(b.recordedAt)));
  const lastState = new Map<string, string>();
  for (const row of serviceRows) {
    const data = metricRecord(row);
    const name = text(data.serviceName, 'unknown');
    const state = text(data.activeState, text(data.status, 'unknown'));
    if (lastState.get(name) === state) continue;
    lastState.set(name, state);
    const timestamp = metricTimestamp(row);
    if (!timestamp) continue;
    events.push({ id: `service:${name}:${timestamp}`, timestamp, kind: 'service-state', severity: state === 'failed' ? 'critical' : state === 'active' ? 'info' : 'warning', source: name, title: `${name} state changed`, message: `Service observed as ${state}`, status: state === 'active' ? 'running' : state, metadata: { enabled: data.enabled === true, uptimeSeconds: finite(data.uptimeSeconds), bootTime: iso(data.bootTime) } });
  }
  for (const row of rows.filter((item) => item.metricType === 'health_score')) {
    const data = metricRecord(row);
    const timestamp = iso(data.calculatedAt) ?? iso(row.recordedAt);
    const score = finite(record(data.overall).score) ?? finite(data.score);
    if (!timestamp || score === null) continue;
    events.push({ id: `health:${String(row.id)}`, timestamp, kind: 'health-score', severity: score < 60 ? 'critical' : score < 80 ? 'warning' : 'info', source: 'health-score', title: `Health score ${score.toFixed(2)}`, message: text(data.grade, 'Observed score'), status: score < 60 ? 'degraded' : 'stable', metadata: { score, grade: text(data.grade, '') } });
  }
  return events.sort((a, b) => String(b.timestamp).localeCompare(String(a.timestamp))).slice(0, 200);
}
async function loadRows(db: DrizzleClient, workspaceId: string, rangeMs: number): Promise<MetricRow[]> {
  const cutoff = new Date(Date.now() - rangeMs * 2);
  const result = await db.select({ id: metrics.id, metricType: metrics.metricType, data: metrics.data, recordedAt: metrics.recordedAt }).from(metrics).where(and(eq(metrics.workspaceId, workspaceId), eq(metrics.serverId, SYSTEM_SERVER_ID), gte(metrics.recordedAt, cutoff))).orderBy(desc(metrics.recordedAt)).limit(2000);
  return result as MetricRow[];
}
async function loadAudit(db: DrizzleClient, workspaceId: string): Promise<RecordValue[]> {
  const result = await db.select().from(auditRecords).where(eq(auditRecords.workspaceId, workspaceId)).orderBy(desc(auditRecords.createdAt)).limit(100);
  return result as unknown as RecordValue[];
}
async function loadLogs(db: DrizzleClient, workspaceId: string): Promise<RecordValue[]> {
  const result = await db.select().from(logEntries).where(eq(logEntries.workspaceId, workspaceId)).orderBy(desc(logEntries.createdAt)).limit(100);
  return result as unknown as RecordValue[];
}
async function buildObservability(resolve: (key: string) => unknown, workspaceHint: string | undefined, range: RangeKey) {
  const db = resolve('dbClient') as DrizzleClient | null;
  const system = collectSystemMetrics();
  if (!db) return { status: 'unavailable', range, generatedAt: new Date().toISOString(), events: [], disk: diskDetails(system, []), services: serviceDetails(system, []), healthFactors: healthFactors(system, []), comparisons: comparison([], rangeMap[range]), network: networkDetails(system, []), availability: availability(system, [], rangeMap[range]) };
  const workspaceId = await resolveSystemWorkspaceId(resolve, workspaceHint) ?? workspaceHint ?? 'default';
  const [rows, audits, logs] = await Promise.all([loadRows(db, workspaceId, Math.max(rangeMap[range], 86400000)), loadAudit(db, workspaceId), loadLogs(db, workspaceId)]);
  return { status: rows.length > 0 ? 'available' : 'unavailable', range, generatedAt: new Date().toISOString(), events: eventTimeline(rows, audits, logs), disk: diskDetails(system, rows), services: serviceDetails(system, rows), healthFactors: healthFactors(system, rows), comparisons: comparison(rows, rangeMap[range]), network: networkDetails(system, rows), availability: availability(system, rows, rangeMap[range]) };
}
export function createObservabilityRouter(di?: DI): Router {
  const router = Router();
  const resolve = (key: string) => di?.resolve(key) ?? null;
  router.get('/', async (req, res) => {
    const ctx = createRequestContext(req);
    const range = normalizeRange(req.query.range);
    const payload = await buildObservability(resolve, ctx.workspaceId ?? undefined, range);
    sendOk(res, payload, ctx);
  });
  router.get('/events', async (req, res) => {
    const ctx = createRequestContext(req);
    const payload = await buildObservability(resolve, ctx.workspaceId ?? undefined, normalizeRange(req.query.range));
    sendOk(res, { status: payload.status, range: payload.range, generatedAt: payload.generatedAt, events: payload.events }, ctx);
  });
  router.get('/disk', async (req, res) => {
    const ctx = createRequestContext(req);
    const payload = await buildObservability(resolve, ctx.workspaceId ?? undefined, normalizeRange(req.query.range));
    sendOk(res, payload.disk, ctx);
  });
  router.get('/services', async (req, res) => {
    const ctx = createRequestContext(req);
    const payload = await buildObservability(resolve, ctx.workspaceId ?? undefined, normalizeRange(req.query.range));
    sendOk(res, { services: payload.services, availability: payload.availability.serviceHistory }, ctx);
  });
  router.get('/health-factors', async (req, res) => {
    const ctx = createRequestContext(req);
    const payload = await buildObservability(resolve, ctx.workspaceId ?? undefined, normalizeRange(req.query.range));
    sendOk(res, payload.healthFactors, ctx);
  });
  router.get('/comparison', async (req, res) => {
    const ctx = createRequestContext(req);
    const range = normalizeRange(req.query.range);
    const payload = await buildObservability(resolve, ctx.workspaceId ?? undefined, range);
    sendOk(res, { range, comparisons: payload.comparisons }, ctx);
  });
  router.get('/network', async (req, res) => {
    const ctx = createRequestContext(req);
    const payload = await buildObservability(resolve, ctx.workspaceId ?? undefined, normalizeRange(req.query.range));
    sendOk(res, payload.network, ctx);
  });
  router.get('/availability', async (req, res) => {
    const ctx = createRequestContext(req);
    const range = normalizeRange(req.query.range);
    const payload = await buildObservability(resolve, ctx.workspaceId ?? undefined, range);
    sendOk(res, payload.availability, ctx);
  });
  return router;
}

export function createLogsRouter(di?: DI): Router {
  const router = Router();
  const resolve = (key: string) => di?.resolve(key) ?? null;
  router.get('/all', async (req, res) => {
    const ctx = createRequestContext(req);
    const db = resolve('dbClient') as DrizzleClient | null;
    if (!db) { sendOk(res, { logs: [], status: 'unavailable', generatedAt: new Date().toISOString() }, ctx); return; }
    const workspaceId = await resolveSystemWorkspaceId(resolve, ctx.workspaceId ?? undefined) ?? ctx.workspaceId ?? 'default';
    const rows = await db.select().from(logEntries).where(eq(logEntries.workspaceId, workspaceId)).orderBy(desc(logEntries.createdAt)).limit(500);
    const logs = rows.map((row) => ({ id: row.id, timestamp: row.createdAt.toISOString(), level: row.level === 'warn' ? 'warning' : row.level === 'error' ? 'error' : row.level === 'debug' ? 'debug' : 'info', message: row.message, source: row.module === 'docker' ? 'docker' : row.module === 'nginx' ? 'nginx' : 'system' }));
    sendOk(res, { logs, status: 'available', generatedAt: new Date().toISOString() }, ctx);
  });
  return router;
}
