import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CreateWorkspaceUseCaseImpl, GetWorkspaceUseCaseImpl, ListWorkspacesUseCaseImpl, DeleteWorkspaceUseCaseImpl } from './workspace.impl.js';
import type { WorkspaceRepository } from '../../domain/workspace/repository.js';
import type { Logger } from '../../logging/index.js';

const mockLogger: Logger = {
  trace: vi.fn(), debug: vi.fn(), info: vi.fn(), success: vi.fn(),
  warn: vi.fn(), error: vi.fn(), critical: vi.fn(), emergency: vi.fn(),
  child: vi.fn(),
};

const mockRepo: WorkspaceRepository = {
  findById: vi.fn(),
  findAll: vi.fn(),
  save: vi.fn(),
  delete: vi.fn(),
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

describe('CreateWorkspaceUseCaseImpl', () => {
  let useCase: CreateWorkspaceUseCaseImpl;

  beforeEach(() => {
    vi.clearAllMocks();
    useCase = new CreateWorkspaceUseCaseImpl(mockRepo, mockLogger);
  });

  it('should create a workspace with valid input', async () => {
    vi.mocked(mockRepo.save).mockResolvedValue(undefined);

    const result = await useCase.execute(
      { name: 'test-workspace', displayName: 'Test Workspace', timezone: 'UTC', language: 'en' },
      createContext(),
    );

    expect(result.success).toBe(true);
    expect(mockRepo.save).toHaveBeenCalledOnce();
    if (result.success && result.data) {
      const data = result.data as Record<string, unknown>;
      expect(data.name).toBe('test-workspace');
    }
  });

  it('should handle repository failure', async () => {
    vi.mocked(mockRepo.save).mockRejectedValue(new Error('DB error'));

    const result = await useCase.execute(
      { name: 'test', displayName: 'Test', timezone: 'UTC', language: 'en' },
      createContext(),
    );

    expect(result.success).toBe(false);
    if (result.error) {
      expect(result.error.code).toBe('WORKSPACE_CREATE_FAILED');
    }
  });

  it('should use default displayName when not provided', async () => {
    vi.mocked(mockRepo.save).mockResolvedValue(undefined);

    const result = await useCase.execute(
      { name: 'test-ws', displayName: '', timezone: 'UTC', language: 'en' },
      createContext(),
    );

    expect(result.success).toBe(true);
    if (result.success && result.data) {
      const data = result.data as Record<string, unknown>;
      expect(data.name).toBe('test-ws');
    }
  });
});

describe('GetWorkspaceUseCaseImpl', () => {
  let useCase: GetWorkspaceUseCaseImpl;

  beforeEach(() => {
    vi.clearAllMocks();
    useCase = new GetWorkspaceUseCaseImpl(mockRepo);
  });

  it('should return workspace when found', async () => {
    vi.mocked(mockRepo.findById).mockResolvedValue({
      id: 'ws-1' as string & { readonly __brand: 'WorkspaceId' },
      name: 'test',
      displayName: 'Test',
      timezone: 'UTC',
      language: 'en',
      deletedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      version: 1,
    });

    const result = await useCase.execute('ws-1', createContext());
    expect(result.success).toBe(true);
    expect(mockRepo.findById).toHaveBeenCalledWith('ws-1');
  });

  it('should return null when not found', async () => {
    vi.mocked(mockRepo.findById).mockResolvedValue(null);

    const result = await useCase.execute('nonexistent', createContext());
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toBeNull();
    }
  });

  it('should handle repository error', async () => {
    vi.mocked(mockRepo.findById).mockRejectedValue(new Error('DB error'));

    const result = await useCase.execute('ws-1', createContext());
    expect(result.success).toBe(false);
    if (result.error) {
      expect(result.error.code).toBe('WORKSPACE_GET_FAILED');
    }
  });
});

describe('ListWorkspacesUseCaseImpl', () => {
  let useCase: ListWorkspacesUseCaseImpl;

  beforeEach(() => {
    vi.clearAllMocks();
    useCase = new ListWorkspacesUseCaseImpl(mockRepo);
  });

  it('should return list of workspaces', async () => {
    vi.mocked(mockRepo.findAll).mockResolvedValue([]);
    const result = await useCase.execute(undefined, createContext());
    expect(result.success).toBe(true);
    expect(mockRepo.findAll).toHaveBeenCalledOnce();
  });

  it('should handle repository error', async () => {
    vi.mocked(mockRepo.findAll).mockRejectedValue(new Error('DB error'));
    const result = await useCase.execute(undefined, createContext());
    expect(result.success).toBe(false);
  });
});

describe('DeleteWorkspaceUseCaseImpl', () => {
  let useCase: DeleteWorkspaceUseCaseImpl;

  beforeEach(() => {
    vi.clearAllMocks();
    useCase = new DeleteWorkspaceUseCaseImpl(mockRepo, mockLogger);
  });

  it('should delete workspace successfully', async () => {
    vi.mocked(mockRepo.delete).mockResolvedValue(undefined);
    const result = await useCase.execute('ws-1', createContext());
    expect(result.success).toBe(true);
    expect(mockRepo.delete).toHaveBeenCalledOnce();
  });

  it('should handle repository error', async () => {
    vi.mocked(mockRepo.delete).mockRejectedValue(new Error('DB error'));
    const result = await useCase.execute('ws-1', createContext());
    expect(result.success).toBe(false);
  });
});
