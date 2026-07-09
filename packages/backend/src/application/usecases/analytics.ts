import type { Result, AppError } from '@mydash/shared';
import type { UseCase, UseCaseContext, UseCaseMetadata } from './base.js';
import type { AnalyticsPipeline } from '../../domain/analytics/services.js';
import type { AnalyticsRepository } from '../../domain/analytics/repository.js';
import type { AnalyticsSummary } from '../../domain/analytics/entities.js';
import type { CacheManager } from '../../infrastructure/redis/cache.js';
import type { Logger } from '../../logging/index.js';

const calculateSummaryMetadata: UseCaseMetadata = {
  name: 'CalculateAnalyticsSummary',
  description: 'Execute analytics pipeline: aggregate, analyze trends, detect anomalies',
  category: 'Analytics',
  requiresAuth: false,
  idempotent: false,
  timeoutMs: 30000,
};

export class CalculateAnalyticsSummaryUseCase implements UseCase<{ serverId: string; windowMs: number }, AnalyticsSummary> {
  public readonly metadata = calculateSummaryMetadata;

  constructor(
    private readonly pipeline: AnalyticsPipeline,
    private readonly logger: Logger,
  ) {}

  async execute(
    input: { serverId: string; windowMs: number },
    context: UseCaseContext,
  ): Promise<Result<AnalyticsSummary, AppError>> {
    try {
      const summary = await this.pipeline.process(input.serverId, context.workspaceId, input.windowMs);

      this.logger.info('analytics calculation completed', {
        correlationId: context.correlationId,
        serverId: input.serverId,
      });

      return { success: true, data: summary, error: null };
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      this.logger.error('analytics calculation failed', error, {
        correlationId: context.correlationId,
        serverId: input.serverId,
      });
      return {
        success: false,
        data: null,
        error: { name: error.name, message: error.message, code: 'ANALYTICS_FAILED' } as AppError,
      };
    }
  }
}

const getSummaryMetadata: UseCaseMetadata = {
  name: 'GetAnalyticsSummary',
  description: 'Retrieve cached or stored analytics summary',
  category: 'Analytics',
  requiresAuth: false,
  idempotent: true,
  timeoutMs: 3000,
};

export class GetAnalyticsSummaryUseCase implements UseCase<{ serverId: string; windowMs: number }, AnalyticsSummary | null> {
  public readonly metadata = getSummaryMetadata;

  constructor(
    private readonly repository: AnalyticsRepository,
    private readonly cache: CacheManager,
  ) {}

  async execute(
    input: { serverId: string; windowMs: number },
    _context: UseCaseContext,
  ): Promise<Result<AnalyticsSummary | null, AppError>> {
    try {
      const cacheKey = `analytics:summary:${input.serverId}:${String(input.windowMs)}`;
      const cached = await this.cache.get(cacheKey);
      if (cached) return { success: true, data: cached as AnalyticsSummary, error: null };

      const summary = await this.repository.getSummary(input.serverId, input.windowMs);
      return { success: true, data: summary, error: null };
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      return {
        success: false,
        data: null,
        error: { name: error.name, message: error.message, code: 'ANALYTICS_GET_FAILED' } as AppError,
      };
    }
  }
}
