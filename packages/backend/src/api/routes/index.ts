import { Router } from 'express';
import { createAuthRouter, createRolesRouter } from './auth.js';
import { createDashboardRouter, createMonitoringRouter, createAnalyticsRouter, createHealthRouter } from './monitoring.js';
import { createServersRouter, createBackupRouter, createDockerRouter, createTunnelRouter, createGitHubRouter, createPluginRouter } from './resources.js';
import { createNotificationRouter, createAutomationRouter, createSecurityRouter, createAuditRouter, createSettingsRouter, createProfileRouter, createSessionRouter } from './management.js';
import { authenticateMiddleware, requirePermission } from '../middleware/auth.js';
import type { Logger } from '../../logging/index.js';
import type { ServiceRegistry } from '../../application/registry/serviceRegistry.js';

export function createApiRouter(logger: Logger, jwtSecret: string, registry?: ServiceRegistry): Router {
  const api = Router();
  const auth = authenticateMiddleware(jwtSecret, logger);

  const di = { resolve: (key: string) => registry?.resolve(key) ?? null };

  api.use('/auth', createAuthRouter(di));

  api.use('/dashboard', auth, createDashboardRouter(di));
  api.use('/servers', auth, createServersRouter(di));
  api.use('/monitoring', auth, createMonitoringRouter(di));
  api.use('/analytics', auth, createAnalyticsRouter(di));
  api.use('/health', auth, createHealthRouter(di));
  api.use('/notifications', auth, createNotificationRouter(di));
  api.use('/automation', auth, createAutomationRouter(di));
  api.use('/backup', auth, createBackupRouter(di));
  api.use('/docker', auth, createDockerRouter(di));
  api.use('/tunnel', auth, createTunnelRouter(di));
  api.use('/github', auth, createGitHubRouter(di));
  api.use('/plugins', auth, createPluginRouter(di));
  api.use('/security', auth, createSecurityRouter(di));
  api.use('/audit', auth, createAuditRouter(di));
  api.use('/settings', auth, createSettingsRouter(di));
  api.use('/profile', auth, createProfileRouter(di));
  api.use('/sessions', auth, createSessionRouter(di));
  api.use('/roles', auth, createRolesRouter());

  api.use('/workspace', auth, requirePermission('admin:workspace'));

  return api;
}
