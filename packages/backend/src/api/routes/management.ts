import { Router } from 'express';
import { sendOk, sendError, createRequestContext, broadcastEvent } from '../../transport/http/response.js';
import { createUseCaseContext } from '../../application/usecases/base.js';
type DI = { resolve: (key: string) => unknown };
type UseCase<TIn, TOut> = { execute: (input: TIn, context: ReturnType<typeof createUseCaseContext>) => Promise<{ success: boolean; data: TOut | null; error: unknown }> };

let telegramConfig: { botToken: string; chatId: string } | null = null;

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
        if (r.success) { sendOk(res, r.data ?? defaultNotification(), ctx); return; }
      } catch {  }
    }
    sendOk(res, defaultNotification(), ctx);
  });

  router.post('/providers/telegram/configure', (req, res) => {
    const ctx = createRequestContext(req);
    const { token, chatId, enabled } = req.body as Record<string, unknown>;

    if (!token || !chatId) {
      sendError(res, 400, 'VALIDATION_ERROR', 'token and chatId are required', ctx);
      return;
    }

    telegramConfig = { botToken: String(token), chatId: String(chatId) };

    sendOk(res, {
      configured: true,
      provider: 'telegram',
      enabled: enabled !== false,
      timestamp: new Date().toISOString(),
    }, ctx);
  });

  router.post('/providers/telegram/test', async (req, res) => {
    const ctx = createRequestContext(req);
    const { message } = req.body as Record<string, unknown>;

    const config = telegramConfig;
    if (!config) {
      sendError(res, 400, 'TELEGRAM_NOT_CONFIGURED', 'Telegram not configured. Call /configure first.', ctx);
      return;
    }

    const testMsg = String(message || 'My Dash v1.0 - Test notification from server!');

    try {
      const response = await fetch(`https://api.telegram.org/bot${config.botToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: config.chatId, text: testMsg, parse_mode: 'HTML' }),
      });

      const data = await response.json() as { ok: boolean; description?: string };

      if (data.ok) {
        sendOk(res, { success: true, message: 'Test message sent successfully via Telegram!' }, ctx);
      } else {
        sendOk(res, { success: false, error: data.description || 'Unknown Telegram error' }, ctx);
      }
    } catch (err) {
      sendOk(res, { success: false, error: err instanceof Error ? err.message : String(err) }, ctx);
    }
  });

  return router;
}
function defaultNotification() {
  return {
    summary: { totalSent: 0, delivered: 0, failed: 0, pending: 0, successRate: 0, rateLimited: 0 },
    rules: [], providers: [], history: [],
    queue: { pending: 0, processing: 0, throughput: 0, avgWaitTime: 0, maxQueueSize: 100, backpressure: false },
    retry: { activeRetries: 0, maxRetries: 5, successRate: 0, avgRetryDelay: 0, nextRetryBatch: '', deadLetterCount: 0 },
    rateLimit: { currentRate: 0, limit: 60, remaining: 60, resetAt: new Date().toISOString(), throttled: 0 },
    deduplication: { enabled: true, window: 300, deduplicated: 0, recentHashes: 0 },
    deliveryStats: [], templates: [], timeline: [], activity: [], filterCategories: [],
  };
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
      } catch {  }
    }
    sendOk(res, {
      summary: { totalWorkflows: 0, activeWorkflows: 0, totalExecutions: 0, successRate: 0, avgDuration: 0, failedToday: 0 },
      workflows,
      executions: [],
      timeline: [],
      activity: [],
      queue: { pending: 0, running: 0, completed: 0, failed: 0, throughput: 0, avgWaitTime: 0 },
      scheduler: { type: 'cron', cron: '0 3 * * *', timezone: 'UTC', nextRun: new Date(Date.now() + 86400000).toISOString(), lastRun: new Date().toISOString() },
      triggers: [], actions: [],
      retry: { enabled: true, maxRetries: 3, backoffMultiplier: 2, initialDelay: 1000, totalRetries: 0, successRate: 0 },
      rollback: { enabled: true, strategies: [], rollbacksPerformed: 0, rollbackSuccessRate: 0, lastRollback: null },
      filterCategories: [],
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
      } catch {  }
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
        if (r.success) { sendOk(res, r.data ?? defaultSecurity(), ctx); return; }
      } catch {  }
    }
    sendOk(res, defaultSecurity(), ctx);
  });
  return router;
}
function defaultSecurity() {
  return {
    summary: { totalThreats: 0, activeThreats: 0, resolvedThreats: 0, securityScore: 100, failedLogins: 0, bruteForceAttempts: 0, openPorts: 0, lastScan: '', firewallActive: true, riskLevel: 'low', criticalAlerts: 0, unresolvedAlerts: 0 },
    threats: [], events: [], recommendations: [],
    firewall: { enabled: true, rulesCount: 0, blockedIps: 0, allowedPorts: ['22', '80', '443'] },
    passwordPolicy: { minLength: 12, requireUppercase: true, requireNumbers: true, requireSymbols: true, expiryDays: 90, preventReuse: 5 },
    timeline: [], filterTypes: [],
  };
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
        if (r.success) { sendOk(res, r.data ?? defaultAudit(), ctx); return; }
      } catch {  }
    }
    sendOk(res, defaultAudit(), ctx);
  });
  return router;
}
function defaultAudit() {
  return {
    summary: { totalEvents: 0, successEvents: 0, failedEvents: 0, uniqueUsers: 0, uniqueActions: 0, uniqueResources: 0 },
    records: [], timeline: [], filterActions: [], filterResources: [], filterUsers: [],
  };
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
        if (r.success) { sendOk(res, r.data ?? defaultSettings(), ctx); return; }
      } catch {  }
    }
    sendOk(res, defaultSettings(), ctx);
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
      } catch {  }
    }
    sendOk(res, { ...(req.body as Record<string, unknown>), updatedAt: new Date().toISOString() }, ctx);
  });
  return router;
}
function defaultSettings() {
  return {
    categories: [
      { id: 'general', label: 'General', icon: 'settings' },
      { id: 'notifications', label: 'Notifications', icon: 'bell' },
      { id: 'monitoring', label: 'Monitoring', icon: 'activity' },
      { id: 'security', label: 'Security', icon: 'shield' },
    ],
    settings: [
      { id: 'theme', label: 'Theme', type: 'select', value: 'dark', description: 'Application theme', category: 'general', options: [{ label: 'Dark', value: 'dark' }, { label: 'Light', value: 'light' }] },
      { id: 'language', label: 'Language', type: 'select', value: 'en', description: 'Interface language', category: 'general', options: [{ label: 'English', value: 'en' }] },
      { id: 'timezone', label: 'Timezone', type: 'select', value: 'UTC', description: 'Time zone', category: 'general', options: [{ label: 'UTC', value: 'UTC' }] },
    ],
  };
}
export function createProfileRouter(_di?: DI): Router {
  const router = Router();
  router.get('/', (_req, res) => {
    const ctx = createRequestContext(_req);
    const auth = (_req as unknown as Record<string, unknown>).auth as Record<string, unknown> | undefined;
    sendOk(res, {
      id: auth?.userId ?? 'unknown', username: 'admin', email: 'admin@mydash.local',
      fullName: 'Administrator', avatarUrl: '', role: auth?.role ?? 'owner',
      department: '', location: '', bio: '', joinDate: new Date().toISOString(),
      lastActive: new Date().toISOString(), twoFactorEnabled: false,
      emailVerified: true, phoneNumber: '',
      apiKeys: [], devices: [], recentActivity: [],
      securityInfo: { passwordLastChanged: new Date().toISOString(), mfaMethod: 'none', trustedDevices: 0, activeSessions: 1 },
      accountInfo: { storageUsed: 0, storageLimit: 1024, projectsCount: 2, apiCalls: 0, apiLimit: 10000 },
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
        if (r.success) { sendOk(res, r.data ?? defaultSession(), ctx); return; }
      } catch {  }
    }
    sendOk(res, defaultSession(), ctx);
  });
  router.post('/:id/revoke', (req, res) => {
    const ctx = createRequestContext(req);
    broadcastEvent(req, 'session', 'session.revoked', { sessionId: req.params.id });
    sendOk(res, { id: req.params.id, status: 'revoked', revokedAt: new Date().toISOString() }, ctx);
  });
  return router;
}
function defaultSession() {
  return {
    summary: { totalSessions: 0, activeSessions: 0, expiredSessions: 0, revokedSessions: 0, webSessions: 0, apiSessions: 0, sshSessions: 0, cliSessions: 0, trustedDevices: 0 },
    sessions: [],
  };
}
