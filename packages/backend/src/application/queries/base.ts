import type { Result } from '@mydash/shared';
import type { AppError } from '@mydash/shared';

export interface Query {
  readonly queryId: string;
  readonly correlationId: string;
  readonly workspaceId: string;
}

export interface QueryHandler<TQuery extends Query, TResult> {
  queryType: string;
  metadata: QueryMetadata;
  execute(query: TQuery): Promise<Result<TResult, AppError>>;
}

export interface QueryBus {
  execute<TResult>(query: Query): Promise<Result<TResult, AppError>>;
  register<TQuery extends Query, TResult>(handler: QueryHandler<TQuery, TResult>): void;
}

export interface QueryMetadata {
  queryType: string;
  description: string;
  requiresAuth: boolean;
  cacheable: boolean;
  cacheTtlSeconds: number;
  paginated: boolean;
}
