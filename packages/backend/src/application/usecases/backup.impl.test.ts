import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CreateBackupUseCaseImpl, ListBackupsUseCaseImpl, RestoreBackupUseCaseImpl } from './backup.impl.js';
import type { BackupRepository } from '../../domain/backup/index.js';
import type { Logger } from '../../logging/index.js';

const mockLogger: Logger = {
  trace: vi.fn(), debug: vi.fn(), info: vi.fn(), success: vi.fn(),
  warn: vi.fn(), error: vi.fn(), critical: vi.fn(), emergency: vi.fn(),
  child: vi.fn(),
};

const mockRepo: BackupRepository = {
  saveConfig: vi.fn(),
  getConfig: vi.fn(),
  saveRecord: vi.fn(),
  findById: vi.fn(),
  findByWorkspaceId: vi.fn(),
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

describe('CreateBackupUseCaseImpl', () => {
  let useCase: CreateBackupUseCaseImpl;

  beforeEach(() => {
    vi.clearAllMocks();
    useCase = new CreateBackupUseCaseImpl(mockRepo, mockLogger);
  });

  it('should create a backup record', async () => {
    vi.mocked(mockRepo.saveRecord).mockResolvedValue(undefined);

    const result = await useCase.execute(
      { serverId: 'srv-1', mode: 'full' },
      createContext(),
    );

    expect(result.success).toBe(true);
    expect(mockRepo.saveRecord).toHaveBeenCalledOnce();
    if (result.success && result.data) {
      const data = result.data as Record<string, unknown>;
      expect(data.serverId).toBe('srv-1');
      expect(data.mode).toBe('full');
    }
  });

  it('should handle repository failure', async () => {
    vi.mocked(mockRepo.saveRecord).mockRejectedValue(new Error('DB error'));

    const result = await useCase.execute(
      { serverId: 'srv-1', mode: 'full' },
      createContext(),
    );

    expect(result.success).toBe(false);
    if (result.error) {
      expect(result.error.code).toBe('BACKUP_CREATE_FAILED');
    }
  });
});

describe('ListBackupsUseCaseImpl', () => {
  let useCase: ListBackupsUseCaseImpl;

  beforeEach(() => {
    vi.clearAllMocks();
    useCase = new ListBackupsUseCaseImpl(mockRepo);
  });

  it('should return backup list', async () => {
    vi.mocked(mockRepo.findByWorkspaceId).mockResolvedValue([]);
    const result = await useCase.execute('ws-1', createContext());
    expect(result.success).toBe(true);
    expect(mockRepo.findByWorkspaceId).toHaveBeenCalledWith('ws-1');
  });

  it('should handle error', async () => {
    vi.mocked(mockRepo.findByWorkspaceId).mockRejectedValue(new Error('error'));
    const result = await useCase.execute('ws-1', createContext());
    expect(result.success).toBe(false);
  });
});

describe('RestoreBackupUseCaseImpl', () => {
  let useCase: RestoreBackupUseCaseImpl;

  beforeEach(() => {
    vi.clearAllMocks();
    useCase = new RestoreBackupUseCaseImpl(mockRepo, mockLogger);
  });

  it('should initiate restore for existing backup', async () => {
    vi.mocked(mockRepo.findById).mockResolvedValue({
      id: 'backup-1',
      workspaceId: 'default',
      serverId: 'srv-1',
      configId: 'config-1',
      mode: 'full' as never,
      status: 'completed' as never,
      sizeBytes: 1000,
      compressionRatio: 1,
      encryptionEnabled: false,
      checksum: 'abc123',
      storagePath: '/backups',
      durationMs: 5000,
      errorDetails: null,
      createdAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
    });

    const result = await useCase.execute('backup-1', createContext());
    expect(result.success).toBe(true);
    if (result.success && result.data) {
      const data = result.data as Record<string, unknown>;
      expect(data.status).toBe('restoring');
    }
  });

  it('should return error for non-existent backup', async () => {
    vi.mocked(mockRepo.findById).mockResolvedValue(null);
    const result = await useCase.execute('nonexistent', createContext());
    expect(result.success).toBe(false);
    if (result.error) {
      expect(result.error.code).toBe('BACKUP_NOT_FOUND');
    }
  });
});
