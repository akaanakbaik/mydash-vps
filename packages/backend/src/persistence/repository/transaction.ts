import type { DrizzleClient } from '../connection.js';
import type { Logger } from '../../logging/index.js';
import type { TransactionManager } from '../../infrastructure/database/transaction.js';
import type { UnitOfWork, TransactionBoundary } from '../../application/transactions/contracts.js';
import type { Transaction } from '../../infrastructure/database/transaction.js';
import { runWithTransaction } from './transactionContext.js';
export class DrizzleTransactionManager implements TransactionManager {
  private readonly db: DrizzleClient;
  constructor(db: DrizzleClient, _logger: Logger) {
    this.db = db;
  }
  begin(): Promise<Transaction> {
    return Promise.resolve({
      execute: async <T>(fn: () => Promise<T>): Promise<T> => {
        return this.db.transaction(async (tx) => {
          const txClient = tx as unknown as DrizzleClient;
          return runWithTransaction(txClient, fn);
        });
      },
      rollback(): Promise<void> { return Promise.resolve(); },
      commit(): Promise<void> { return Promise.resolve(); },
    });
  }
  async runInTransaction<T>(fn: (tx: Transaction) => Promise<T>): Promise<T> {
    return this.db.transaction(async (drizzleTx) => {
      const txClient = drizzleTx as unknown as DrizzleClient;
      const tx: Transaction = {
        execute: async <U>(innerFn: () => Promise<U>): Promise<U> => {
          return runWithTransaction(txClient, innerFn);
        },
        rollback(): Promise<void> { return Promise.resolve(); },
        commit(): Promise<void> { return Promise.resolve(); },
      };
      return fn(tx);
    });
  }
}
export class DrizzleUnitOfWork implements UnitOfWork {
  private readonly log: Logger;
  constructor(_db: DrizzleClient, logger: Logger) {
    this.log = logger;
  }
  start(correlationId: string): Promise<TransactionBoundary> {
    const transactionId = crypto.randomUUID();
    let active = true;
    const log = this.log;
    log.info('uow start', { correlationId, transactionId });
    return Promise.resolve({
      transactionId,
      startedAt: new Date(),
      begin(): Promise<void> { log.info('uow begin', { correlationId, transactionId }); return Promise.resolve(); },
      commit(): Promise<void> { active = false; return Promise.resolve(); },
      rollback(): Promise<void> { active = false; return Promise.resolve(); },
      isActive: () => active,
    });
  }
  async complete(transaction: TransactionBoundary): Promise<void> {
    if (transaction.isActive()) {
      await transaction.commit();
    }
  }
  async rollback(transaction: TransactionBoundary): Promise<void> {
    if (transaction.isActive()) {
      await transaction.rollback();
    }
  }
}
