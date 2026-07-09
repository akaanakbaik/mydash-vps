import type { Result } from '@mydash/shared';
import { AppError } from '@mydash/shared';
import type { Query, QueryHandler, QueryBus } from '../queries/base.js';
import type { Logger } from '../../logging/index.js';

export class InMemoryQueryBus implements QueryBus {
  private readonly handlers = new Map<string, QueryHandler<Query, unknown>>();
  private readonly logger: Logger;

  constructor(logger: Logger) {
    this.logger = logger;
  }

  async execute<TResult>(query: Query): Promise<Result<TResult, AppError>> {
    const queryType = query.constructor.name;
    const handler = this.handlers.get(queryType);

    if (!handler) {
      const err = new AppError({
        code: 'NO_HANDLER',
        message: `No handler registered for query: ${queryType}`,
        statusCode: 500,
        severity: 'error',
        correlationId: query.correlationId,
      });
      return { success: false, data: null, error: err };
    }

    try {
      const result = await handler.execute(query);
      return result as Result<TResult, AppError>;
    } catch (error) {
      const err = error instanceof AppError
        ? error
        : new AppError({
            code: 'QUERY_FAILED',
            message: error instanceof Error ? error.message : String(error),
            statusCode: 500,
            severity: 'error',
            correlationId: query.correlationId,
          });
      return { success: false, data: null, error: err };
    }
  }

  register<TQuery extends Query, TResult>(handler: QueryHandler<TQuery, TResult>): void {
    this.handlers.set(handler.queryType, handler);
    this.logger.info(`Registered query: ${handler.queryType}`);
  }
}
