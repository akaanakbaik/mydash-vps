import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ListPluginsUseCaseImpl, InstallPluginUseCaseImpl, GetAuditRecordsUseCaseImpl, GetConfigurationUseCaseImpl } from './domains.impl.js';
import type { PluginRepository } from '../../domain/plugin/index.js';
import type { AuditRepository } from '../../domain/audit/index.js';
import type { ConfigurationRepository } from '../../domain/configuration/index.js';
import type { Logger } from '../../logging/index.js';

const mockLogger: Logger = {
  trace: vi.fn(), debug: vi.fn(), info: vi.fn(), success: vi.fn(),
  warn: vi.fn(), error: vi.fn(), critical: vi.fn(), emergency: vi.fn(),
  child: vi.fn(),
};

function createContext(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    correlationId: 'test-correlation-id',
    workspaceId: 'default',
    userId: null,
    timestamp: new Date(),
    ...overrides,
  };
}

describe('ListPluginsUseCaseImpl', () => {
  let useCase: ListPluginsUseCaseImpl;
  const mockRepo: PluginRepository = {
    save: vi.fn(),
    findById: vi.fn(),
    findAll: vi.fn(),
    delete: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    useCase = new ListPluginsUseCaseImpl(mockRepo);
  });

  it('should return plugin list', async () => {
    vi.mocked(mockRepo.findAll).mockResolvedValue([]);
    const result = await useCase.execute(undefined, createContext());
    expect(result.success).toBe(true);
    expect(mockRepo.findAll).toHaveBeenCalledOnce();
  });

  it('should handle error', async () => {
    vi.mocked(mockRepo.findAll).mockRejectedValue(new Error('error'));
    const result = await useCase.execute(undefined, createContext());
    expect(result.success).toBe(false);
  });
});

describe('InstallPluginUseCaseImpl', () => {
  let useCase: InstallPluginUseCaseImpl;
  const mockRepo: PluginRepository = {
    save: vi.fn(),
    findById: vi.fn(),
    findAll: vi.fn(),
    delete: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    useCase = new InstallPluginUseCaseImpl(mockRepo, mockLogger);
  });

  it('should install a plugin', async () => {
    vi.mocked(mockRepo.save).mockResolvedValue(undefined);
    const manifest = {
      id: 'plugin-1',
      name: 'Test Plugin',
      version: '1.0.0',
      author: 'test',
      description: 'A test plugin',
      compatibilityVersion: '1.0',
      capabilities: [],
      permissions: [],
      entryPoint: './index.js',
      dependencies: [],
      configSchema: null,
    };

    const result = await useCase.execute(manifest, createContext());
    expect(result.success).toBe(true);
    expect(mockRepo.save).toHaveBeenCalledOnce();
  });
});

describe('GetAuditRecordsUseCaseImpl', () => {
  let useCase: GetAuditRecordsUseCaseImpl;
  const mockRepo: AuditRepository = {
    save: vi.fn(),
    findById: vi.fn(),
    findByWorkspaceId: vi.fn(),
    findByCorrelationId: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    useCase = new GetAuditRecordsUseCaseImpl(mockRepo);
  });

  it('should return audit records', async () => {
    vi.mocked(mockRepo.findByWorkspaceId).mockResolvedValue([]);
    const result = await useCase.execute({ workspaceId: 'ws-1', limit: 50 }, createContext());
    expect(result.success).toBe(true);
  });

  it('should handle error', async () => {
    vi.mocked(mockRepo.findByWorkspaceId).mockRejectedValue(new Error('error'));
    const result = await useCase.execute({ workspaceId: 'ws-1' }, createContext());
    expect(result.success).toBe(false);
  });
});

describe('GetConfigurationUseCaseImpl', () => {
  let useCase: GetConfigurationUseCaseImpl;
  const mockRepo: ConfigurationRepository = {
    get: vi.fn(),
    save: vi.fn(),
    getDefault: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    useCase = new GetConfigurationUseCaseImpl(mockRepo);
  });

  it('should return empty object when null', async () => {
    vi.mocked(mockRepo.get).mockResolvedValue(null);
    const result = await useCase.execute('ws-1', createContext());
    expect(result.success).toBe(true);
  });
});
