import { AsyncLocalStorage } from 'node:async_hooks';
import type { DrizzleClient } from '../connection.js';

const transactionStorage = new AsyncLocalStorage<DrizzleClient>();

export function setActiveTransaction(client: DrizzleClient): void {
  transactionStorage.enterWith(client);
}

/**
 * Runs a function within a transaction context. The transaction client
 * is automatically scoped to the callback and cleaned up afterward,
 * preventing stale transaction references from leaking.
 */
export function runWithTransaction<T>(client: DrizzleClient, fn: () => Promise<T>): Promise<T> {
  return transactionStorage.run(client, fn);
}

export function getActiveTransaction(): DrizzleClient | undefined {
  return transactionStorage.getStore();
}

/**
 * Returns the active transaction-scoped database client if one exists,
 * otherwise falls back to the pool-level client.
 */
export function getDb(baseDb: DrizzleClient): DrizzleClient {
  return transactionStorage.getStore() ?? baseDb;
}

/**
 * Wraps a DrizzleClient in a Proxy that automatically checks for an active
 * transaction context on every property access (select, insert, update, delete).
 *
 * Repositories should wrap their base db in the constructor:
 *   this.db = makeTransactionalDb(baseDb);
 *
 * This ensures all queries participate in the active transaction without
 * requiring every method to call getDb() manually.
 */
function createProxyHandler(baseDb: DrizzleClient): ProxyHandler<DrizzleClient> {
  return {
    get(_target, prop, _receiver) {
      const activeTx = transactionStorage.getStore();
      const source = activeTx ?? baseDb;
      const obj = source as unknown as Record<string | symbol, unknown>;
      const value = obj[prop] as DrizzleClient[keyof DrizzleClient] | undefined;
      if (typeof value === 'function') {
        return value.bind(source) as unknown;
      }
      return value as unknown;
    },
  };
}

export function makeTransactionalDb(baseDb: DrizzleClient): DrizzleClient {
  return new Proxy(baseDb, createProxyHandler(baseDb));
}
