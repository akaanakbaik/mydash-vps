import { describe, it, expect, vi } from 'vitest';
vi.mock('../repositories/auth', () => ({
  authRepository: {
    login: vi.fn(),
    logout: vi.fn(),
    refresh: vi.fn(),
    getSession: vi.fn(),
  },
}));
vi.mock('../repositories/server', () => ({
  serverRepository: {
    getAll: vi.fn(),
    getById: vi.fn(),
  },
}));
vi.mock('../repositories/monitoring', () => ({
  monitoringRepository: {
    getMetrics: vi.fn(),
    getTimeline: vi.fn(),
  },
}));
vi.mock('../repositories/backup', () => ({
  backupRepository: {
    getSummary: vi.fn(),
    getHistory: vi.fn(),
    triggerBackup: vi.fn(),
    restore: vi.fn(),
  },
}));
vi.mock('../repositories/notification', () => ({
  notificationRepository: {
    getAll: vi.fn(),
    getRules: vi.fn(),
    getProviders: vi.fn(),
  },
}));
vi.mock('../repositories/automation', () => ({
  automationRepository: {
    getAll: vi.fn(),
    triggerWorkflow: vi.fn(),
  },
}));
vi.mock('../repositories/docker', () => ({
  dockerRepository: {
    getAll: vi.fn(),
    getContainers: vi.fn(),
    restartContainer: vi.fn(),
  },
}));
vi.mock('../repositories/health', () => ({
  healthRepository: {
    getScore: vi.fn(),
    getHistory: vi.fn(),
  },
}));
vi.mock('../repositories/analytics', () => ({
  analyticsRepository: {
    getSummary: vi.fn(),
    getTrends: vi.fn(),
    getAnomalies: vi.fn(),
  },
}));
vi.mock('../repositories/tunnel', () => ({
  tunnelRepository: {
    getOverview: vi.fn(),
    getSessions: vi.fn(),
  },
}));
vi.mock('../repositories/github', () => ({
  githubRepository: {
    getAll: vi.fn(),
    getWorkflows: vi.fn(),
  },
}));
vi.mock('../repositories/plugin', () => ({
  pluginRepository: {
    getAll: vi.fn(),
    getMarketplace: vi.fn(),
    install: vi.fn(),
    uninstall: vi.fn(),
  },
}));
vi.mock('../repositories/security', () => ({
  securityRepository: {
    getAll: vi.fn(),
    getEvents: vi.fn(),
  },
}));
vi.mock('../repositories/audit', () => ({
  auditRepository: {
    getAll: vi.fn(),
  },
}));
vi.mock('../repositories/settings', () => ({
  settingsRepository: {
    getAll: vi.fn(),
    update: vi.fn(),
  },
}));
vi.mock('../repositories/profile', () => ({
  profileRepository: {
    get: vi.fn(),
    update: vi.fn(),
  },
}));
vi.mock('../repositories/session', () => ({
  sessionRepository: {
    getAll: vi.fn(),
    revoke: vi.fn(),
  },
}));
vi.mock('../repositories/role', () => ({
  roleRepository: {
    getAll: vi.fn(),
    getById: vi.fn(),
  },
}));
vi.mock('../repositories/overview', () => ({
  overviewRepository: {
    getDashboard: vi.fn(),
  },
}));
describe('Hook Exports', () => {
  it('should export all hooks from index', async () => {
    const hooks = await import('./index.js');
    expect(hooks.useLogin).toBeDefined();
    expect(hooks.useLogout).toBeDefined();
    expect(hooks.useServers).toBeDefined();
    expect(hooks.useMonitoring).toBeDefined();
    expect(hooks.useDashboard).toBeDefined();
    expect(hooks.useHealthScore).toBeDefined();
    expect(hooks.useNotifications).toBeDefined();
    expect(hooks.useAutomation).toBeDefined();
    expect(hooks.useDocker).toBeDefined();
    expect(hooks.useTunnel).toBeDefined();
    expect(hooks.useGitHub).toBeDefined();
    expect(hooks.usePlugins).toBeDefined();
    expect(hooks.useSecurity).toBeDefined();
    expect(hooks.useAudit).toBeDefined();
    expect(hooks.useSettings).toBeDefined();
    expect(hooks.useProfile).toBeDefined();
    expect(hooks.useSessions).toBeDefined();
    expect(hooks.useRoles).toBeDefined();
    expect(hooks.useAnalytics).toBeDefined();
    expect(hooks.useBackupSummary).toBeDefined();
    expect(hooks.useBackupHistory).toBeDefined();
    expect(hooks.useTriggerBackup).toBeDefined();
    expect(hooks.useRestoreBackup).toBeDefined();
    expect(hooks.useNotificationRules).toBeDefined();
    expect(hooks.useNotificationProviders).toBeDefined();
    expect(hooks.useDockerContainers).toBeDefined();
    expect(hooks.useRestartContainer).toBeDefined();
    expect(hooks.useTunnelSessions).toBeDefined();
    expect(hooks.useGitHubWorkflows).toBeDefined();
    expect(hooks.usePluginMarketplace).toBeDefined();
    expect(hooks.useInstallPlugin).toBeDefined();
    expect(hooks.useUninstallPlugin).toBeDefined();
    expect(hooks.useSecurityEvents).toBeDefined();
    expect(hooks.useUpdateSettings).toBeDefined();
    expect(hooks.useProfile).toBeDefined();
    expect(hooks.useUpdateProfile).toBeDefined();
    expect(hooks.useSessions).toBeDefined();
    expect(hooks.useRevokeSession).toBeDefined();
    expect(hooks.useRoles).toBeDefined();
    expect(hooks.useRole).toBeDefined();
    expect(hooks.useAnalytics).toBeDefined();
    expect(hooks.useAnalyticsTrends).toBeDefined();
    expect(hooks.useAnalyticsAnomalies).toBeDefined();
    expect(hooks.useMonitoringTimeline).toBeDefined();
    expect(hooks.useHealthHistory).toBeDefined();
  });
});
describe('Mutation Exports', () => {
  it('should export all mutations', async () => {
    const mut = await import('./mutations.js');
    expect(mut.useLoginMutation).toBeDefined();
    expect(mut.useLogoutMutation).toBeDefined();
    expect(mut.useTriggerBackupMutation).toBeDefined();
    expect(mut.useRestoreBackupMutation).toBeDefined();
    expect(mut.useRestartContainerMutation).toBeDefined();
    expect(mut.useRevokeSessionMutation).toBeDefined();
    expect(mut.useInstallPluginMutation).toBeDefined();
    expect(mut.useUninstallPluginMutation).toBeDefined();
    expect(mut.useUpdateSettingsMutation).toBeDefined();
    expect(mut.useUpdateProfileMutation).toBeDefined();
    expect(mut.useTriggerWorkflowMutation).toBeDefined();
  });
});
