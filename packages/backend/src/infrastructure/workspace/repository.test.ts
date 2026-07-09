import { describe, it, expect, vi, beforeEach } from 'vitest';
import { WorkspaceRepositoryImpl, UserRepositoryImpl, ServerRepositoryImpl } from './repository.js';

function createThenable() {
  return {
    then: vi.fn((resolve: (v: never[]) => void) => { resolve([]); }),
    where: vi.fn(),
    orderBy: vi.fn(),
    limit: vi.fn(),
  };
}

function createMockDb() {
  const thenable = createThenable();
  thenable.where = vi.fn().mockReturnValue(thenable);
  thenable.orderBy = vi.fn().mockReturnValue(thenable);
  thenable.limit = vi.fn().mockReturnValue(thenable);

  return {
    select: vi.fn().mockReturnValue({ from: vi.fn().mockReturnValue(thenable) }),
    insert: vi.fn().mockReturnValue({ values: vi.fn().mockReturnValue({ onConflictDoUpdate: vi.fn().mockResolvedValue(undefined) }) }),
    delete: vi.fn().mockReturnValue({ where: vi.fn().mockResolvedValue(undefined) }),
  } as never;
}

describe('WorkspaceRepositoryImpl', () => {
  let repo: WorkspaceRepositoryImpl;
  beforeEach(() => { vi.clearAllMocks(); repo = new WorkspaceRepositoryImpl(createMockDb()); });
  it('findById', async () => { expect(await repo.findById('ws-1' as never)).toBeNull(); });
  it('findAll', async () => { expect(await repo.findAll()).toEqual([]); });
  it('save', async () => { await repo.save({ id: 'ws-1' as never, name: 'test', displayName: 'Test', timezone: 'UTC', language: 'en', deletedAt: null, createdAt: new Date(), updatedAt: new Date(), version: 1 }); });
  it('delete', async () => { await repo.delete('ws-1' as never); });
});

describe('UserRepositoryImpl', () => {
  let repo: UserRepositoryImpl;
  beforeEach(() => { vi.clearAllMocks(); repo = new UserRepositoryImpl(createMockDb()); });
  it('findById', async () => { expect(await repo.findById('u1' as never)).toBeNull(); });
  it('findByEmail', async () => { expect(await repo.findByEmail('a@b.com')).toBeNull(); });
  it('findByWorkspaceId', async () => { expect(await repo.findByWorkspaceId('ws-1')).toEqual([]); });
  it('save', async () => { await repo.save({ id: 'u1' as never, workspaceId: 'ws-1' as never, email: 'a@b.com', displayName: 'Admin', passwordHash: 'hash', role: 'owner', lastLoginAt: null, createdAt: new Date(), updatedAt: new Date() }); });
  it('delete', async () => { await repo.delete('u1' as never); });
});

describe('ServerRepositoryImpl', () => {
  let repo: ServerRepositoryImpl;
  beforeEach(() => { vi.clearAllMocks(); repo = new ServerRepositoryImpl(createMockDb()); });
  it('findById', async () => { expect(await repo.findById('srv-1' as never)).toBeNull(); });
  it('findByWorkspaceId', async () => { expect(await repo.findByWorkspaceId('ws-1')).toEqual([]); });
  it('save', async () => { await repo.save({ id: 'srv-1' as never, workspaceId: 'ws-1' as never, hostname: 'h1', displayName: 'S1', operatingSystem: '', kernel: '', architecture: '', cpuModel: '', cpuCores: 0, totalRamBytes: 0, totalDiskBytes: 0, publicIpv4: '', publicIpv6: null, timezone: 'UTC', agentVersion: '', lastHeartbeat: null, createdAt: new Date(), updatedAt: new Date(), version: 1 }); });
  it('delete', async () => { await repo.delete('srv-1' as never); });
});
