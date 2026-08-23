import { Router } from 'express';
import { sendOk, sendError, createRequestContext, broadcastEvent } from '../../transport/http/response.js';
import { createUseCaseContext } from '../../application/usecases/base.js';
import { resolveSystemWorkspaceId } from '../../infrastructure/systemMetrics/collector.js';
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
type SettingValue = string | boolean | number;
type SettingsConfig = Record<string, Record<string, unknown>>;
function defaultConfiguration(): SettingsConfig {
  return {
    system: { nodeEnv: 'production', port: 4000, host: '0.0.0.0', timezone: 'UTC', logLevel: 'info', logRetentionDays: 30 },
    monitoring: { cpuSamplingIntervalMs: 10000, memorySamplingIntervalMs: 10000, diskSamplingIntervalMs: 60000, networkSamplingIntervalMs: 10000, snapshotIntervalMs: 60000 },
    notification: { enabled: false, workerCount: 1, maxRetry: 3, aiTimeoutSeconds: 30, defaultCooldownMs: 300000, rateLimitPerMinute: 30 },
    tunnel: { primaryProvider: 'cloudflare', fallbackProvider: '', healthCheckIntervalMs: 30000, maxRetry: 3, autoReconnect: true },
    authentication: { sessionLifetimeHours: 24, maxLoginAttempts: 5, bruteForceCooldownMs: 900000, passwordMinLength: 12 },
    security: { rateLimitRequestsPerMinute: 60, corsAllowedOrigins: [], encryptionEnabled: true },
  };
}
function asConfig(value: unknown): SettingsConfig {
  const base = defaultConfiguration();
  if (!value || typeof value !== 'object') return base;
  for (const [section, sectionValue] of Object.entries(value as Record<string, unknown>)) {
    if (sectionValue && typeof sectionValue === 'object' && !Array.isArray(sectionValue)) {
      base[section] = { ...(base[section] ?? {}), ...(sectionValue as Record<string, unknown>) };
    }
  }
  return base;
}
function settingValue(value: unknown): SettingValue | null {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') return value;
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  return null;
}
function readSetting(config: SettingsConfig, section: string, key: string): SettingValue {
  const value = config[section]?.[key];
  return settingValue(value) ?? '';
}
function applySettingUpdates(config: SettingsConfig, updates: unknown): SettingsConfig {
  const next = asConfig(config);
  if (!Array.isArray(updates)) return next;
  for (const item of updates) {
    if (!item || typeof item !== 'object') continue;
    const update = item as Record<string, unknown>;
    const id = typeof update.id === 'string' ? update.id : '';
    const value = settingValue(update.value);
    const [section, key] = id.split('.', 2);
    if (!section || !key || value === null) continue;
    if (!next[section]) next[section] = {};
    if (Object.prototype.hasOwnProperty.call(next[section], key)) next[section][key] = value;
  }
  return next;
}
function settingsView(value: unknown) {
  const config = asConfig(value);
  const categories = [
    { id: 'general', label: 'General', icon: 'settings' },
    { id: 'monitoring', label: 'Monitoring', icon: 'activity' },
    { id: 'notifications', label: 'Notifications', icon: 'bell' },
    { id: 'tunnel', label: 'Tunnel', icon: 'terminal' },
    { id: 'security', label: 'Security', icon: 'shield' },
    { id: 'session', label: 'Session', icon: 'clock' },
    { id: 'advanced', label: 'Advanced', icon: 'cpu' },
    { id: 'about', label: 'About', icon: 'info' },
  ];
  const settings = [
    { id: 'system.timezone', label: 'Timezone', type: 'select', value: readSetting(config, 'system', 'timezone'), description: 'Timezone used for dashboard display.', category: 'general', options: [{ label: 'UTC', value: 'UTC' }, { label: 'Asia/Jakarta', value: 'Asia/Jakarta' }, { label: 'Asia/Makassar', value: 'Asia/Makassar' }, { label: 'Asia/Jayapura', value: 'Asia/Jayapura' }] },
    { id: 'system.logLevel', label: 'Log level', type: 'select', value: readSetting(config, 'system', 'logLevel'), description: 'Runtime logging verbosity.', category: 'general', options: [{ label: 'Error', value: 'error' }, { label: 'Warn', value: 'warn' }, { label: 'Info', value: 'info' }, { label: 'Debug', value: 'debug' }] },
    { id: 'system.logRetentionDays', label: 'Log retention (days)', type: 'number', value: readSetting(config, 'system', 'logRetentionDays'), description: 'Retention policy for operational logs.', category: 'general' },
    { id: 'monitoring.snapshotIntervalMs', label: 'Snapshot interval (ms)', type: 'number', value: readSetting(config, 'monitoring', 'snapshotIntervalMs'), description: 'Interval for persisted system snapshots.', category: 'monitoring' },
    { id: 'monitoring.cpuSamplingIntervalMs', label: 'CPU sampling interval (ms)', type: 'number', value: readSetting(config, 'monitoring', 'cpuSamplingIntervalMs'), description: 'CPU sampling cadence used by monitoring.', category: 'monitoring' },
    { id: 'monitoring.diskSamplingIntervalMs', label: 'Disk sampling interval (ms)', type: 'number', value: readSetting(config, 'monitoring', 'diskSamplingIntervalMs'), description: 'Disk sampling cadence used by monitoring.', category: 'monitoring' },
    { id: 'notification.enabled', label: 'Notifications enabled', type: 'toggle', value: readSetting(config, 'notification', 'enabled'), description: 'Enable configured notification delivery.', category: 'notifications' },
    { id: 'notification.workerCount', label: 'Notification workers', type: 'number', value: readSetting(config, 'notification', 'workerCount'), description: 'Number of notification workers.', category: 'notifications' },
    { id: 'notification.maxRetry', label: 'Maximum retries', type: 'number', value: readSetting(config, 'notification', 'maxRetry'), description: 'Maximum retry count for failed delivery.', category: 'notifications' },
    { id: 'tunnel.primaryProvider', label: 'Primary provider', type: 'select', value: readSetting(config, 'tunnel', 'primaryProvider'), description: 'Provider name used for tunnel configuration.', category: 'tunnel', options: [{ label: 'Cloudflare', value: 'cloudflare' }, { label: 'Ngrok', value: 'ngrok' }, { label: 'None', value: '' }] },
    { id: 'tunnel.autoReconnect', label: 'Auto reconnect', type: 'toggle', value: readSetting(config, 'tunnel', 'autoReconnect'), description: 'Reconnect when a configured tunnel reports a failure.', category: 'tunnel' },
    { id: 'tunnel.healthCheckIntervalMs', label: 'Health check interval (ms)', type: 'number', value: readSetting(config, 'tunnel', 'healthCheckIntervalMs'), description: 'Interval for tunnel health checks.', category: 'tunnel' },
    { id: 'security.rateLimitRequestsPerMinute', label: 'API rate limit per minute', type: 'number', value: readSetting(config, 'security', 'rateLimitRequestsPerMinute'), description: 'Maximum requests allowed per minute.', category: 'security' },
    { id: 'security.encryptionEnabled', label: 'Encryption enabled', type: 'toggle', value: readSetting(config, 'security', 'encryptionEnabled'), description: 'Keep encrypted-at-rest configuration protection enabled.', category: 'security' },
    { id: 'authentication.sessionLifetimeHours', label: 'Session lifetime (hours)', type: 'number', value: readSetting(config, 'authentication', 'sessionLifetimeHours'), description: 'Lifetime of authenticated sessions.', category: 'session' },
    { id: 'authentication.maxLoginAttempts', label: 'Maximum login attempts', type: 'number', value: readSetting(config, 'authentication', 'maxLoginAttempts'), description: 'Attempts allowed before brute-force cooldown.', category: 'session' },
    { id: 'authentication.passwordMinLength', label: 'Minimum password length', type: 'number', value: readSetting(config, 'authentication', 'passwordMinLength'), description: 'Minimum length required for new passwords.', category: 'session' },
  ];
  return { categories, settings };
}
export function createSettingsRouter(di?: DI): Router {
  const router = Router();
  const resolve = (key: string) => di?.resolve(key) ?? null;
  router.get('/', async (_req, res) => {
    const ctx = createRequestContext(_req);
    const uc = resolve('getConfigurationUseCase') as UseCase<string, unknown> | null;
    const workspaceId = await resolveSystemWorkspaceId(resolve, ctx.workspaceId ?? undefined) ?? ctx.workspaceId ?? 'default';
    if (uc) {
      try {
        const uctx = createUseCaseContext({ correlationId: ctx.correlationId, workspaceId });
        const r = await uc.execute(workspaceId, uctx);
        if (r.success) { sendOk(res, settingsView(r.data), ctx); return; }
      } catch {  }
    }
    sendOk(res, settingsView(null), ctx);
  });
  router.patch('/', async (req, res) => {
    const ctx = createRequestContext(req);
    const getUc = resolve('getConfigurationUseCase') as UseCase<string, unknown> | null;
    const updateUc = resolve('updateConfigurationUseCase') as UseCase<{ workspaceId: string; config: unknown }, void> | null;
    const workspaceId = await resolveSystemWorkspaceId(resolve, ctx.workspaceId ?? undefined) ?? ctx.workspaceId ?? 'default';
    try {
      let current: unknown = null;
      if (getUc) {
        const currentResult = await getUc.execute(workspaceId, createUseCaseContext({ correlationId: ctx.correlationId, workspaceId }));
        if (currentResult.success) current = currentResult.data;
      }
      const body = req.body && typeof req.body === 'object' ? req.body as Record<string, unknown> : {};
      const next = body.reset === true ? defaultConfiguration() : applySettingUpdates(asConfig(current), body.updates);
      if (updateUc) {
        const result = await updateUc.execute({ workspaceId, config: next }, createUseCaseContext({ correlationId: ctx.correlationId, workspaceId }));
        if (!result.success) { sendError(res, 500, 'CONFIG_UPDATE_FAILED', 'Settings could not be saved', ctx); return; }
      }
      sendOk(res, { ...settingsView(next), updatedAt: new Date().toISOString() }, ctx);
      broadcastEvent(req, 'settings', body.reset === true ? 'settings.reset' : 'settings.updated', { updates: body.updates ?? [] });
    } catch {
      sendError(res, 500, 'CONFIG_UPDATE_FAILED', 'Settings could not be saved', ctx);
    }
  });
  return router;
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
