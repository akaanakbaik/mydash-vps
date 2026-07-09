export interface TransactionBoundary {
  readonly transactionId: string;
  readonly startedAt: Date;
  begin(): Promise<void>;
  commit(): Promise<void>;
  rollback(): Promise<void>;
  isActive(): boolean;
}

export interface UnitOfWork {
  start(correlationId: string): Promise<TransactionBoundary>;
  complete(transaction: TransactionBoundary): Promise<void>;
  rollback(transaction: TransactionBoundary): Promise<void>;
}

export interface TransactionalUseCase<TInput, TOutput> {
  execute(input: TInput, unitOfWork: UnitOfWork): Promise<TOutput>;
}

export interface TransactionContext {
  correlationId: string;
  workspaceId: string;
  transaction: TransactionBoundary;
}
