import { AsyncLocalStorage } from 'node:async_hooks';
import type { DrizzleClient } from '../connection.js';
const transactionStorage = new AsyncLocalStorage<DrizzleClient>();
export function setActiveTransaction(client: DrizzleClient): void {
  transactionStorage.enterWith(client);
}
export function runWithTransaction<T>(client: DrizzleClient, fn: () => Promise<T>): Promise<T> {
  return transactionStorage.run(client, fn);
}
export function getActiveTransaction(): DrizzleClient | undefined {
  return transactionStorage.getStore();
}
export function getDb(baseDb: DrizzleClient): DrizzleClient {
  return transactionStorage.getStore() ?? baseDb;
}
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
