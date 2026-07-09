import type { Result, AppError, HealthScore } from '@mydash/shared';
import type { Query, QueryHandler, QueryMetadata } from './base.js';
import type { HealthScoreRepository } from '../../domain/healthScore/index.js';
import type { CacheManager } from '../../infrastructure/redis/cache.js';
import type { Logger } from '../../logging/index.js';

export interface GetHealthScoreQuery extends Query {
  serverId: string;
}

export const getHealthScoreMetadata: QueryMetadata = {
  queryType: 'GetHealthScore',
  description: 'Get the latest health score for a server',
  requiresAuth: false,
  cacheable: true,
  cacheTtlSeconds: 15,
  paginated: false,
};

export class GetHealthScoreQueryHandler implements QueryHandler<GetHealthScoreQuery, HealthScore | null> {
  public readonly queryType = 'GetHealthScore';
  public readonly metadata = getHealthScoreMetadata;

  constructor(
    private readonly repository: HealthScoreRepository,
    private readonly cache: CacheManager,
    private readonly logger: Logger,
  ) {}

  async execute(query: GetHealthScoreQuery): Promise<Result<HealthScore | null, AppError>> {
    try {
      const cacheKey = `health:score:${query.serverId}`;
      const cached = await this.cache.get(cacheKey);
      if (cached) return { success: true, data: cached as HealthScore, error: null };

      const score = await this.repository.findLatest(query.serverId);
      return { success: true, data: score, error: null };
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      this.logger.error('failed to get health score', error, { correlationId: query.correlationId });
      return {
        success: false,
        data: null,
        error: { name: error.name, message: error.message, code: 'HEALTH_QUERY_FAILED' } as AppError,
      };
    }
  }
}
