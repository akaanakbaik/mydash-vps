import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SessionRepositoryImpl } from './repository.js';
import { SessionStatus } from '../../domain/auth/entities.js';
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
describe('SessionRepositoryImpl', () => {
  let repo: SessionRepositoryImpl;
  beforeEach(() => {
    vi.clearAllMocks();
    repo = new SessionRepositoryImpl(createMockDb());
  });
  it('should be defined', () => { expect(repo).toBeDefined(); });
  it('findById returns null', async () => { expect(await repo.findById('s1' as never)).toBeNull(); });
  it('findByToken returns null', async () => { expect(await repo.findByToken('t1')).toBeNull(); });
  it('save succeeds', async () => {
    await repo.save({ id: 's1' as never, workspaceId: 'ws-1' as never, userId: 'u1' as never, sessionIdentifier: 't1', device: '', browser: '', ipAddress: '', operatingSystem: '', trusted: false, expiresAt: new Date(), lastActivityAt: new Date(), status: SessionStatus.Active, createdAt: new Date(), updatedAt: new Date() });
  });
  it('delete succeeds', async () => { await repo.delete('s1' as never); });
  it('findByWorkspaceId returns empty', async () => { expect(await repo.findByWorkspaceId('ws-1')).toEqual([]); });
  it('expireAll succeeds', async () => { await repo.expireAll('u1'); });
});
