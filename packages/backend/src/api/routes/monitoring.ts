import { Router } from 'express';
import { collectSystemMetrics } from '../../infrastructure/systemMetrics/service.js';
import { recordSystemMetricsSnapshot, resolveSystemWorkspaceId, SYSTEM_SERVER_ID } from '../../infrastructure/systemMetrics/collector.js';
import { sendOk, createRequestContext } from '../../transport/http/response.js';
import { createUseCaseContext } from '../../application/usecases/base.js';
type DI = { resolve: (key: string) => unknown };
type UseCase<TIn, TOut> = { execute: (input: TIn, context: ReturnType<typeof createUseCaseContext>) => Promise<{ success: boolean; data: TOut | null; error: unknown }> };
async function createMonitoringContext(resolve: (key: string) => unknown, ctx: ReturnType<typeof createRequestContext>) {
  const workspaceId = await resolveSystemWorkspaceId(resolve, ctx.workspaceId ?? undefined);
  return createUseCaseContext({ correlationId: ctx.correlationId, workspaceId: workspaceId ?? 'default' });
}
type TimelinePoint = { timestamp: string; cpu: number; memory: number; disk: number; network: number };
function finite(value: unknown, fallback = 0): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}
function readMetricType(metric: Record<string, unknown>): string {
  const header = metric.header;
  if (header && typeof header === 'object') {
    const type = (header as Record<string, unknown>).metricType;
    if (typeof type === 'string') return type;
  }
  return typeof metric.metricType === 'string' ? metric.metricType : '';
}
function readTimestamp(metric: Record<string, unknown>): string | null {
  const header = metric.header;
  const value = header && typeof header === 'object' ? (header as Record<string, unknown>).timestamp : metric.timestamp;
  if (typeof value !== 'string') return null;
  const timestamp = new Date(value);
  return Number.isNaN(timestamp.getTime()) ? null : timestamp.toISOString();
}
function readMetricValue(metric: Record<string, unknown>, metricType: string): number {
  if (metricType === 'cpu') return Math.min(100, Math.max(0, finite(metric.usagePercent)));
  if (metricType === 'memory') {
    const total = finite(metric.totalBytes);
    const used = finite(metric.usedBytes);
    return total > 0 ? Math.min(100, Math.max(0, used / total * 100)) : 0;
  }
  if (metricType === 'disk' || metricType === 'filesystem') return Math.min(100, Math.max(0, finite(metric.usedPercent)));
  if (metricType === 'network') return Math.max(0, (finite(metric.rxBytesPerSec) + finite(metric.txBytesPerSec)) / (1024 * 1024));
  return 0;
}
function mapMetricWindow(value: unknown, requestedMetric: string): TimelinePoint[] {
  if (!Array.isArray(value)) return [];
  const grouped = new Map<string, TimelinePoint>();
  for (const metric of value.filter((item): item is Record<string, unknown> => Boolean(item) && typeof item === 'object')) {
    const metricType = readMetricType(metric);
    const timestamp = readTimestamp(metric);
    if (!timestamp || !(requestedMetric === 'all' || metricType === requestedMetric || (requestedMetric === 'disk' && metricType === 'filesystem'))) continue;
    const bucket = timestamp.slice(0, 16);
    const point = grouped.get(bucket) ?? { timestamp, cpu: 0, memory: 0, disk: 0, network: 0 };
    const metricValue = readMetricValue(metric, metricType);
    if (metricType === 'cpu') point.cpu = metricValue;
    if (metricType === 'memory') point.memory = metricValue;
    if (metricType === 'disk' || metricType === 'filesystem') point.disk = metricValue;
    if (metricType === 'network') point.network = metricValue;
    grouped.set(bucket, point);
  }
  return Array.from(grouped.values()).sort((a, b) => a.timestamp.localeCompare(b.timestamp));
}
function readRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' ? value as Record<string, unknown> : {};
}
function healthCategory(score: number): string {
  if (score >= 85) return 'excellent';
  if (score >= 70) return 'good';
  if (score >= 60) return 'warning';
  return 'critical';
}
function healthGrade(score: number): string {
  if (score >= 90) return 'A';
  if (score >= 80) return 'B';
  if (score >= 70) return 'C';
  if (score >= 60) return 'D';
  return 'F';
}
function mapHealthScore(value: unknown): Record<string, unknown> | null {
  const raw = readRecord(value);
  const score = finite(raw.overall, -1);
  if (score < 0) return null;
  const calculatedAt = typeof raw.calculatedAt === 'string' ? raw.calculatedAt : new Date().toISOString();
  const domains = Array.isArray(raw.domainScores) ? raw.domainScores : [];
  const categories = domains.map((item) => {
    const domain = readRecord(item);
    const domainScore = Math.min(100, Math.max(0, finite(domain.score)));
    const name = typeof domain.domain === 'string' ? domain.domain : 'unknown';
    return {
      name,
      score: domainScore,
      grade: healthGrade(domainScore),
      maxScore: 100,
      impact: Math.round(domainScore - 100),
      status: domainScore >= 80 ? 'healthy' : domainScore >= 60 ? 'warning' : 'critical',
      description: `Latest ${name} utilization score`,
    };
  });
  const factors = Array.isArray(raw.factors) ? raw.factors : [];
  const penalties = factors.map((item) => {
    const factor = readRecord(item);
    const penalty = Math.max(0, finite(factor.penalty));
    return {
      factor: typeof factor.domain === 'string' ? factor.domain : 'unknown',
      points: penalty,
      description: typeof factor.description === 'string' ? factor.description : 'Derived from latest metric',
      severity: penalty >= 30 ? 'critical' : penalty >= 20 ? 'high' : penalty >= 10 ? 'medium' : 'low',
    };
  });
  const confidence = Math.min(100, Math.max(0, Math.round(finite(raw.confidence) * 10000) / 100));
  return {
    overall: { score, grade: typeof raw.grade === 'string' ? raw.grade : healthGrade(score), category: healthCategory(score), trend: 'stable', change1h: 0, change24h: 0 },
    categories,
    penalties,
    recovery: { state: score < 60 ? 'degraded' : 'stable', progress: 0, estimatedRecovery: '', lastIncident: '', duration: '0h' },
    confidence,
    grade: typeof raw.grade === 'string' ? raw.grade : healthGrade(score),
    timeline: [{ timestamp: calculatedAt, score }],
    history: [],
    lastUpdated: calculatedAt,
  };
}
function mapHealthHistory(value: unknown): Array<Record<string, unknown>> {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => {
    const raw = readRecord(item);
    const score = finite(raw.overall, -1);
    if (score < 0) return [];
    const timestamp = typeof raw.calculatedAt === 'string' ? raw.calculatedAt : new Date().toISOString();
    return [{ id: String(raw.id ?? timestamp), timestamp, score, grade: typeof raw.grade === 'string' ? raw.grade : healthGrade(score), change: 0, reason: 'Recorded health score', duration: '0h' }];
  });
}
function parseWindowMs(value: unknown): number {
  const fallback = 86400000;
  if (typeof value !== 'string') return fallback;
  const match = value.match(/^(\d+)([mhd])$/i);
  if (!match) return fallback;
  const amount = Number(match[1]);
  const unit = match[2].toLowerCase();
  const multiplier = unit === 'm' ? 60000 : unit === 'h' ? 3600000 : 86400000;
  return Math.min(Math.max(amount * multiplier, 60000), 2592000000);
}
export function createMonitoringRouter(di?: DI): Router {
  const router = Router();
  const resolve = (key: string) => di?.resolve(key) ?? null;
  router.get('/', async (_req, res) => {
    const ctx = createRequestContext(_req);
    const system = collectSystemMetrics();
    await recordSystemMetricsSnapshot(resolve, ctx.correlationId, ctx.workspaceId ?? 'default');
    let timeline: TimelinePoint[] = [];
    const windowUc = resolve('getMetricWindowUseCase') as UseCase<{ serverId: string; windowMs: number }, unknown> | null;
    if (windowUc) {
      try {
        const uctx = await createMonitoringContext(resolve, ctx);
        const result = await windowUc.execute({ serverId: SYSTEM_SERVER_ID, windowMs: 86400000 }, uctx);
        if (result.success) timeline = mapMetricWindow(result.data, 'all');
      } catch {  }
    }
    sendOk(res, defaultMonitoring(system, timeline), ctx);
  });
  router.get('/:metric', async (req, res) => {
    const ctx = createRequestContext(req);
    const uc = resolve('getMetricWindowUseCase') as UseCase<{ serverId: string; windowMs: number }, unknown> | null;
    if (uc) {
      try {
        const uctx = await createMonitoringContext(resolve, ctx);
        const r = await uc.execute({ serverId: SYSTEM_SERVER_ID, windowMs: parseWindowMs(req.query.range) }, uctx);
        if (r.success) { sendOk(res, mapMetricWindow(r.data, req.params.metric), ctx); return; }
      } catch {  }
    }
    sendOk(res, [], ctx);
  });
  return router;
}
function defaultMonitoring(system = collectSystemMetrics(), timeline: TimelinePoint[] = []) {
  const now = new Date().toISOString();
  const currentPoint = { timestamp: now, cpu: system.cpuUsagePercent, memory: system.ramUsagePercent, disk: system.diskUsagePercent, network: system.network.rxSpeed + system.network.txSpeed };
  const services = Object.entries(system.services).map(([name, state]) => ({
    name,
    status: state === 'active' ? 'running' : state === 'failed' ? 'failed' : 'stopped',
    cpu: null,
    memory: null,
    uptime: 'Not available',
    port: null,
  }));
  return {
    cpu: { model: system.cpuModel, vendor: '', cores: system.cpuCores, threads: system.cpuCores, clockMin: system.cpuSpeed, clockMax: system.cpuSpeed, clockCurrent: system.cpuSpeed, loadAverage: system.loadAverage1m, usagePercent: system.cpuUsagePercent, temperature: null, perCore: [] },
    memory: { total: system.totalRamMB, used: system.usedRamMB, available: system.freeRamMB, cached: 0, buffered: 0, swapTotal: 0, swapUsed: 0, usagePercent: system.ramUsagePercent },
    disks: [{ device: '/', mount: '/', filesystem: 'host', total: system.totalDiskMB, used: system.usedDiskMB, available: system.freeDiskMB, usagePercent: system.diskUsagePercent, inodeUsage: 0, readSpeed: 0, writeSpeed: 0 }],
    network: { interface: system.network.interface, publicIpv4: '', interfaceIpv4: system.network.ipv4, publicIpv6: system.network.ipv6, rxBytes: system.network.rxBytes, txBytes: system.network.txBytes, rxSpeed: system.network.rxSpeed, txSpeed: system.network.txSpeed, packetLoss: 0, latency: 0, connections: 0 },
    docker: { containerCount: 0, running: 0, stopped: 0, cpuPercent: 0, memoryPercent: 0, restartCount: 0, health: 'unavailable' as const },
    tunnel: { provider: '', status: 'disconnected' as const, domain: '', ssl: false, latency: 0, reconnectCount: 0, uptime: '0h' },
    services, timeline: timeline.length > 0 ? timeline : [currentPoint],
    collection: { status: 'success' as const, lastUpdated: now, errorCount: 0, errors: [], summary: 'Live system metrics collected by backend', nextCollection: new Date(Date.now() + 60000).toISOString() },
    categories: [],
  };
}
export function createDashboardRouter(di?: DI): Router {
  const router = Router();
  const resolve = (key: string) => di?.resolve(key) ?? null;
  router.get('/', async (_req, res) => {
    const ctx = createRequestContext(_req);
    const healthUc = resolve('getHealthScoreUseCase') as UseCase<{ serverId: string }, unknown> | null;
    const calculate = resolve('calculateHealthScoreUseCase') as UseCase<{ serverId: string }, unknown> | null;
    if (healthUc) {
      try {
        const uctx = await createMonitoringContext(resolve, ctx);
        const r = await healthUc.execute({ serverId: SYSTEM_SERVER_ID }, uctx);
        const health = mapHealthScore(r.data);
        if (health) {
          const overall = readRecord(health.overall);
          sendOk(res, { ...defaultDashboard(), health: { score: finite(overall.score), grade: health.grade, trend: 'stable', factors: health.penalties } }, ctx);
          return;
        }
        if (calculate) {
          const calculated = await calculate.execute({ serverId: SYSTEM_SERVER_ID }, uctx);
          const calculatedHealth = mapHealthScore(calculated.data);
          if (calculated.success && calculatedHealth) {
            const overall = readRecord(calculatedHealth.overall);
            sendOk(res, { ...defaultDashboard(), health: { score: finite(overall.score), grade: calculatedHealth.grade, trend: 'stable', factors: calculatedHealth.penalties } }, ctx);
            return;
          }
        }
      } catch {  }
    }
    sendOk(res, defaultDashboard(), ctx);
  });
  return router;
}
function defaultDashboard() {
  const system = collectSystemMetrics();
  return {
    server: { hostname: system.hostname, os: system.os, distro: system.os, kernel: system.release, architecture: system.architecture, virtualization: system.virtualization, filesystem: system.filesystem, uptime: system.uptimeFormatted, cpuCores: system.cpuCores, cpuModel: system.cpuModel, totalRam: system.totalRamMB, usedRam: system.usedRamMB, totalSwap: system.swapTotalMB, usedSwap: system.swapUsedMB, totalDisk: system.totalDiskMB, usedDisk: system.usedDiskMB, interface: system.network.interface, interfaceIpv4: system.network.ipv4, agentVersion: system.agentVersion },
    health: { score: 0, grade: 'N/A', trend: 'stable' as const, factors: [] },
    resources: [
      { label: 'CPU', used: system.cpuUsagePercent, total: 100, percent: system.cpuUsagePercent, unit: '%', trend: 'stable' as const },
      { label: 'Memory', used: system.usedRamMB, total: system.totalRamMB, percent: system.ramUsagePercent, unit: 'MB', trend: 'stable' as const },
      { label: 'Disk', used: system.usedDiskMB, total: system.totalDiskMB, percent: system.diskUsagePercent, unit: 'MB', trend: 'stable' as const },
    ],
    notificationSummary: { total: 0, unread: 0, failed: 0, lastDelivery: new Date().toISOString() },
    automationSummary: { active: 0, successRate: 0, running: 0, failed: 0, lastRun: new Date().toISOString() },
    activeAlerts: [], recentActivity: [],
    quickActions: [
      { label: 'View Servers', icon: 'server', description: 'Manage your servers', to: '/servers' },
      { label: 'Check Health', icon: 'heart', description: 'View health scores', to: '/health-score' },
      { label: 'Settings', icon: 'settings', description: 'Configure system', to: '/settings' },
    ],
  };
}
function metricUnit(metricType: string): string {
  return metricType === 'network' ? 'MB/s' : '%';
}
function formatWindow(windowMs: number): string {
  if (windowMs >= 86400000 && windowMs % 86400000 === 0) return `${String(windowMs / 86400000)}d`;
  if (windowMs >= 3600000 && windowMs % 3600000 === 0) return `${String(windowMs / 3600000)}h`;
  return `${String(Math.max(1, Math.round(windowMs / 60000)))}m`;
}
function mapAnalyticsResponse(summaryValue: unknown, rawValue: unknown, windowMs: number) {
  const summary = summaryValue && typeof summaryValue === 'object' ? summaryValue as Record<string, unknown> : {};
  const aggregationsRaw = Array.isArray(summary.aggregatedMetrics) ? summary.aggregatedMetrics : [];
  const anomaliesRaw = Array.isArray(summary.anomalies) ? summary.anomalies : [];
  const rawMetrics = Array.isArray(rawValue) ? rawValue.filter((item): item is Record<string, unknown> => Boolean(item) && typeof item === 'object') : [];
  const trendBuckets = new Map<string, { timestamp: string; value: number; movingAvg: number }[]>();
  for (const metric of rawMetrics) {
    const type = readMetricType(metric);
    const ts = readTimestamp(metric);
    if (!ts) continue;
    const value = readMetricValue(metric, type);
    const list = trendBuckets.get(type) ?? [];
    list.push({ timestamp: ts, value, movingAvg: 0 });
    trendBuckets.set(type, list);
  }
  for (const list of trendBuckets.values()) {
    list.sort((a, b) => a.timestamp.localeCompare(b.timestamp));
    list.forEach((point, index) => {
      const window = list.slice(Math.max(0, index - 4), index + 1);
      point.movingAvg = window.reduce((total, item) => total + item.value, 0) / window.length;
    });
  }
  const aggregations = aggregationsRaw.filter((item): item is Record<string, unknown> => Boolean(item) && typeof item === 'object').map((item) => {
    const metricType = typeof item.metricType === 'string' ? item.metricType : 'unknown';
    const count = finite(item.sampleCount);
    const average = finite(item.average);
    return { label: metricType, count, avg: average, min: finite(item.min), max: finite(item.max), period: formatWindow(windowMs) };
  });
  const trend = Array.from(trendBuckets.entries()).flatMap(([metricType, points]) => points.map((point) => ({ ...point, metricType })));
  const categories = aggregations.map((item) => ({ id: item.label, label: item.label }));
  const tableData = aggregations.map((item, index) => ({ id: index, metric: item.label, category: item.label, avg: item.avg, min: item.min, max: item.max, p95: item.max, count: item.count, trend: 'stable' as const }));
  const statistics = aggregations.map((item) => ({ label: `${item.label} average`, value: item.avg, unit: metricUnit(item.label), description: `Mean value over ${item.period}` }));
  const percentiles = aggregationsRaw.filter((item): item is Record<string, unknown> => Boolean(item) && typeof item === 'object').map((item) => ({ label: typeof item.metricType === 'string' ? item.metricType : 'unknown', p50: finite(item.median), p75: finite(item.average), p90: finite(item.percentile95), p95: finite(item.percentile95), p99: finite(item.percentile99) }));
  const anomalies = anomaliesRaw.filter((item): item is Record<string, unknown> => Boolean(item) && typeof item === 'object').filter((item) => item.severity !== 'normal').map((item) => {
    const metric = typeof item.metricType === 'string' ? item.metricType : 'unknown';
    const ts = typeof item.timestamp === 'string' ? item.timestamp : String(summary.generatedAt ?? '');
    return { id: `${metric}-${ts}`, metric, value: finite(item.value), expected: finite(item.expectedValue), deviation: finite(item.zScore), severity: item.severity === 'critical' ? 'critical' : item.severity === 'warning' ? 'high' : 'low', timestamp: ts, description: typeof item.description === 'string' ? item.description : 'Anomaly detected by analytics pipeline' };
  });
  const timestamps = rawMetrics.map(readTimestamp).filter((value): value is string => Boolean(value)).sort();
  const generatedAt = typeof summary.generatedAt === 'string' ? summary.generatedAt : new Date().toISOString();
  return {
    summary: { totalMetrics: rawMetrics.length, metricsCollected: rawMetrics.length, metricsFailed: 0, storageUsed: 0, storageTotal: 0, oldestTimestamp: timestamps[0] ?? generatedAt, newestTimestamp: timestamps[timestamps.length - 1] ?? generatedAt },
    aggregations,
    trend,
    anomalies,
    statistics,
    percentiles,
    predictions: [],
    efficiency: [],
    tableData,
    timeRange: formatWindow(windowMs),
    categories,
  };
}
export function createAnalyticsRouter(di?: DI): Router {
  const router = Router();
  const resolve = (key: string) => di?.resolve(key) ?? null;
  router.get('/', async (_req, res) => {
    const ctx = createRequestContext(_req);
    const calculate = resolve('calculateAnalyticsSummaryUseCase') as UseCase<{ serverId: string; windowMs: number }, unknown> | null;
    const windowUc = resolve('getMetricWindowUseCase') as UseCase<{ serverId: string; windowMs: number }, unknown> | null;
    const windowMs = parseWindowMs(_req.query.range);
    const uctx = await createMonitoringContext(resolve, ctx);
    let summary: unknown = null;
    let rawMetrics: unknown = [];
    try {
      if (calculate) {
        const result = await calculate.execute({ serverId: SYSTEM_SERVER_ID, windowMs }, uctx);
        if (result.success) summary = result.data;
      }
      if (windowUc) {
        const result = await windowUc.execute({ serverId: SYSTEM_SERVER_ID, windowMs }, uctx);
        if (result.success) rawMetrics = result.data;
      }
    } catch {  }
    sendOk(res, mapAnalyticsResponse(summary, rawMetrics, windowMs), ctx);
  });
  return router;
}
export function createHealthRouter(di?: DI): Router {
  const router = Router();
  const resolve = (key: string) => di?.resolve(key) ?? null;
  router.get('/history', async (req, res) => {
    const ctx = createRequestContext(req);
    const uc = resolve('getHealthHistoryUseCase') as UseCase<{ serverId: string; windowMs: number }, unknown> | null;
    if (uc) {
      try {
        const uctx = await createMonitoringContext(resolve, ctx);
        const result = await uc.execute({ serverId: SYSTEM_SERVER_ID, windowMs: parseWindowMs(req.query.range) }, uctx);
        if (result.success) { sendOk(res, mapHealthHistory(result.data), ctx); return; }
      } catch {  }
    }
    sendOk(res, [], ctx);
  });
  router.get('/', async (_req, res) => {
    const ctx = createRequestContext(_req);
    const uc = resolve('getHealthScoreUseCase') as UseCase<{ serverId: string }, unknown> | null;
    const calculate = resolve('calculateHealthScoreUseCase') as UseCase<{ serverId: string }, unknown> | null;
    if (uc) {
      try {
        const uctx = await createMonitoringContext(resolve, ctx);
        const r = await uc.execute({ serverId: SYSTEM_SERVER_ID }, uctx);
        const health = mapHealthScore(r.data);
        if (health) { sendOk(res, health, ctx); return; }
        if (calculate) {
          const calculated = await calculate.execute({ serverId: SYSTEM_SERVER_ID }, uctx);
          const calculatedHealth = mapHealthScore(calculated.data);
          if (calculated.success && calculatedHealth) { sendOk(res, calculatedHealth, ctx); return; }
        }
      } catch {  }
    }
    sendOk(res, {
      overall: { score: 0, grade: 'N/A' as never, category: 'unknown' as never, trend: 'stable' as const, change1h: 0, change24h: 0 },
      categories: [], penalties: [],
      recovery: { state: 'stable' as const, progress: 0, estimatedRecovery: '', lastIncident: '', duration: '0h' },
      confidence: 0, grade: 'N/A' as never, timeline: [], history: [],
      lastUpdated: new Date().toISOString(),
    }, ctx);
  });
  return router;
}
