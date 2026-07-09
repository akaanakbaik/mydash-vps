import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BackupRepositoryImpl } from './repository.js';
import type { BackupConfig, BackupRecord } from '@mydash/shared';

function createThenable() {
  const t = {
    then: vi.fn((resolve: (v: never[]) => void) => { resolve([]); }),
    where: vi.fn(),
    orderBy: vi.fn(),
    limit: vi.fn(),
  };
  t.where = vi.fn().mockReturnValue(t);
  t.orderBy = vi.fn().mockReturnValue(t);
  t.limit = vi.fn().mockReturnValue(t);
  return t;
}

function createMockDb() {
  const thenable = createThenable();
  return {
    select: vi.fn().mockReturnValue({ from: vi.fn().mockReturnValue(thenable) }),
    insert: vi.fn().mockReturnValue({ values: vi.fn().mockReturnValue({ onConflictDoUpdate: vi.fn().mockResolvedValue(undefined) }) }),
    delete: vi.fn().mockReturnValue({ where: vi.fn().mockResolvedValue(undefined) }),
  } as never;
}

function createSampleConfig(overrides?: Partial<BackupConfig>): BackupConfig {
  return {
    id: 'c1',
    workspaceId: 'ws-1',
    serverId: 'srv-1',
    enabled: true,
    schedule: '0 3 * * *',
    mode: 'full' as BackupConfig['mode'],
    retentionDays: 30,
    maxBackups: 10,
    storagePath: '/backups',
    ...overrides,
  } as BackupConfig;
}

function createSampleRecord(overrides?: Partial<BackupRecord>): BackupRecord {
  return {
    id: 'r1',
    workspaceId: 'ws-1',
    serverId: 'srv-1',
    configId: 'c1',
    mode: 'full' as BackupRecord['mode'],
    status: 'completed' as BackupRecord['status'],
    sizeBytes: 1024,
    storagePath: '/backups',
    durationMs: 5000,
    createdAt: new Date().toISOString(),
    ...overrides,
  } as BackupRecord;
}

describe('BackupRepositoryImpl', () => {
  let repo: BackupRepositoryImpl;

  beforeEach(() => {
    vi.clearAllMocks();
    repo = new BackupRepositoryImpl(createMockDb());
  });

  it('should be defined', () => { expect(repo).toBeDefined(); });
  it('should getConfig', async () => { expect(await repo.getConfig('ws-1')).toBeNull(); });
  it('should saveConfig', async () => { await repo.saveConfig(createSampleConfig()); });
  it('should saveRecord', async () => { await repo.saveRecord(createSampleRecord()); });
  it('should findById', async () => { expect(await repo.findById('r1')).toBeNull(); });
  it('should findByWorkspaceId', async () => { expect(await repo.findByWorkspaceId('ws-1')).toEqual([]); });
});
