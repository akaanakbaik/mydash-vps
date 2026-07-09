import type { Result, AppError, Metric } from '@mydash/shared';
import type { MetricType } from '@mydash/shared';
import type { Query, QueryHandler, QueryMetadata } from './base.js';
import type { MetricRepository } from '../../domain/monitoring/repository.js';
import type { CacheManager } from '../../infrastructure/redis/cache.js';
import type { Logger } from '../../logging/index.js';

export interface GetLatestMetricsQuery extends Query {
  serverId: string;
  metricTypes?: MetricType[];
}

export const getLatestMetricsMetadata: QueryMetadata = {
  queryType: 'GetLatestMetrics',
  description: 'Retrieve latest metrics for a server from cache or database',
  requiresAuth: false,
  cacheable: true,
  cacheTtlSeconds: 15,
  paginated: false,
};

export class GetLatestMetricsQueryHandler implements QueryHandler<GetLatestMetricsQuery, Metric[]> {
  public readonly queryType = 'GetLatestMetrics';
  public readonly metadata = getLatestMetricsMetadata;

  constructor(
    private readonly repository: MetricRepository,
    private readonly cache: CacheManager,
    private readonly logger: Logger,
  ) {}

  async execute(query: GetLatestMetricsQuery): Promise<Result<Metric[], AppError>> {
    try {
      const types = query.metricTypes ?? [];
      const results: Metric[] = [];

      for (const metricType of types) {
        const cacheKey = `metrics:latest:${query.serverId}:${metricType}`;
        const cached = await this.cache.get(cacheKey);

        if (cached) {
          results.push(cached as Metric);
        } else {
          const metric = await this.repository.findLatest(query.serverId, metricType);
          if (metric) {
            await this.cache.set(cacheKey, metric, 30);
            results.push(metric);
          }
        }
      }

      return { success: true, data: results, error: null };
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      this.logger.error('failed to get latest metrics', error, {
        correlationId: query.correlationId,
        serverId: query.serverId,
      });
      return {
        success: false,
        data: null,
        error: { name: error.name, message: error.message, code: 'MONITORING_QUERY_FAILED' } as AppError,
      };
    }
  }
}

export interface GetMetricWindowQuery extends Query {
  serverId: string;
  windowMs: number;
  metricType?: MetricType;
}

export const getMetricWindowMetadata: QueryMetadata = {
  queryType: 'GetMetricWindow',
  description: 'Retrieve metrics within a time window',
  requiresAuth: false,
  cacheable: false,
  cacheTtlSeconds: 0,
  paginated: false,
};

export class GetMetricWindowQueryHandler implements QueryHandler<GetMetricWindowQuery, Metric[]> {
  public readonly queryType = 'GetMetricWindow';
  public readonly metadata = getMetricWindowMetadata;

  constructor(
    private readonly repository: MetricRepository,
    private readonly logger: Logger,
  ) {}

  async execute(query: GetMetricWindowQuery): Promise<Result<Metric[], AppError>> {
    try {
      const metrics = await this.repository.findInWindow(query.serverId, query.windowMs);

      if (query.metricType) {
        return {
          success: true,
          data: metrics.filter((m) => m.header.metricType === query.metricType),
          error: null,
        };
      }

      return { success: true, data: metrics, error: null };
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      this.logger.error('failed to get metric window', error, {
        correlationId: query.correlationId,
        serverId: query.serverId,
      });
      return {
        success: false,
        data: null,
        error: { name: error.name, message: error.message, code: 'MONITORING_WINDOW_FAILED' } as AppError,
      };
    }
  }
}
