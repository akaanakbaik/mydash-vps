import { Router } from 'express';
import { sendOk, sendError, createRequestContext, broadcastEvent } from '../../transport/http/response.js';
import { createUseCaseContext } from '../../application/usecases/base.js';

type DI = { resolve: (key: string) => unknown };
type UseCase<TIn, TOut> = { execute: (input: TIn, context: ReturnType<typeof createUseCaseContext>) => Promise<{ success: boolean; data: TOut | null; error: unknown }> };

export function createAuthRouter(di?: DI): Router {
  const router = Router();
  const resolve = (key: string) => di?.resolve(key) ?? null;

  router.post('/login', async (req, res) => {
    const ctx = createRequestContext(req);
    const { workspaceId, password } = (req.body ?? {}) as { workspaceId?: string; password?: string };

    if (!password) {
      sendError(res, 422, 'VALIDATION_ERROR', 'Password is required', ctx);
      return;
    }

    const uc = resolve('loginUseCase') as UseCase<{ workspaceId: string; password: string }, unknown> | null;
    if (uc) {
      try {
        const uctx = createUseCaseContext({ correlationId: ctx.correlationId, workspaceId: workspaceId ?? 'default' });
        const result = await uc.execute({ workspaceId: workspaceId ?? 'default', password }, uctx);
        if (result.success && result.data) { 
          const loginData = result.data as { user?: { id?: string } };
          sendOk(res, result.data, ctx); 
          broadcastEvent(req, 'session', 'session.created', { userId: loginData.user?.id ?? 'anonymous' }); 
          return; 
        }
      } catch { /* fall through */ }
    }

    sendError(res, 503, 'SERVICE_UNAVAILABLE', 'Auth service not initialized', ctx);
  });

  router.post('/logout', async (req, res) => {
    const ctx = createRequestContext(req);
    const uc = resolve('logoutUseCase') as UseCase<string, void> | null;
    if (uc) {
      try {
        const token = req.headers.authorization?.replace('Bearer ', '') ?? '';
        const uctx = createUseCaseContext({ correlationId: ctx.correlationId, workspaceId: ctx.workspaceId ?? 'default' });
        await uc.execute(token, uctx);
        sendOk(res, { message: 'Logged out' }, ctx);
        broadcastEvent(req, 'session', 'session.expired', { userId: req.auth?.userId ?? 'unknown' });
        return;
      } catch { /* fall through */ }
    }
    sendError(res, 503, 'SERVICE_UNAVAILABLE', 'Auth service not initialized', ctx);
  });

  router.post('/refresh', (_req, res) => {
    const ctx = createRequestContext(_req);
    const uc = resolve('validateSessionUseCase') as UseCase<string, unknown> | null;
    if (uc) {
      sendOk(res, { message: 'Session refreshed' }, ctx);
      return;
    }
    sendError(res, 503, 'SERVICE_UNAVAILABLE', 'Auth service not initialized', ctx);
  });

  router.get('/session', async (req, res) => {
    const ctx = createRequestContext(req);
    const token = req.headers.authorization?.replace('Bearer ', '') ?? '';
    const uc = resolve('validateSessionUseCase') as UseCase<string, unknown> | null;

    if (uc && token) {
      try {
        const uctx = createUseCaseContext({ correlationId: ctx.correlationId, workspaceId: ctx.workspaceId ?? 'default' });
        const result = await uc.execute(token, uctx);
        if (result.success && result.data) {
          sendOk(res, { authenticated: true, user: result.data }, ctx);
          return;
        }
      } catch { /* fall through */ }
    }

    sendOk(res, { authenticated: false, user: null }, ctx);
  });

  return router;
}

export function createRolesRouter(di?: DI): Router {
  const router = Router();
  const resolve = (key: string) => di?.resolve(key) ?? null;

  router.get('/', async (_req, res) => {
    const ctx = createRequestContext(_req);
    const uc = resolve('listRolesUseCase') as UseCase<void, unknown> | null;
    if (uc) {
      try {
        const uctx = createUseCaseContext({ correlationId: ctx.correlationId, workspaceId: ctx.workspaceId ?? 'default' });
        const result = await uc.execute(undefined, uctx);
        if (result.success && result.data) { sendOk(res, result.data, ctx); return; }
      } catch { /* fall through */ }
    }
    sendError(res, 503, 'SERVICE_UNAVAILABLE', 'Roles service not initialized', ctx);
  });

  router.get('/:id', (req, res) => {
    const ctx = createRequestContext(req);
    sendError(res, 503, 'SERVICE_UNAVAILABLE', 'Roles service not initialized', ctx);
  });

  return router;
}
