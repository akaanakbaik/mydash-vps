import { Router } from 'express';
import { sendOk, sendError, createRequestContext } from '../../transport/http/response.js';
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
        if (result.success) { sendOk(res, result.data, ctx); return; }
      } catch { /* fall through to error */ }
    }

    sendError(res, 503, 'SERVICE_UNAVAILABLE', 'Monitoring service not initialized', ctx);
  });

  router.get('/:metric', async (req, res) => {
    const ctx = createRequestContext(req);
    const uc = resolve('getMetricWindowUseCase') as UseCase<{ serverId: string; windowMs: number }, unknown> | null;
    if (uc) {
      try {
        const uctx = createUseCaseContext({ correlationId: ctx.correlationId, workspaceId: ctx.workspaceId ?? 'default' });
        const r = await uc.execute({ serverId: req.params.metric, windowMs: 86400000 }, uctx);
        if (r.success) { sendOk(res, r.data, ctx); return; }
      } catch { /* fall through */ }
    }
    sendError(res, 503, 'SERVICE_UNAVAILABLE', 'Metric data service not initialized', ctx);
  });

  return router;
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
        if (r.success && r.data) {
          sendOk(res, r.data, ctx); return;
        }
      } catch { /* fall through to error */ }
    }

    sendError(res, 503, 'SERVICE_UNAVAILABLE', 'Dashboard service not initialized', ctx);
  });
  return router;
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
      } catch { /* fall through to error */ }
    }

    sendError(res, 503, 'SERVICE_UNAVAILABLE', 'Analytics service not initialized', ctx);
  });
  return router;
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
      } catch { /* fall through to error */ }
    }

    sendError(res, 503, 'SERVICE_UNAVAILABLE', 'Health service not initialized', ctx);
  });
  return router;
}
