import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DrizzleTransactionManager, DrizzleUnitOfWork } from './transaction.js';
import type { Logger } from '../../logging/index.js';
import type { DrizzleClient } from '../connection.js';

const mockLogger: Logger = {
  trace: vi.fn(), debug: vi.fn(), info: vi.fn(), success: vi.fn(),
  warn: vi.fn(), error: vi.fn(), critical: vi.fn(), emergency: vi.fn(),
  child: vi.fn(),
};

function createMockDb() {
  const txFn = <T>(fn: (tx: unknown) => Promise<T>): Promise<T> => {
    return fn({});
  };
  return {
    transaction: vi.fn().mockImplementation(txFn),
    select: vi.fn(),
    insert: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  } as unknown as DrizzleClient;
}

describe('DrizzleTransactionManager', () => {
  let manager: DrizzleTransactionManager;
  let mockDb: DrizzleClient;

  beforeEach(() => {
    vi.clearAllMocks();
    mockDb = createMockDb();
    manager = new DrizzleTransactionManager(mockDb, mockLogger);
  });

  describe('begin', () => {
    it('should return a Transaction object', async () => {
      const tx = await manager.begin();
      expect(tx).toBeDefined();
      expect(typeof tx.execute).toBe('function');
      expect(typeof tx.rollback).toBe('function');
      expect(typeof tx.commit).toBe('function');
    });

    it('should execute fn inside a drizzle transaction', async () => {
      const tx = await manager.begin();
      const innerFn = vi.fn().mockResolvedValue('result');

      const result = await tx.execute(innerFn);

      expect(result).toBe('result');
      expect(mockDb.transaction).toHaveBeenCalledTimes(1);
    });

    it('should propagate return value from inner fn', async () => {
      const tx = await manager.begin();      const result = await tx.execute(() => Promise.resolve(42));
      expect(result).toBe(42);
    });

    it('should handle rollback gracefully', async () => {
      const tx = await manager.begin();
      await expect(tx.rollback()).resolves.toBeUndefined();
    });

    it('should handle commit gracefully', async () => {
      const tx = await manager.begin();
      await expect(tx.commit()).resolves.toBeUndefined();
    });

    it('should execute multiple operations sequentially', async () => {
      const tx = await manager.begin();
      const order: number[] = [];

      await tx.execute(() => { order.push(1); return Promise.resolve(); });
      await tx.execute(() => { order.push(2); return Promise.resolve(); });
      await tx.execute(() => { order.push(3); return Promise.resolve(); });

      expect(order).toEqual([1, 2, 3]);
    });

    it('should throw when inner fn throws', async () => {
      const tx = await manager.begin();

      await expect(tx.execute(() => Promise.reject(new Error('inner failed')))).rejects.toThrow();
    });
  });

  describe('runInTransaction', () => {
    it('should execute fn with Transaction object', async () => {
      const fn = vi.fn().mockResolvedValue('result');
      const result = await manager.runInTransaction(fn);

      expect(result).toBe('result');
      const expectedObj = expect.objectContaining({
        execute: expect.any(Function) as unknown,
        rollback: expect.any(Function) as unknown,
        commit: expect.any(Function) as unknown,
      }) as unknown;
      expect(fn).toHaveBeenCalledWith(expectedObj);
    });

    it('should call drizzle transaction', async () => {
      await manager.runInTransaction(() => Promise.resolve('ok'));
      expect(mockDb.transaction).toHaveBeenCalledTimes(1);
    });

    it('should execute inner operations in order', async () => {
      const order: number[] = [];
      await manager.runInTransaction(async (tx) => {
        await tx.execute(() => { order.push(1); return Promise.resolve(); });
        await tx.execute(() => { order.push(2); return Promise.resolve(); });
      });
      expect(order).toEqual([1, 2]);
    });
  });
});

describe('DrizzleUnitOfWork', () => {
  let uow: DrizzleUnitOfWork;
  let mockDb: DrizzleClient;

  beforeEach(() => {
    vi.clearAllMocks();
    mockDb = createMockDb();
    uow = new DrizzleUnitOfWork(mockDb, mockLogger);
  });

  it('should start a transaction boundary', async () => {
    const boundary = await uow.start('test-corr-id');
    expect(boundary.transactionId).toBeDefined();
    expect(boundary.isActive()).toBe(true);
  });

  it('should complete active boundary', async () => {
    const boundary = await uow.start('test-corr-id');
    expect(boundary.isActive()).toBe(true);

    await uow.complete(boundary);
    expect(boundary.isActive()).toBe(false);
  });

  it('should not double-complete boundary', async () => {
    const boundary = await uow.start('test-corr-id');
    await uow.complete(boundary);
    await uow.complete(boundary);
    expect(boundary.isActive()).toBe(false);
  });

  it('should rollback active boundary', async () => {
    const boundary = await uow.start('test-corr-id');
    await uow.rollback(boundary);
    expect(boundary.isActive()).toBe(false);
  });

  it('should have unique transaction ids', async () => {
    const b1 = await uow.start('corr-1');
    const b2 = await uow.start('corr-2');
    expect(b1.transactionId).not.toBe(b2.transactionId);
  });
});
