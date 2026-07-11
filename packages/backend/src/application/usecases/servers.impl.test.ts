import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ListServersUseCaseImpl, ListContainersUseCaseImpl, GetTunnelConfigUseCaseImpl, GetGithubReposUseCaseImpl, ListSessionsUseCaseImpl, ListRolesUseCaseImpl } from './servers.impl.js';
import type { ServerRepository } from '../../domain/workspace/repository.js';
import type { DockerRepository } from '../../domain/docker/index.js';
import type { TunnelRepository } from '../../domain/tunnel/index.js';
import type { GitHubDomainRepository } from '../../domain/github/index.js';
import type { SessionRepository } from '../../domain/auth/repository.js';
function createContext(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    correlationId: 'test-correlation-id',
    workspaceId: 'default',
    userId: null,
    timestamp: new Date(),
    ...overrides,
  };
}
describe('ListServersUseCaseImpl', () => {
  let useCase: ListServersUseCaseImpl;
  const mockServerRepo: ServerRepository = {
    findById: vi.fn(),
    findByWorkspaceId: vi.fn(),
    save: vi.fn(),
    delete: vi.fn(),
  };
  beforeEach(() => {
    vi.clearAllMocks();
    useCase = new ListServersUseCaseImpl(mockServerRepo);
  });
  it('should return empty list when no servers', async () => {
    vi.mocked(mockServerRepo.findByWorkspaceId).mockResolvedValue([]);
    const result = await useCase.execute('ws-1', createContext());
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual([]);
    }
  });
  it('should return servers when found', async () => {
    vi.mocked(mockServerRepo.findByWorkspaceId).mockResolvedValue([{ id: 'srv-1' }] as never);
    const result = await useCase.execute('ws-1', createContext());
    expect(result.success).toBe(true);
  });
  it('should handle repository error', async () => {
    vi.mocked(mockServerRepo.findByWorkspaceId).mockRejectedValue(new Error('DB error'));
    const result = await useCase.execute('ws-1', createContext());
    expect(result.success).toBe(false);
    if (result.error) {
      expect(result.error.code).toBe('SERVER_LIST_FAILED');
    }
  });
});
describe('ListContainersUseCaseImpl', () => {
  let useCase: ListContainersUseCaseImpl;
  const mockDockerRepo: DockerRepository = {
    findById: vi.fn(),
    findByServerId: vi.fn(),
    save: vi.fn(),
    saveCompose: vi.fn(),
    findByComposeServerId: vi.fn(),
  };
  beforeEach(() => {
    vi.clearAllMocks();
    useCase = new ListContainersUseCaseImpl(mockDockerRepo);
  });
  it('should return containers for a server', async () => {
    vi.mocked(mockDockerRepo.findByServerId).mockResolvedValue([]);
    const result = await useCase.execute('srv-1', createContext());
    expect(result.success).toBe(true);
  });
  it('should handle repository error', async () => {
    vi.mocked(mockDockerRepo.findByServerId).mockRejectedValue(new Error('error'));
    const result = await useCase.execute('srv-1', createContext());
    expect(result.success).toBe(false);
  });
});
describe('ListRolesUseCaseImpl', () => {
  let useCase: ListRolesUseCaseImpl;
  beforeEach(() => {
    vi.clearAllMocks();
    useCase = new ListRolesUseCaseImpl();
  });
  it('should return predefined roles', async () => {
    const result = await useCase.execute(undefined, createContext());
    expect(result.success).toBe(true);
    if (result.success) {
      const roles = result.data as Array<{ id: string }>;
      expect(roles.length).toBeGreaterThanOrEqual(4);
      expect(roles.find(r => r.id === 'owner')).toBeDefined();
    }
  });
});
describe('GetTunnelConfigUseCaseImpl', () => {
  let useCase: GetTunnelConfigUseCaseImpl;
  const mockTunnelRepo: TunnelRepository = {
    getConfig: vi.fn(),
    saveConfig: vi.fn(),
    saveState: vi.fn(),
    getState: vi.fn(),
  };
  beforeEach(() => {
    vi.clearAllMocks();
    useCase = new GetTunnelConfigUseCaseImpl(mockTunnelRepo);
  });
  it('should return null when no config', async () => {
    vi.mocked(mockTunnelRepo.getConfig).mockResolvedValue(null);
    const result = await useCase.execute('ws-1', createContext());
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toBeNull();
    }
  });
});
describe('GetGithubReposUseCaseImpl', () => {
  let useCase: GetGithubReposUseCaseImpl;
  const mockGitHubRepo: GitHubDomainRepository = {
    save: vi.fn(),
    findById: vi.fn(),
    findByWorkspaceId: vi.fn(),
    saveWorkflow: vi.fn(),
    findWorkflows: vi.fn(),
  };
  beforeEach(() => {
    vi.clearAllMocks();
    useCase = new GetGithubReposUseCaseImpl(mockGitHubRepo);
  });
  it('should return repos for workspace', async () => {
    vi.mocked(mockGitHubRepo.findByWorkspaceId).mockResolvedValue([]);
    const result = await useCase.execute('ws-1', createContext());
    expect(result.success).toBe(true);
  });
});
describe('ListSessionsUseCaseImpl', () => {
  let useCase: ListSessionsUseCaseImpl;
  const mockSessRepo: SessionRepository = {
    findById: vi.fn(),
    findByToken: vi.fn(),
    findByWorkspaceId: vi.fn(),
    save: vi.fn(),
    delete: vi.fn(),
    expireAll: vi.fn(),
  };
  beforeEach(() => {
    vi.clearAllMocks();
    useCase = new ListSessionsUseCaseImpl(mockSessRepo);
  });
  it('should return sessions for workspace', async () => {
    vi.mocked(mockSessRepo.findByWorkspaceId).mockResolvedValue([]);
    const result = await useCase.execute('ws-1', createContext());
    expect(result.success).toBe(true);
  });
  it('should handle error', async () => {
    vi.mocked(mockSessRepo.findByWorkspaceId).mockRejectedValue(new Error('error'));
    const result = await useCase.execute('ws-1', createContext());
    expect(result.success).toBe(false);
  });
});
