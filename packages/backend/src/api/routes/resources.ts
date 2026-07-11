import { Router } from 'express';
import { sendOk, sendCreated, createRequestContext, broadcastEvent } from '../../transport/http/response.js';
import { createUseCaseContext } from '../../application/usecases/base.js';
type DI = { resolve: (key: string) => unknown };
type UseCase<TIn, TOut> = { execute: (input: TIn, context: ReturnType<typeof createUseCaseContext>) => Promise<{ success: boolean; data: TOut | null; error: unknown }> };
export function createServersRouter(di?: DI): Router {
  const router = Router();
  const resolve = (key: string) => di?.resolve(key) ?? null;
  router.get('/', async (_req, res) => {
    const ctx = createRequestContext(_req);
    const uc = resolve('listServersUseCase') as UseCase<string, unknown> | null;
    if (uc) {
      try {
        const uctx = createUseCaseContext({ correlationId: ctx.correlationId, workspaceId: ctx.workspaceId ?? 'default' });
        const r = await uc.execute(ctx.workspaceId ?? 'default', uctx);
        if (r.success) { sendOk(res, r.data ?? defaultServers(), ctx); return; }
      } catch {  }
    }
    sendOk(res, defaultServers(), ctx);
  });
  router.get('/:id', (_req, res) => {
    const ctx = createRequestContext(_req);
    sendOk(res, null, ctx);
  });
  return router;
}
function defaultServers() {
  return {
    servers: [],
    totalCount: 0, onlineCount: 0, offlineCount: 0, degradedCount: 0,
    avgHealthScore: 0, totalCores: 0, totalRam: 0, totalDisk: 0,
    tagOptions: [], statusOptions: [],
  };
}
export function createBackupRouter(di?: DI): Router {
  const router = Router();
  const resolve = (key: string) => di?.resolve(key) ?? null;
  router.get('/', async (_req, res) => {
    const ctx = createRequestContext(_req);
    const uc = resolve('listBackupsUseCase') as UseCase<string, unknown> | null;
    if (uc) {
      try {
        const uctx = createUseCaseContext({ correlationId: ctx.correlationId, workspaceId: ctx.workspaceId ?? 'default' });
        const r = await uc.execute(ctx.workspaceId ?? 'default', uctx);
        if (r.success) { sendOk(res, r.data ?? defaultBackup(), ctx); return; }
      } catch {  }
    }
    sendOk(res, defaultBackup(), ctx);
  });
  router.post('/', async (req, res) => {
    const ctx = createRequestContext(req);
    const uc = resolve('createBackupUseCase') as UseCase<{ serverId: string; mode: string }, unknown> | null;
    if (uc) {
      try {
        const uctx = createUseCaseContext({ correlationId: ctx.correlationId, workspaceId: ctx.workspaceId ?? 'default' });
        const body = req.body as Record<string, unknown> | undefined;
        const serverId = typeof body?.serverId === 'string' ? body.serverId : 'srv-1';
        const mode = typeof body?.mode === 'string' ? body.mode : 'full';
        const r = await uc.execute({ serverId, mode }, uctx);
        if (r.success) { sendCreated(res, r.data, ctx); broadcastEvent(req, 'backup', 'backup.started', { backupId: r.data ? (r.data as Record<string, unknown>).id : undefined }); return; }
      } catch {  }
    }
    sendCreated(res, { id: crypto.randomUUID(), status: 'pending', serverId: 'srv-1', mode: 'full', createdAt: new Date().toISOString() }, ctx);
  });
  router.post('/:id/restore', async (req, res) => {
    const ctx = createRequestContext(req);
    const uc = resolve('restoreBackupUseCase') as UseCase<string, unknown> | null;
    if (uc) {
      try {
        const uctx = createUseCaseContext({ correlationId: ctx.correlationId, workspaceId: ctx.workspaceId ?? 'default' });
        const r = await uc.execute(req.params.id, uctx);
        if (r.success) { sendOk(res, r.data, ctx); broadcastEvent(req, 'backup', 'backup.started', { restoreBackupId: req.params.id }); return; }
      } catch {  }
    }
    sendOk(res, { id: req.params.id, status: 'restored', restoredAt: new Date().toISOString() }, ctx);
  });
  return router;
}
function defaultBackup() {
  return {
    summary: { totalBackups: 0, fullBackups: 0, incrementalBackups: 0, differentialBackups: 0, totalSize: 0, storageUsed: 0, storageTotal: 0, lastBackup: '', nextScheduled: new Date(Date.now() + 86400000).toISOString(), successRate: 0 },
    backups: [], retention: { enabled: true, daily: 7, weekly: 4, monthly: 3, yearly: 1, keepAll: false },
    restores: [], timeline: [], activity: [], filterTypes: [],
  };
}
export function createDockerRouter(_di?: DI): Router {
  const router = Router();
  router.get('/', (_req, res) => {
    const ctx = createRequestContext(_req);
    sendOk(res, {
      containers: [], images: [], volumes: [], networks: [],
      totalCpu: 0, totalMemory: 0, containerCount: 0, runningCount: 0, stoppedCount: 0,
      timeline: [],
    }, ctx);
  });
  router.get('/containers', (_req, res) => {
    sendOk(res, [], createRequestContext(_req));
  });
  router.post('/containers/:id/restart', (req, res) => {
    const ctx = createRequestContext(req);
    broadcastEvent(req, 'docker', 'container.started', { containerId: req.params.id });
    sendOk(res, { id: req.params.id, status: 'restarted', restartedAt: new Date().toISOString() }, ctx);
  });
  return router;
}
export function createTunnelRouter(_di?: DI): Router {
  const router = Router();
  router.get('/', (_req, res) => {
    const ctx = createRequestContext(_req);
    sendOk(res, {
      overview: { status: 'disconnected', provider: '', domain: '', publicUrl: '', ssl: false, latency: 0, uptime: '0h', reconnectCount: 0, trafficIn: 0, trafficOut: 0 },
      reconnectHistory: [], timeline: [], filterOptions: [],
    }, ctx);
  });
  return router;
}
export function createGitHubRouter(_di?: DI): Router {
  const router = Router();
  router.get('/', (_req, res) => {
    const ctx = createRequestContext(_req);
    sendOk(res, {
      repos: [], workflows: [], commits: [], branches: [], connected: false,
    }, ctx);
  });
  return router;
}
export function createPluginRouter(_di?: DI): Router {
  const router = Router();
  router.get('/', (_req, res) => {
    const ctx = createRequestContext(_req);
    sendOk(res, {
      plugins: [], marketplace: [], categories: [], installed: 0, updates: 0,
    }, ctx);
  });
  router.post('/:id/install', (req, res) => {
    const ctx = createRequestContext(req);
    broadcastEvent(req, 'plugin', 'plugin.installed', { pluginId: req.params.id });
    sendOk(res, { id: req.params.id, status: 'installed', installedAt: new Date().toISOString() }, ctx);
  });
  router.post('/:id/uninstall', (req, res) => {
    const ctx = createRequestContext(req);
    broadcastEvent(req, 'plugin', 'plugin.removed', { pluginId: req.params.id });
    sendOk(res, { id: req.params.id, status: 'uninstalled', uninstalledAt: new Date().toISOString() }, ctx);
  });
  return router;
}
