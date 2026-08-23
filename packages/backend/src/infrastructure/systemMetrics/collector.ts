import { collectSystemMetrics } from './service.js';
import { createUseCaseContext } from '../../application/usecases/base.js';
import { eq } from 'drizzle-orm';
import { workspaces } from '../../persistence/schema/workspace.js';
import type { DrizzleClient } from '../../persistence/connection.js';

type DI = { resolve: (key: string) => unknown };
type MetricInput = { serverId: string; metricType: string; data: Record<string, unknown> };
type CollectorLogger = { info: (message: string, metadata?: Record<string, unknown>) => void; warn: (message: string, metadata?: Record<string, unknown>) => void };
type IngestUseCase = { execute: (input: MetricInput, context: ReturnType<typeof createUseCaseContext>) => Promise<unknown> };
export const SYSTEM_SERVER_ID = '00000000-0000-0000-0000-000000000001';
let lastSnapshotAt = 0;

export async function resolveSystemWorkspaceId(resolve: (key: string) => unknown, hint?: string): Promise<string | null> {
  if (hint && /^[0-9a-f-]{36}$/i.test(hint)) return hint;
  try {
    const db = resolve('dbClient') as DrizzleClient;
    const rows = await db.select({ id: workspaces.id }).from(workspaces).where(eq(workspaces.name, 'default')).limit(1);
    return rows[0]?.id ?? null;
  } catch {
    return null;
  }
}

export async function recordSystemMetricsSnapshot(
  resolve: (key: string) => unknown,
  correlationId = `system-collector-${Date.now()}`,
  workspaceId = 'default',
  logger?: CollectorLogger,
): Promise<void> {
  if (Date.now() - lastSnapshotAt < 60000) return;
  const ingest = resolve('ingestMetricUseCase') as IngestUseCase | null;
  if (!ingest) {
    logger?.warn('system metrics collector unavailable', { reason: 'ingest use case missing', correlationId });
    return;
  }
  const resolvedWorkspaceId = await resolveSystemWorkspaceId(resolve, workspaceId);
  if (!resolvedWorkspaceId) {
    logger?.warn('system metrics collector skipped', { reason: 'workspace not resolved', correlationId });
    return;
  }
  lastSnapshotAt = Date.now();
  const system = collectSystemMetrics();
  const context = createUseCaseContext({ correlationId, workspaceId: resolvedWorkspaceId });
  const common = { serverId: SYSTEM_SERVER_ID };
  const writes = [
    ingest.execute({ ...common, metricType: 'cpu', data: { model: system.cpuModel, vendor: '', sockets: 1, cores: system.cpuCores, threads: system.cpuCores, frequencyMinMhz: system.cpuSpeed, frequencyMaxMhz: system.cpuSpeed, frequencyCurrentMhz: system.cpuSpeed, loadAverage: [system.loadAverage1m, system.loadAverage5m, system.loadAverage15m], usagePercent: system.cpuUsagePercent, perCoreUsage: [], userPercent: 0, systemPercent: 0, idlePercent: Math.max(0, 100 - system.cpuUsagePercent), ioWaitPercent: 0, stealPercent: 0 } }, context),
    ingest.execute({ ...common, metricType: 'memory', data: { totalBytes: system.totalRamMB * 1024 * 1024, usedBytes: system.usedRamMB * 1024 * 1024, freeBytes: system.freeRamMB * 1024 * 1024, availableBytes: system.freeRamMB * 1024 * 1024, cachedBytes: 0, bufferBytes: 0, sharedBytes: 0, slabBytes: 0, swapTotalBytes: system.swapTotalMB * 1024 * 1024, swapUsedBytes: system.swapUsedMB * 1024 * 1024, swapFreeBytes: Math.max(0, system.swapTotalMB - system.swapUsedMB) * 1024 * 1024, memoryPressure: system.ramUsagePercent } }, context),
    ingest.execute({ ...common, metricType: 'disk', data: { device: '/', filesystem: system.filesystem, mountPoint: '/', totalBytes: system.totalDiskMB * 1024 * 1024, usedBytes: system.usedDiskMB * 1024 * 1024, availableBytes: system.freeDiskMB * 1024 * 1024, usedPercent: system.diskUsagePercent, inodeTotal: 0, inodeUsed: 0, inodeUsagePercent: system.inodeUsageAvailable ? system.inodeUsagePercent : null, readSpeedBps: system.diskIoAvailable ? system.diskReadBps : null, writeSpeedBps: system.diskIoAvailable ? system.diskWriteBps : null, ioAvailable: system.diskIoAvailable, ioWaitPercent: 0, smartStatus: null, topDirectories: system.diskTopDirectories, uptimeSeconds: system.uptimeSeconds, bootTime: system.bootTime } }, context),
    ingest.execute({ ...common, metricType: 'network', data: { interfaceName: system.network.interface, publicIpv4: system.network.ipv4, publicIpv6: system.network.ipv6 || null, macAddress: '', rxBytesPerSec: system.network.rateAvailable ? system.network.rxSpeed * 1024 * 1024 : null, txBytesPerSec: system.network.rateAvailable ? system.network.txSpeed * 1024 * 1024 : null, packetLossPercent: system.network.packetLossAvailable ? system.network.packetLossPercent : null, latencyMs: system.network.latencyAvailable ? system.network.latencyMs : null, connectionCount: 0, establishedCount: 0, rateAvailable: system.network.rateAvailable, packetLossAvailable: system.network.packetLossAvailable, latencyAvailable: system.network.latencyAvailable, rxBytes: system.network.rxBytes, txBytes: system.network.txBytes, interfaces: system.networkInterfaces, uptimeSeconds: system.uptimeSeconds, bootTime: system.bootTime } }, context),
    ...system.serviceDetails.map((service) => ingest.execute({ ...common, metricType: 'service', data: { serviceName: service.name, status: service.activeState, enabled: service.enabledState === 'enabled', activeState: service.activeState, subState: 'observed', observedAt: service.observedAt, uptimeSeconds: system.uptimeSeconds, bootTime: system.bootTime } }, context)),
  ];
  const results = await Promise.allSettled(writes);
  const rejected = results.filter((result) => result.status === 'rejected').length;
  logger?.info('system metrics snapshot completed', { correlationId, workspaceId: resolvedWorkspaceId, writes: results.length - rejected, rejected });
}

export function startSystemMetricsCollector(di: DI, logger?: CollectorLogger): () => void {
  let stopped = false;
  let timer: ReturnType<typeof setTimeout> | null = null;
  const run = (correlationId: string) => {
    logger?.info('system metrics collector tick', { correlationId });
    void recordSystemMetricsSnapshot((key) => di.resolve(key), correlationId, 'default', logger).catch((error: unknown) => {
      logger?.warn('system metrics collector tick failed', { correlationId, error: error instanceof Error ? error.message : String(error) });
    });
  };
  const schedule = () => {
    timer = setTimeout(() => {
      if (stopped) return;
      run(`system-collector-${Date.now()}`);
      schedule();
    }, 60000);
  };
  run('system-collector-startup');
  schedule();
  return () => {
    stopped = true;
    if (timer) clearTimeout(timer);
  };
}
