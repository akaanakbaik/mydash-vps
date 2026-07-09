import type { Result, AppError, HealthScore, DomainEvent } from '@mydash/shared';
import { Severity, Priority, EventCategory } from '@mydash/shared';
import type { UseCase, UseCaseContext, UseCaseMetadata } from './base.js';
import type { HealthCalculator } from '../../domain/healthScore/services.js';
import type { HealthScoreRepository } from '../../domain/healthScore/index.js';
import type { CacheManager } from '../../infrastructure/redis/cache.js';
import type { EventBus } from '../../eventBus/contracts.js';
import type { Logger } from '../../logging/index.js';

const calculateMetadata: UseCaseMetadata = {
  name: 'CalculateHealthScore',
  description: 'Calculate health score for a server using weighted multi-domain evaluation',
  category: 'HealthScore',
  requiresAuth: false,
  idempotent: false,
  timeoutMs: 15000,
};

export class CalculateHealthScoreUseCase implements UseCase<{ serverId: string }, HealthScore> {
  public readonly metadata = calculateMetadata;

  constructor(
    private readonly calculator: HealthCalculator,
    private readonly repository: HealthScoreRepository,
    private readonly cache: CacheManager,
    private readonly eventBus: EventBus,
    private readonly logger: Logger,
  ) {}

  async execute(
    input: { serverId: string },
    context: UseCaseContext,
  ): Promise<Result<HealthScore, AppError>> {
    try {
      const score = await this.calculator.calculate(input.serverId, context.workspaceId);

      await this.repository.save(score);

      const cacheKey = `health:score:${input.serverId}`;
      await this.cache.set(cacheKey, score, 60);

      const envelope = {
        id: crypto.randomUUID(),
        workspaceId: context.workspaceId,
        serverId: input.serverId,
        sequenceNumber: 0,
        timestamp: new Date().toISOString(),
        eventType: 'health.score.calculated',
        payload: score,
        checksum: '',
        correlationId: context.correlationId,
        traceId: crypto.randomUUID(),
        version: 1,
      };

      await this.eventBus.publish({
        envelope,
        severity: Severity.Information,
        priority: Priority.Normal,
        category: EventCategory.System,
        source: 'health-score-engine',
      } as unknown as DomainEvent);

      this.logger.info('health score calculated', {
        serverId: input.serverId,
        overall: score.overall,
        grade: score.grade,
      });

      return { success: true, data: score, error: null };
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      this.logger.error('health score calculation failed', error, {
        correlationId: context.correlationId,
        serverId: input.serverId,
      });
      return {
        success: false,
        data: null,
        error: { name: error.name, message: error.message, code: 'HEALTH_CALC_FAILED' } as AppError,
      };
    }
  }
}

const getHealthMetadata: UseCaseMetadata = {
  name: 'GetHealthScore',
  description: 'Get latest health score for a server',
  category: 'HealthScore',
  requiresAuth: false,
  idempotent: true,
  timeoutMs: 3000,
};

export class GetHealthScoreUseCase implements UseCase<{ serverId: string }, HealthScore | null> {
  public readonly metadata = getHealthMetadata;

  constructor(
    private readonly repository: HealthScoreRepository,
    private readonly cache: CacheManager,
  ) {}

  async execute(
    input: { serverId: string },
    _context: UseCaseContext,
  ): Promise<Result<HealthScore | null, AppError>> {
    try {
      const cacheKey = `health:score:${input.serverId}`;
      const cached = await this.cache.get(cacheKey);
      if (cached) return { success: true, data: cached as HealthScore, error: null };

      const score = await this.repository.findLatest(input.serverId);
      return { success: true, data: score, error: null };
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      return {
        success: false,
        data: null,
        error: { name: error.name, message: error.message, code: 'HEALTH_GET_FAILED' } as AppError,
      };
    }
  }
}
