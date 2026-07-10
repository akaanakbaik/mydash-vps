import { Router } from 'express';
import { sendOk, createRequestContext, broadcastEvent } from '../../transport/http/response.js';
import { createUseCaseContext } from '../../application/usecases/base.js';

type DI = { resolve: (key: string) => unknown };
type UseCase<TIn, TOut> = { execute: (input: TIn, context: ReturnType<typeof createUseCaseContext>) => Promise<{ success: boolean; data: TOut | null; error: unknown }> };

export function createNotificationRouter(di?: DI): Router {
  const router = Router();
  const resolve = (key: string) => di?.resolve(key) ?? null;

  router.get('/', async (_req, res) => {
    const ctx = createRequestContext(_req);
    const uc = resolve('dispatchNotificationsUseCase') as UseCase<{ serverId: string }, unknown> | null;
    if (uc) {
      try {
        const uctx = createUseCaseContext({ correlationId: ctx.correlationId, workspaceId: ctx.workspaceId ?? 'default' });
        const r = await uc.execute({ serverId: 'srv-1' }, uctx);
        if (r.success) { sendOk(res, r.data ?? [], ctx); return; }
      } catch { /* fall through */ }
    }
    sendOk(res, [], ctx);
  });

  return router;
}

export function createAutomationRouter(di?: DI): Router {
  const router = Router();
  const resolve = (key: string) => di?.resolve(key) ?? null;

  router.get('/', async (_req, res) => {
    const ctx = createRequestContext(_req);
    const listUc = resolve('listAutomationsUseCase') as UseCase<string, unknown> | null;
    let workflows: unknown[] = [];

    if (listUc) {
      try {
        const uctx = createUseCaseContext({ correlationId: ctx.correlationId, workspaceId: ctx.workspaceId ?? 'default' });
        const r = await listUc.execute(ctx.workspaceId ?? 'default', uctx);
        if (r.success && Array.isArray(r.data)) workflows = r.data;
      } catch { /* use defaults */ }
    }

    sendOk(res, {
      summary: { totalWorkflows: 0, activeWorkflows: 0, totalExecutions: 0, successRate: 0, avgDuration: 0, failedToday: 0 },
      workflows,
      executions: [],
      timeline: [],
      activity: [],
      queue: { pending: 0, running: 0, completed: 0, failed: 0, throughput: 0, avgWaitTime: 0 },
      scheduler: { type: 'cron', cron: '0 3 * * *', timezone: 'UTC', nextRun: new Date(Date.now() + 86400000).toISOString(), lastRun: new Date().toISOString() },
    }, ctx);
  });

  router.post('/workflows/:id/trigger', async (req, res) => {
    const ctx = createRequestContext(req);
    const execUc = resolve('executeAutomationUseCase') as UseCase<{ automationId: string; serverId: string; triggerEvent: unknown }, unknown> | null;

    if (execUc) {
      try {
        const uctx = createUseCaseContext({ correlationId: ctx.correlationId, workspaceId: ctx.workspaceId ?? 'default' });
        const r = await execUc.execute({ automationId: req.params.id, serverId: 'srv-1', triggerEvent: { source: 'api' } }, uctx);
        if (r.success) { sendOk(res, r.data, ctx); broadcastEvent(req, 'automation', 'automation.started', { workflowId: req.params.id }); return; }
      } catch { /* fall through */ }
    }

    sendOk(res, { id: req.params.id, status: 'triggered', triggeredAt: new Date().toISOString() }, ctx);
  });

  return router;
}

export function createSecurityRouter(di?: DI): Router {
  const router = Router();
  const resolve = (key: string) => di?.resolve(key) ?? null;

  router.get('/', async (_req, res) => {
    const ctx = createRequestContext(_req);
    const uc = resolve('getSecurityEventsUseCase') as UseCase<{ workspaceId: string; limit?: number }, unknown> | null;
    if (uc) {
      try {
        const uctx = createUseCaseContext({ correlationId: ctx.correlationId, workspaceId: ctx.workspaceId ?? 'default' });
        const r = await uc.execute({ workspaceId: ctx.workspaceId ?? 'default' }, uctx);
        if (r.success) { sendOk(res, r.data ?? [], ctx); return; }
      } catch { /* fall through */ }
    }
    sendOk(res, [], ctx);
  });

  return router;
}

export function createAuditRouter(di?: DI): Router {
  const router = Router();
  const resolve = (key: string) => di?.resolve(key) ?? null;

  router.get('/', async (_req, res) => {
    const ctx = createRequestContext(_req);
    const uc = resolve('getAuditRecordsUseCase') as UseCase<{ workspaceId: string; limit?: number }, unknown> | null;
    if (uc) {
      try {
        const uctx = createUseCaseContext({ correlationId: ctx.correlationId, workspaceId: ctx.workspaceId ?? 'default' });
        const r = await uc.execute({ workspaceId: ctx.workspaceId ?? 'default' }, uctx);
        if (r.success) { sendOk(res, r.data ?? [], ctx); return; }
      } catch { /* fall through */ }
    }
    sendOk(res, [], ctx);
  });

  return router;
}

export function createSettingsRouter(di?: DI): Router {
  const router = Router();
  const resolve = (key: string) => di?.resolve(key) ?? null;

  router.get('/', async (_req, res) => {
    const ctx = createRequestContext(_req);
    const uc = resolve('getConfigurationUseCase') as UseCase<string, unknown> | null;
    if (uc) {
      try {
        const uctx = createUseCaseContext({ correlationId: ctx.correlationId, workspaceId: ctx.workspaceId ?? 'default' });
        const r = await uc.execute(ctx.workspaceId ?? 'default', uctx);
        if (r.success) { sendOk(res, r.data ?? {}, ctx); return; }
      } catch { /* fall through */ }
    }
    sendOk(res, {
      theme: 'dark', language: 'en', timezone: 'UTC', notifications: { email: false, telegram: false, slack: false },
      updatedAt: new Date().toISOString(),
    }, ctx);
  });

  router.patch('/', async (req, res) => {
    const ctx = createRequestContext(req);
    const uc = resolve('updateConfigurationUseCase') as UseCase<{ workspaceId: string; config: unknown }, void> | null;
    if (uc) {
      try {
        const uctx = createUseCaseContext({ correlationId: ctx.correlationId, workspaceId: ctx.workspaceId ?? 'default' });
        await uc.execute({ workspaceId: ctx.workspaceId ?? 'default', config: req.body }, uctx);
        sendOk(res, { ...(req.body as Record<string, unknown>), updatedAt: new Date().toISOString() }, ctx);
        broadcastEvent(req, 'settings', 'settings.updated', { updates: req.body as Record<string, unknown> });
        return;
      } catch { /* fall through */ }
    }
    sendOk(res, { ...(req.body as Record<string, unknown>), updatedAt: new Date().toISOString() }, ctx);
  });

  return router;
}

export function createProfileRouter(_di?: DI): Router {
  const router = Router();

  router.get('/', (_req, res) => {
    const ctx = createRequestContext(_req);
    const auth = (_req as unknown as Record<string, unknown>).auth as Record<string, unknown> | undefined;
    sendOk(res, {
      name: 'User', email: 'user@example.com', role: auth?.role ?? 'user',
      avatar: null, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
    }, ctx);
  });

  router.patch('/', (req, res) => {
    const ctx = createRequestContext(req);
    broadcastEvent(req, 'profile', 'profile.updated', { updates: req.body as Record<string, unknown> });
    sendOk(res, { ...(req.body as Record<string, unknown>), updatedAt: new Date().toISOString() }, ctx);
  });

  return router;
}

export function createSessionRouter(di?: DI): Router {
  const router = Router();
  const resolve = (key: string) => di?.resolve(key) ?? null;

  router.get('/', async (_req, res) => {
    const ctx = createRequestContext(_req);
    const uc = resolve('listSessionsUseCase') as UseCase<string, unknown> | null;
    if (uc) {
      try {
        const uctx = createUseCaseContext({ correlationId: ctx.correlationId, workspaceId: ctx.workspaceId ?? 'default' });
        const r = await uc.execute(ctx.workspaceId ?? 'default', uctx);
        if (r.success) { sendOk(res, r.data ?? [], ctx); return; }
      } catch { /* fall through */ }
    }
    sendOk(res, [], ctx);
  });

  router.post('/:id/revoke', (req, res) => {
    const ctx = createRequestContext(req);
    broadcastEvent(req, 'session', 'session.revoked', { sessionId: req.params.id });
    sendOk(res, { id: req.params.id, status: 'revoked', revokedAt: new Date().toISOString() }, ctx);
  });

  return router;
}
