import type { Result, AppError } from '@mydash/shared';
import type { Query, QueryHandler, QueryMetadata } from './base.js';
import type { AnalyticsRepository } from '../../domain/analytics/repository.js';
import type { AnalyticsSummary } from '../../domain/analytics/entities.js';
import type { CacheManager } from '../../infrastructure/redis/cache.js';
import type { Logger } from '../../logging/index.js';
export interface GetAnalyticsSummaryQuery extends Query {
  serverId: string;
  windowMs: number;
}
export const getAnalyticsSummaryMetadata: QueryMetadata = {
  queryType: 'GetAnalyticsSummary',
  description: 'Get cached or stored analytics summary for a server',
  requiresAuth: false,
  cacheable: true,
  cacheTtlSeconds: 30,
  paginated: false,
};
export class GetAnalyticsSummaryQueryHandler implements QueryHandler<GetAnalyticsSummaryQuery, AnalyticsSummary | null> {
  public readonly queryType = 'GetAnalyticsSummary';
  public readonly metadata = getAnalyticsSummaryMetadata;
  constructor(
    private readonly repository: AnalyticsRepository,
    private readonly cache: CacheManager,
    private readonly logger: Logger,
  ) {}
  async execute(query: GetAnalyticsSummaryQuery): Promise<Result<AnalyticsSummary | null, AppError>> {
    try {
      const cacheKey = `analytics:summary:${query.serverId}:${String(query.windowMs)}`;
      const cached = await this.cache.get(cacheKey);
      if (cached) {
        return { success: true, data: cached as AnalyticsSummary, error: null };
      }
      const summary = await this.repository.getSummary(query.serverId, query.windowMs);
      return { success: true, data: summary, error: null };
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      this.logger.error('failed to get analytics summary', error, {
        correlationId: query.correlationId,
        serverId: query.serverId,
      });
      return {
        success: false,
        data: null,
        error: { name: error.name, message: error.message, code: 'ANALYTICS_QUERY_FAILED' } as AppError,
      };
    }
  }
}
