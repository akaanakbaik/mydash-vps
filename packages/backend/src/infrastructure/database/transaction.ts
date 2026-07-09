export interface Transaction {
  execute<T>(fn: () => Promise<T>): Promise<T>;
  rollback(): Promise<void>;
  commit(): Promise<void>;
}

export interface TransactionManager {
  begin(): Promise<Transaction>;
  runInTransaction<T>(fn: (tx: Transaction) => Promise<T>): Promise<T>;
}
