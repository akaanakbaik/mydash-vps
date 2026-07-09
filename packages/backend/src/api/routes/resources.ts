import { Router } from 'express';
import { sendOk, sendCreated, sendError, createRequestContext, broadcastEvent } from '../../transport/http/response.js';
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
        if (r.success) { sendOk(res, r.data, ctx); return; }
      } catch { /* fall through */ }
    }
    sendError(res, 503, 'SERVICE_UNAVAILABLE', 'Servers service not initialized', ctx);
  });

  router.get('/:id', (_req, res) => {
    const ctx = createRequestContext(_req);
    sendError(res, 503, 'SERVICE_UNAVAILABLE', 'Servers service not initialized', ctx);
  });

  return router;
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
        if (r.success) { sendOk(res, r.data, ctx); return; }
      } catch { /* fall through */ }
    }
    sendError(res, 503, 'SERVICE_UNAVAILABLE', 'Backup service not initialized', ctx);
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
      } catch { /* fall through */ }
    }
    sendError(res, 503, 'SERVICE_UNAVAILABLE', 'Backup service not initialized', ctx);
  });

  router.post('/:id/restore', async (req, res) => {
    const ctx = createRequestContext(req);
    const uc = resolve('restoreBackupUseCase') as UseCase<string, unknown> | null;
    if (uc) {
      try {
        const uctx = createUseCaseContext({ correlationId: ctx.correlationId, workspaceId: ctx.workspaceId ?? 'default' });
        const r = await uc.execute(req.params.id, uctx);
        if (r.success) { sendOk(res, r.data, ctx); broadcastEvent(req, 'backup', 'backup.started', { restoreBackupId: req.params.id }); return; }
      } catch { /* fall through */ }
    }
    sendError(res, 503, 'SERVICE_UNAVAILABLE', 'Backup restore service not initialized', ctx);
  });

  return router;
}

export function createDockerRouter(di?: DI): Router {
  const router = Router();
  const resolve = (key: string) => di?.resolve(key) ?? null;

  router.get('/', async (_req, res) => {
    const ctx = createRequestContext(_req);
    const uc = resolve('listContainersUseCase') as UseCase<string, unknown> | null;
    if (uc) {
      try {
        const uctx = createUseCaseContext({ correlationId: ctx.correlationId, workspaceId: ctx.workspaceId ?? 'default' });
        const r = await uc.execute('srv-1', uctx);
        if (r.success) { sendOk(res, r.data, ctx); return; }
      } catch { /* fall through */ }
    }
    sendError(res, 503, 'SERVICE_UNAVAILABLE', 'Docker service not initialized', ctx);
  });

  router.get('/containers', (_req, res) => {
    sendError(res, 503, 'SERVICE_UNAVAILABLE', 'Docker service not initialized', createRequestContext(_req));
  });

  router.post('/containers/:id/restart', (req, res) => {
    const ctx = createRequestContext(req);
    broadcastEvent(req, 'docker', 'container.started', { containerId: req.params.id });
    sendError(res, 503, 'SERVICE_UNAVAILABLE', 'Docker service not initialized', ctx);
  });

  return router;
}

export function createTunnelRouter(di?: DI): Router {
  const router = Router();
  const resolve = (key: string) => di?.resolve(key) ?? null;

  router.get('/', async (_req, res) => {
    const ctx = createRequestContext(_req);
    const uc = resolve('getTunnelConfigUseCase') as UseCase<string, unknown> | null;
    if (uc) {
      try {
        const uctx = createUseCaseContext({ correlationId: ctx.correlationId, workspaceId: ctx.workspaceId ?? 'default' });
        const r = await uc.execute(ctx.workspaceId ?? 'default', uctx);
        if (r.success) { sendOk(res, r.data, ctx); return; }
      } catch { /* fall through */ }
    }
    sendError(res, 503, 'SERVICE_UNAVAILABLE', 'Tunnel service not initialized', ctx);
  });

  return router;
}

export function createGitHubRouter(di?: DI): Router {
  const router = Router();
  const resolve = (key: string) => di?.resolve(key) ?? null;

  router.get('/', async (_req, res) => {
    const ctx = createRequestContext(_req);
    const uc = resolve('getGithubReposUseCase') as UseCase<string, unknown> | null;
    if (uc) {
      try {
        const uctx = createUseCaseContext({ correlationId: ctx.correlationId, workspaceId: ctx.workspaceId ?? 'default' });
        const r = await uc.execute(ctx.workspaceId ?? 'default', uctx);
        if (r.success) { sendOk(res, r.data, ctx); return; }
      } catch { /* fall through */ }
    }
    sendError(res, 503, 'SERVICE_UNAVAILABLE', 'GitHub service not initialized', ctx);
  });

  return router;
}

export function createPluginRouter(di?: DI): Router {
  const router = Router();
  const resolve = (key: string) => di?.resolve(key) ?? null;

  router.get('/', async (_req, res) => {
    const ctx = createRequestContext(_req);
    const uc = resolve('listPluginsUseCase') as UseCase<void, unknown> | null;
    if (uc) {
      try {
        const uctx = createUseCaseContext({ correlationId: ctx.correlationId, workspaceId: ctx.workspaceId ?? 'default' });
        const r = await uc.execute(undefined, uctx);
        if (r.success) { sendOk(res, r.data, ctx); return; }
      } catch { /* fall through */ }
    }
    sendError(res, 503, 'SERVICE_UNAVAILABLE', 'Plugin service not initialized', ctx);
  });

  router.post('/:id/install', (req, res) => {
    const ctx = createRequestContext(req);
    broadcastEvent(req, 'plugin', 'plugin.installed', { pluginId: req.params.id });
    sendError(res, 503, 'SERVICE_UNAVAILABLE', 'Plugin service not initialized', ctx);
  });

  router.post('/:id/uninstall', (req, res) => {
    const ctx = createRequestContext(req);
    broadcastEvent(req, 'plugin', 'plugin.removed', { pluginId: req.params.id });
    sendError(res, 503, 'SERVICE_UNAVAILABLE', 'Plugin service not initialized', ctx);
  });

  return router;
}
