import { describe, it, expect, vi, beforeEach } from 'vitest';
import { registerUseCases } from './compositionRoot.js';
import type { ServiceContainer } from '../infrastructure/utilities.js';
import type { Logger } from '../logging/index.js';

const mockLogger: Logger = {
  trace: vi.fn(), debug: vi.fn(), info: vi.fn(), success: vi.fn(),
  warn: vi.fn(), error: vi.fn(), critical: vi.fn(), emergency: vi.fn(),
  child: vi.fn(),
};

describe('DI CompositionRoot', () => {
  let container: ServiceContainer;

  beforeEach(() => {
    vi.clearAllMocks();
    container = {
      register: vi.fn(),
      resolve: vi.fn(),
    } as never;
  });

  it('registers monitoring use cases', () => {
    registerUseCases(container, mockLogger);
    expect(container.register).toHaveBeenCalledWith('ingestMetricUseCase', expect.any(Function));
    expect(container.register).toHaveBeenCalledWith('getLatestMetricsUseCase', expect.any(Function));
    expect(container.register).toHaveBeenCalledWith('getMetricWindowUseCase', expect.any(Function));
  });

  it('registers analytics use cases', () => {
    registerUseCases(container, mockLogger);
    expect(container.register).toHaveBeenCalledWith('calculateAnalyticsSummaryUseCase', expect.any(Function));
    expect(container.register).toHaveBeenCalledWith('getAnalyticsSummaryUseCase', expect.any(Function));
  });

  it('registers health score use cases', () => {
    registerUseCases(container, mockLogger);
    expect(container.register).toHaveBeenCalledWith('calculateHealthScoreUseCase', expect.any(Function));
    expect(container.register).toHaveBeenCalledWith('getHealthScoreUseCase', expect.any(Function));
  });

  it('registers auth use cases', () => {
    registerUseCases(container, mockLogger);
    expect(container.register).toHaveBeenCalledWith('loginUseCase', expect.any(Function));
    expect(container.register).toHaveBeenCalledWith('logoutUseCase', expect.any(Function));
    expect(container.register).toHaveBeenCalledWith('validateSessionUseCase', expect.any(Function));
  });

  it('registers workspace use cases', () => {
    registerUseCases(container, mockLogger);
    expect(container.register).toHaveBeenCalledWith('createWorkspaceUseCase', expect.any(Function));
    expect(container.register).toHaveBeenCalledWith('getWorkspaceUseCase', expect.any(Function));
    expect(container.register).toHaveBeenCalledWith('listWorkspacesUseCase', expect.any(Function));
    expect(container.register).toHaveBeenCalledWith('deleteWorkspaceUseCase', expect.any(Function));
  });

  it('registers all automation use cases', () => {
    registerUseCases(container, mockLogger);
    expect(container.register).toHaveBeenCalledWith('createAutomationUseCase', expect.any(Function));
    expect(container.register).toHaveBeenCalledWith('listAutomationsUseCase', expect.any(Function));
    expect(container.register).toHaveBeenCalledWith('executeAutomationUseCase', expect.any(Function));
    expect(container.register).toHaveBeenCalledWith('triggerAutomationByEventUseCase', expect.any(Function));
    expect(container.register).toHaveBeenCalledWith('getExecutionStatusUseCase', expect.any(Function));
    expect(container.register).toHaveBeenCalledWith('cancelExecutionUseCase', expect.any(Function));
  });

  it('registers notification use cases', () => {
    registerUseCases(container, mockLogger);
    expect(container.register).toHaveBeenCalledWith('dispatchNotificationsUseCase', expect.any(Function));
  });

  it('registers backup use cases', () => {
    registerUseCases(container, mockLogger);
    expect(container.register).toHaveBeenCalledWith('createBackupUseCase', expect.any(Function));
    expect(container.register).toHaveBeenCalledWith('listBackupsUseCase', expect.any(Function));
    expect(container.register).toHaveBeenCalledWith('restoreBackupUseCase', expect.any(Function));
  });

  it('registers server, docker, tunnel, and github use cases', () => {
    registerUseCases(container, mockLogger);
    expect(container.register).toHaveBeenCalledWith('listServersUseCase', expect.any(Function));
    expect(container.register).toHaveBeenCalledWith('listContainersUseCase', expect.any(Function));
    expect(container.register).toHaveBeenCalledWith('getTunnelConfigUseCase', expect.any(Function));
    expect(container.register).toHaveBeenCalledWith('getGithubReposUseCase', expect.any(Function));
  });

  it('registers all domain management use cases', () => {
    registerUseCases(container, mockLogger);
    expect(container.register).toHaveBeenCalledWith('listPluginsUseCase', expect.any(Function));
    expect(container.register).toHaveBeenCalledWith('installPluginUseCase', expect.any(Function));
    expect(container.register).toHaveBeenCalledWith('getAuditRecordsUseCase', expect.any(Function));
    expect(container.register).toHaveBeenCalledWith('getSecurityEventsUseCase', expect.any(Function));
    expect(container.register).toHaveBeenCalledWith('getConfigurationUseCase', expect.any(Function));
    expect(container.register).toHaveBeenCalledWith('updateConfigurationUseCase', expect.any(Function));
    expect(container.register).toHaveBeenCalledWith('listSessionsUseCase', expect.any(Function));
    expect(container.register).toHaveBeenCalledWith('listRolesUseCase', expect.any(Function));
  });

  it('all registered factories produce valid objects', () => {
    const factories: Array<{ name: string; factory: () => unknown }> = [];
    const mockDb = {
      transaction: vi.fn(),
      select: vi.fn(),
      insert: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    };
    container = {
      register: vi.fn((name: string, factory: () => unknown) => { factories.push({ name, factory }); }),
      resolve: vi.fn((key: string) => {
        if (key === 'dbClient') return mockDb;
        return undefined;
      }),
    } as never;

    registerUseCases(container, mockLogger);

    for (const { factory } of factories) {
      const instance = factory();
      expect(instance).toBeDefined();
    }
  });
});
