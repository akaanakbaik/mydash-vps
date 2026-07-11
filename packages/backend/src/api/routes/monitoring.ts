import { Router } from 'express';
import { sendOk, createRequestContext } from '../../transport/http/response.js';
import { createUseCaseContext } from '../../application/usecases/base.js';
type DI = { resolve: (key: string) => unknown };
type UseCase<TIn, TOut> = { execute: (input: TIn, context: ReturnType<typeof createUseCaseContext>) => Promise<{ success: boolean; data: TOut | null; error: unknown }> };
export function createMonitoringRouter(di?: DI): Router {
  const router = Router();
  const resolve = (key: string) => di?.resolve(key) ?? null;
  router.get('/', async (_req, res) => {
    const ctx = createRequestContext(_req);
    const uc = resolve('getLatestMetricsUseCase') as UseCase<string, unknown> | null;
    if (uc) {
      try {
        const uctx = createUseCaseContext({ correlationId: ctx.correlationId, workspaceId: ctx.workspaceId ?? 'default' });
        const result = await uc.execute('srv-1', uctx);
        if (result.success) { sendOk(res, result.data ?? defaultMonitoring(), ctx); return; }
      } catch {  }
    }
    sendOk(res, defaultMonitoring(), ctx);
  });
  router.get('/:metric', async (req, res) => {
    const ctx = createRequestContext(req);
    const uc = resolve('getMetricWindowUseCase') as UseCase<{ serverId: string; windowMs: number }, unknown> | null;
    if (uc) {
      try {
        const uctx = createUseCaseContext({ correlationId: ctx.correlationId, workspaceId: ctx.workspaceId ?? 'default' });
        const r = await uc.execute({ serverId: req.params.metric, windowMs: 86400000 }, uctx);
        if (r.success) { sendOk(res, r.data ?? [], ctx); return; }
      } catch {  }
    }
    sendOk(res, [], ctx);
  });
  return router;
}
function defaultMonitoring() {
  return {
    cpu: { model: '', vendor: '', cores: 0, threads: 0, clockMin: 0, clockMax: 0, clockCurrent: 0, loadAverage: 0, usagePercent: 0, temperature: null, perCore: [] },
    memory: { total: 0, used: 0, available: 0, cached: 0, buffered: 0, swapTotal: 0, swapUsed: 0, usagePercent: 0 },
    disks: [], network: { interface: '', publicIpv4: '', publicIpv6: '', rxBytes: 0, txBytes: 0, rxSpeed: 0, txSpeed: 0, packetLoss: 0, latency: 0, connections: 0 },
    docker: { containerCount: 0, running: 0, stopped: 0, cpuPercent: 0, memoryPercent: 0, restartCount: 0, health: 'healthy' as const },
    tunnel: { provider: '', status: 'disconnected' as const, domain: '', ssl: false, latency: 0, reconnectCount: 0, uptime: '0h' },
    services: [], timeline: [],
    collection: { status: 'idle' as const, lastUpdated: new Date().toISOString(), errorCount: 0, errors: [], summary: 'No data collected', nextCollection: new Date(Date.now() + 60000).toISOString() },
    categories: [],
  };
}
export function createDashboardRouter(di?: DI): Router {
  const router = Router();
  const resolve = (key: string) => di?.resolve(key) ?? null;
  router.get('/', async (_req, res) => {
    const ctx = createRequestContext(_req);
    const healthUc = resolve('getHealthScoreUseCase') as UseCase<{ serverId: string }, unknown> | null;
    if (healthUc) {
      try {
        const uctx = createUseCaseContext({ correlationId: ctx.correlationId, workspaceId: ctx.workspaceId ?? 'default' });
        const r = await healthUc.execute({ serverId: 'srv-1' }, uctx);
        if (r.success && r.data) { sendOk(res, r.data, ctx); return; }
      } catch {  }
    }
    sendOk(res, defaultDashboard(), ctx);
  });
  return router;
}
function defaultDashboard() {
  return {
    server: { hostname: 'localhost', os: 'Linux', uptime: '0h 0m', cpuCores: 4, cpuModel: 'Virtual CPU', totalRam: 8192, usedRam: 0, totalDisk: 102400, usedDisk: 0, agentVersion: '1.0.0' },
    health: { score: 0, grade: 'N/A', trend: 'stable' as const, factors: [] },
    resources: [
      { label: 'CPU', used: 0, total: 100, percent: 0, unit: '%', trend: 'stable' as const },
      { label: 'Memory', used: 0, total: 8192, percent: 0, unit: 'MB', trend: 'stable' as const },
      { label: 'Disk', used: 0, total: 102400, percent: 0, unit: 'MB', trend: 'stable' as const },
    ],
    notificationSummary: { total: 0, unread: 0, failed: 0, lastDelivery: new Date().toISOString() },
    automationSummary: { active: 0, successRate: 0, running: 0, failed: 0, lastRun: new Date().toISOString() },
    activeAlerts: [], recentActivity: [],
    quickActions: [
      { label: 'View Servers', icon: 'server', description: 'Manage your servers', to: '/servers' },
      { label: 'Check Health', icon: 'heart', description: 'View health scores', to: '/health' },
      { label: 'Settings', icon: 'settings', description: 'Configure system', to: '/settings' },
    ],
  };
}
export function createAnalyticsRouter(di?: DI): Router {
  const router = Router();
  const resolve = (key: string) => di?.resolve(key) ?? null;
  router.get('/', async (_req, res) => {
    const ctx = createRequestContext(_req);
    const uc = resolve('getAnalyticsSummaryUseCase') as UseCase<{ serverId: string; windowMs: number }, unknown> | null;
    if (uc) {
      try {
        const uctx = createUseCaseContext({ correlationId: ctx.correlationId, workspaceId: ctx.workspaceId ?? 'default' });
        const r = await uc.execute({ serverId: 'srv-1', windowMs: 86400000 }, uctx);
        if (r.success && r.data) { sendOk(res, r.data, ctx); return; }
      } catch {  }
    }
    sendOk(res, defaultAnalytics(), ctx);
  });
  return router;
}
function defaultAnalytics() {
  return {
    summary: { totalMetrics: 0, metricsCollected: 0, metricsFailed: 0, storageUsed: 0, storageTotal: 0, oldestTimestamp: new Date().toISOString(), newestTimestamp: new Date().toISOString() },
    aggregations: [], trend: [], anomalies: [], statistics: [], percentiles: [],
    predictions: [], efficiency: [], tableData: [], timeRange: '24h', categories: [],
  };
}
export function createHealthRouter(di?: DI): Router {
  const router = Router();
  const resolve = (key: string) => di?.resolve(key) ?? null;
  router.get('/', async (_req, res) => {
    const ctx = createRequestContext(_req);
    const uc = resolve('getHealthScoreUseCase') as UseCase<{ serverId: string }, unknown> | null;
    if (uc) {
      try {
        const uctx = createUseCaseContext({ correlationId: ctx.correlationId, workspaceId: ctx.workspaceId ?? 'default' });
        const r = await uc.execute({ serverId: 'srv-1' }, uctx);
        if (r.success && r.data) { sendOk(res, r.data, ctx); return; }
      } catch {  }
    }
    sendOk(res, {
      overall: { score: 0, grade: 'F' as const, category: 'critical' as const, trend: 'stable' as const, change1h: 0, change24h: 0 },
      categories: [], penalties: [],
      recovery: { state: 'stable' as const, progress: 0, estimatedRecovery: '', lastIncident: '', duration: '0h' },
      confidence: 0, grade: 'F' as const, timeline: [], history: [],
      lastUpdated: new Date().toISOString(),
    }, ctx);
  });
  return router;
}
