import type { Metric } from '@mydash/shared';
import type { Result, AppError } from '@mydash/shared';
import type { UseCase, UseCaseContext, UseCaseMetadata } from './base.js';
import type { MetricIngestDTO } from '../dto/index.js';
import type { MetricRepository } from '../../domain/monitoring/repository.js';
import type { MetricValidator } from '../../domain/monitoring/services.js';
import type { MetricNormalizer } from '../../domain/monitoring/services.js';
import type { EventBus } from '../../eventBus/contracts.js';
import type { CacheManager } from '../../infrastructure/redis/cache.js';
import type { Logger } from '../../logging/index.js';
import { MetricType, Severity, Priority, EventCategory } from '@mydash/shared';
import type { MetricEvent } from '@mydash/shared';

const ingestMetadata: UseCaseMetadata = {
  name: 'IngestMetric',
  description: 'Validate, normalize, persist, cache, and publish a metric',
  category: 'Monitoring',
  requiresAuth: false,
  idempotent: true,
  timeoutMs: 5000,
};

export class IngestMetricUseCase implements UseCase<MetricIngestDTO, void> {
  public readonly metadata = ingestMetadata;

  constructor(
    private readonly repository: MetricRepository,
    private readonly validator: MetricValidator,
    private readonly normalizer: MetricNormalizer,
    private readonly eventBus: EventBus,
    private readonly cache: CacheManager,
    private readonly logger: Logger,
  ) {}

  async execute(input: MetricIngestDTO, context: UseCaseContext): Promise<Result<void, AppError>> {
    try {
      const header = {
        id: crypto.randomUUID(),
        workspaceId: context.workspaceId,
        serverId: input.serverId,
        timestamp: new Date().toISOString(),
        metricType: input.metricType as MetricType,
        correlationId: context.correlationId,
        version: 1,
      };

      const metric: Metric = {
        header,
        ...input.data,
      } as unknown as Metric;

      const validation = this.validator.validate(metric);

      if (!validation.valid) {
        this.logger.warn('metric validation failed, discarding', {
          metricType: input.metricType,
          errors: validation.errors.map((e) => e.message),
          correlationId: context.correlationId,
        });
        return { success: true, data: undefined, error: null };
      }

      const normalized = this.normalizer.normalize(metric);

      await this.repository.save(normalized);

      const cacheKey = `metrics:latest:${input.serverId}:${input.metricType}`;
      await this.cache.set(cacheKey, normalized, 60);

      const envelope = {
        id: crypto.randomUUID(),
        workspaceId: context.workspaceId,
        serverId: input.serverId,
        sequenceNumber: 0,
        timestamp: new Date().toISOString(),
        eventType: 'monitoring.metric.ingested',
        payload: normalized,
        checksum: '',
        correlationId: context.correlationId,
        traceId: crypto.randomUUID(),
        version: 1,
      };

      const metricEvent: MetricEvent = {
        envelope,
        severity: Severity.Information,
        priority: Priority.Normal,
        category: EventCategory.Performance,
        source: 'monitoring-engine',
        metric: normalized,
      };

      await this.eventBus.publish(metricEvent);

      return { success: true, data: undefined, error: null };
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      this.logger.error('metric ingestion failed', error, {
        correlationId: context.correlationId,
        serverId: input.serverId,
      });
      return {
        success: false,
        data: null,
        error: { name: error.name, message: error.message, code: 'MONITORING_INGEST_FAILED' } as AppError,
      };
    }
  }
}

const getLatestMetadata: UseCaseMetadata = {
  name: 'GetLatestMetrics',
  description: 'Retrieve latest metrics for a server',
  category: 'Monitoring',
  requiresAuth: false,
  idempotent: true,
  timeoutMs: 3000,
};

export class GetLatestMetricsUseCase implements UseCase<string, Metric[]> {
  public readonly metadata = getLatestMetadata;

  constructor(
    private readonly repository: MetricRepository,
    private readonly cache: CacheManager,
    private readonly logger: Logger,
  ) {}

  async execute(serverId: string, context: UseCaseContext): Promise<Result<Metric[], AppError>> {
    try {
      const types = Object.values(MetricType);
      const results: Metric[] = [];

      for (const metricType of types) {
        const cacheKey = `metrics:latest:${serverId}:${metricType}`;
        const cached = await this.cache.get(cacheKey);

        if (cached) {
          results.push(cached as Metric);
        } else {
          const metric = await this.repository.findLatest(serverId, metricType);
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
        correlationId: context.correlationId,
        serverId,
      });
      return {
        success: false,
        data: null,
        error: { name: error.name, message: error.message, code: 'MONITORING_GET_FAILED' } as AppError,
      };
    }
  }
}

const getWindowMetadata: UseCaseMetadata = {
  name: 'GetMetricWindow',
  description: 'Retrieve metrics within a time window',
  category: 'Monitoring',
  requiresAuth: false,
  idempotent: true,
  timeoutMs: 5000,
};

export class GetMetricWindowUseCase implements UseCase<{ serverId: string; windowMs: number }, Metric[]> {
  public readonly metadata = getWindowMetadata;

  constructor(
    private readonly repository: MetricRepository,
    private readonly logger: Logger,
  ) {}

  async execute(
    input: { serverId: string; windowMs: number },
    context: UseCaseContext,
  ): Promise<Result<Metric[], AppError>> {
    try {
      const metrics = await this.repository.findInWindow(input.serverId, input.windowMs);
      return { success: true, data: metrics, error: null };
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      this.logger.error('failed to get metric window', error, {
        correlationId: context.correlationId,
        serverId: input.serverId,
      });
      return {
        success: false,
        data: null,
        error: { name: error.name, message: error.message, code: 'MONITORING_WINDOW_FAILED' } as AppError,
      };
    }
  }
}
