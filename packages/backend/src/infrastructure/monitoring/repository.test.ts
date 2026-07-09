import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MetricRepositoryImpl } from './index.js';
import type { Logger } from '../../logging/index.js';

const mockLogger: Logger = {
  trace: vi.fn(), debug: vi.fn(), info: vi.fn(), success: vi.fn(),
  warn: vi.fn(), error: vi.fn(), critical: vi.fn(), emergency: vi.fn(),
  child: vi.fn(),
};

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
    insert: vi.fn().mockReturnValue({ values: vi.fn().mockResolvedValue(undefined) }),
    delete: vi.fn().mockReturnValue({ where: vi.fn().mockResolvedValue({ rowCount: 0 }) }),
  } as never;
}

describe('MetricRepositoryImpl', () => {
  let repo: MetricRepositoryImpl;

  beforeEach(() => {
    vi.clearAllMocks();
    repo = new MetricRepositoryImpl(createMockDb(), mockLogger);
  });

  it('findLatest returns null', async () => { expect(await repo.findLatest('srv-1', 'cpu' as never)).toBeNull(); });
  it('findByType returns empty', async () => { expect(await repo.findByType('srv-1', 'cpu' as never, 10)).toEqual([]); });
  it('findInWindow returns empty', async () => { expect(await repo.findInWindow('srv-1', 3600000)).toEqual([]); });
  it('save succeeds', async () => {
    await repo.save({
      header: { id: 'm1', workspaceId: 'ws-1', serverId: 'srv-1', metricType: 'cpu', correlationId: 'c1', version: 1 },
      recordedAt: new Date(),
    } as never);
  });
  it('deleteOlderThan', async () => { expect(await repo.deleteOlderThan(new Date())).toBe(0); });
  it('saveBatch empty', async () => { await repo.saveBatch([]); });
  it('saveBatch with data', async () => {
    await repo.saveBatch([{
      header: { id: 'm1', workspaceId: 'ws-1', serverId: 'srv-1', metricType: 'cpu', correlationId: 'c1', version: 1 },
      recordedAt: new Date(),
    } as never]);
  });
});
