// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import {
  useServers, useLogin, useDashboard, useHealthScore,
  useNotifications, useMonitoring, useAnalytics, useBackupSummary,
} from './index.js';
import { serverRepository } from '../repositories/server.js';
import { authRepository } from '../repositories/auth.js';
import { overviewRepository } from '../repositories/overview.js';
import { healthRepository } from '../repositories/health.js';
import { notificationRepository } from '../repositories/notification.js';
import { monitoringRepository } from '../repositories/monitoring.js';
import { analyticsRepository } from '../repositories/analytics.js';
import { backupRepository } from '../repositories/backup.js';

vi.mock('../repositories/auth', () => ({
  authRepository: { login: vi.fn(), logout: vi.fn(), refresh: vi.fn(), getSession: vi.fn() },
}));
vi.mock('../repositories/server', () => ({
  serverRepository: { getAll: vi.fn(), getById: vi.fn() },
}));
vi.mock('../repositories/monitoring', () => ({
  monitoringRepository: { getMetrics: vi.fn(), getTimeline: vi.fn() },
}));
vi.mock('../repositories/backup', () => ({
  backupRepository: { getSummary: vi.fn(), getHistory: vi.fn(), triggerBackup: vi.fn(), restore: vi.fn() },
}));
vi.mock('../repositories/notification', () => ({
  notificationRepository: { getAll: vi.fn(), getRules: vi.fn(), getProviders: vi.fn() },
}));
vi.mock('../repositories/automation', () => ({
  automationRepository: { getAll: vi.fn(), triggerWorkflow: vi.fn() },
}));
vi.mock('../repositories/docker', () => ({
  dockerRepository: { getAll: vi.fn(), getContainers: vi.fn(), restartContainer: vi.fn() },
}));
vi.mock('../repositories/tunnel', () => ({
  tunnelRepository: { getOverview: vi.fn(), getSessions: vi.fn() },
}));
vi.mock('../repositories/github', () => ({
  githubRepository: { getAll: vi.fn(), getWorkflows: vi.fn() },
}));
vi.mock('../repositories/plugin', () => ({
  pluginRepository: { getAll: vi.fn(), getMarketplace: vi.fn(), install: vi.fn(), uninstall: vi.fn() },
}));
vi.mock('../repositories/security', () => ({
  securityRepository: { getAll: vi.fn(), getEvents: vi.fn() },
}));
vi.mock('../repositories/audit', () => ({
  auditRepository: { getAll: vi.fn() },
}));
vi.mock('../repositories/settings', () => ({
  settingsRepository: { getAll: vi.fn(), update: vi.fn() },
}));
vi.mock('../repositories/profile', () => ({
  profileRepository: { get: vi.fn(), update: vi.fn() },
}));
vi.mock('../repositories/session', () => ({
  sessionRepository: { getAll: vi.fn(), revoke: vi.fn() },
}));
vi.mock('../repositories/role', () => ({
  roleRepository: { getAll: vi.fn(), getById: vi.fn() },
}));
vi.mock('../repositories/overview', () => ({
  overviewRepository: { getDashboard: vi.fn() },
}));
vi.mock('../repositories/health', () => ({
  healthRepository: { getScore: vi.fn(), getHistory: vi.fn() },
}));
vi.mock('../repositories/analytics', () => ({
  analyticsRepository: { getSummary: vi.fn(), getTrends: vi.fn(), getAnomalies: vi.fn() },
}));

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 300_000 },
    },
  });
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

describe('useServers hook behavior', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('should call serverRepository.getAll on mount and become success', async () => {
    vi.mocked(serverRepository.getAll).mockResolvedValue({
      success: true,
      data: { servers: [], totalCount: 0, onlineCount: 0, offlineCount: 0, degradedCount: 0, avgHealthScore: 0, totalCores: 0, totalRam: 0, totalDisk: 0, tagOptions: [], statusOptions: [] },
      correlationId: '', timestamp: '',
    });
    const { result } = renderHook(() => useServers(), { wrapper: createWrapper() });
    await waitFor(() => { expect(result.current.isSuccess).toBe(true); });
    expect(serverRepository.getAll).toHaveBeenCalledTimes(1);
  });

  it('should handle error state', async () => {
    vi.mocked(serverRepository.getAll).mockRejectedValue(new Error('Network error'));
    const { result } = renderHook(() => useServers(), { wrapper: createWrapper() });
    await waitFor(() => { expect(result.current.isError).toBe(true); });
    expect(serverRepository.getAll).toHaveBeenCalledTimes(1);
  });
});

describe('useLogin mutation behavior', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('should call authRepository.login when mutate is called', async () => {
    vi.mocked(authRepository.login).mockResolvedValue({
      accessToken: 'abc',
      user: { id: 'u1', name: 'admin', email: 'a@b.com', role: 'owner' },
    });
    const { result } = renderHook(() => useLogin(), { wrapper: createWrapper() });
    result.current.mutate({ username: 'admin', password: 'pass' });
    await waitFor(() => { expect(authRepository.login).toHaveBeenCalledWith({ username: 'admin', password: 'pass' }); });
    // login() internally extracts only password when calling the backend
    expect(authRepository.login).toHaveBeenCalledTimes(1);
  });
});

describe('useDashboard hook behavior', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('should call overviewRepository.getDashboard on mount and become success', async () => {
    vi.mocked(overviewRepository.getDashboard).mockResolvedValue({
      success: true, data: {} as never, correlationId: '', timestamp: '',
    });
    const { result } = renderHook(() => useDashboard(), { wrapper: createWrapper() });
    await waitFor(() => { expect(result.current.isSuccess).toBe(true); });
    expect(overviewRepository.getDashboard).toHaveBeenCalledTimes(1);
  });
});

describe('useHealthScore hook behavior', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('should fetch health score on mount and become success', async () => {
    vi.mocked(healthRepository.getScore).mockResolvedValue({
      success: true, data: { score: 95, status: 'healthy' } as never, correlationId: '', timestamp: '',
    });
    const { result } = renderHook(() => useHealthScore(), { wrapper: createWrapper() });
    await waitFor(() => { expect(result.current.isSuccess).toBe(true); });
    expect(healthRepository.getScore).toHaveBeenCalled();
  });
});

describe('useNotifications hook behavior', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('should fetch notifications on mount', async () => {
    vi.mocked(notificationRepository.getAll).mockResolvedValue({
      success: true, data: [] as never, correlationId: '', timestamp: '',
    });
    const { result } = renderHook(() => useNotifications(), { wrapper: createWrapper() });
    await waitFor(() => { expect(result.current.isSuccess).toBe(true); });
  });
});

describe('useMonitoring hook behavior', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('should fetch monitoring data on mount', async () => {
    vi.mocked(monitoringRepository.getMetrics).mockResolvedValue({
      success: true, data: {} as never, correlationId: '', timestamp: '',
    });
    const { result } = renderHook(() => useMonitoring(), { wrapper: createWrapper() });
    await waitFor(() => { expect(result.current.isSuccess).toBe(true); });
  });
});

describe('useAnalytics hook behavior', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('should fetch analytics on mount', async () => {
    vi.mocked(analyticsRepository.getSummary).mockResolvedValue({
      success: true, data: {} as never, correlationId: '', timestamp: '',
    });
    const { result } = renderHook(() => useAnalytics(), { wrapper: createWrapper() });
    await waitFor(() => { expect(result.current.isSuccess).toBe(true); });
  });
});

describe('useBackupSummary hook behavior', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('should call backupRepository.getSummary on mount', async () => {
    vi.mocked(backupRepository.getSummary).mockResolvedValue({
      success: true, data: {} as never, correlationId: '', timestamp: '',
    });
    const { result } = renderHook(() => useBackupSummary(), { wrapper: createWrapper() });
    await waitFor(() => { expect(result.current.isSuccess).toBe(true); });
  });
});
