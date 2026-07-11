import type { MetricPipeline } from '../../domain/monitoring/services.js';
import type { MetricCollector } from '../../domain/monitoring/services.js';
import type { MetricValidator } from '../../domain/monitoring/services.js';
import type { MetricNormalizer } from '../../domain/monitoring/services.js';
import type { MetricRepository } from '../../domain/monitoring/repository.js';
import type { EventBus } from '../../eventBus/contracts.js';
import type { CacheManager } from '../redis/index.js';
import type { Logger } from '../../logging/index.js';
import type { MetricEvent } from '@mydash/shared';
import { Severity, Priority, EventCategory } from '@mydash/shared';
export class MonitoringPipeline implements MetricPipeline {
  constructor(
    private readonly collectors: MetricCollector[],
    private readonly validator: MetricValidator,
    private readonly normalizer: MetricNormalizer,
    private readonly repository: MetricRepository,
    private readonly eventBus: EventBus,
    private readonly cache: CacheManager,
    private readonly logger: Logger,
  ) {}
  async process(serverId: string, workspaceId: string): Promise<void> {
    this.logger.debug('starting monitoring pipeline', { serverId, workspaceId, collectorCount: this.collectors.length });
    for (const collector of this.collectors) {
      const startTime = Date.now();
      try {
        const metrics = await collector.collect(serverId, workspaceId);
        if (metrics.length === 0) {
          this.logger.debug('collector returned no metrics', {
            collectorType: collector.collectorType,
            serverId,
          });
          continue;
        }
        this.logger.debug('collector returned metrics', {
          collectorType: collector.collectorType,
          metricCount: metrics.length,
          serverId,
        });
        for (const metric of metrics) {
          const validation = this.validator.validate(metric);
          if (!validation.valid) {
            this.logger.warn('metric validation failed', {
              collectorType: collector.collectorType,
              metricType: metric.header.metricType,
              errors: validation.errors.map((e) => e.message),
              serverId,
            });
            continue;
          }
          const normalized = this.normalizer.normalize(metric);
          await this.repository.save(normalized);
          const cacheKey = `metrics:latest:${serverId}:${normalized.header.metricType}`;
          await this.cache.set(cacheKey, normalized, 60);
          const envelope = {
            id: crypto.randomUUID(),
            workspaceId,
            serverId,
            sequenceNumber: 0,
            timestamp: new Date().toISOString(),
            eventType: 'monitoring.metric.ingested',
            payload: normalized,
            checksum: '',
            correlationId: crypto.randomUUID(),
            traceId: crypto.randomUUID(),
            version: 1,
          };
          const metricEvent: MetricEvent = {
            envelope,
            severity: Severity.Information,
            priority: Priority.Normal,
            category: EventCategory.Performance,
            source: `monitoring-${collector.collectorType}`,
            metric: normalized,
          };
          await this.eventBus.publish(metricEvent);
        }
        const durationMs = Date.now() - startTime;
        this.logger.debug('collector completed', {
          collectorType: collector.collectorType,
          metricCount: metrics.length,
          durationMs,
          serverId,
        });
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        this.logger.error('collector failed', error, {
          collectorType: collector.collectorType,
          serverId,
        });
      }
    }
  }
}
