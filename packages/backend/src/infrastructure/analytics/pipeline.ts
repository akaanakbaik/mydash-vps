import type { AnalyticsPipeline } from '../../domain/analytics/services.js';
import type { AggregationEngine } from '../../domain/analytics/services.js';
import type { TrendAnalyzer } from '../../domain/analytics/services.js';
import type { AnomalyDetector } from '../../domain/analytics/services.js';
import type { AnalyticsRepository } from '../../domain/analytics/repository.js';
import type { MetricRepository } from '../../domain/monitoring/repository.js';
import type { AnalyticsSummary } from '../../domain/analytics/entities.js';
import type { Metric, CpuMetric, MemoryMetric, DiskMetric, NetworkMetric, DomainEvent } from '@mydash/shared';
import { MetricType, Severity, Priority, EventCategory } from '@mydash/shared';
import type { CacheManager } from '../redis/cache.js';
import type { EventBus } from '../../eventBus/contracts.js';
import type { Logger } from '../../logging/index.js';

export class AnalyticsPipelineImpl implements AnalyticsPipeline {
  constructor(
    private readonly metricRepo: MetricRepository,
    private readonly analyticsRepo: AnalyticsRepository,
    private readonly aggregator: AggregationEngine,
    private readonly trendAnalyzer: TrendAnalyzer,
    private readonly anomalyDetector: AnomalyDetector,
    private readonly cache: CacheManager,
    private readonly eventBus: EventBus,
    private readonly logger: Logger,
  ) {}

  async process(serverId: string, workspaceId: string, windowMs: number): Promise<AnalyticsSummary> {
    this.logger.debug('starting analytics pipeline', { serverId, workspaceId, windowMs });

    const metrics = await this.metricRepo.findInWindow(serverId, windowMs);

    if (metrics.length === 0) {
      return this.emptySummary(serverId, windowMs);
    }

    const aggregatedMetrics = this.aggregator.aggregate(metrics, windowMs);
    const trends = this.calculateTrends(metrics);
    const anomalies = this.detectAnomalies(metrics);

    const summary: AnalyticsSummary = {
      serverId,
      windowMs,
      generatedAt: new Date().toISOString(),
      aggregatedMetrics,
      trends,
      anomalies,
      efficiencyIndices: [],
    };

    await this.analyticsRepo.saveSummary(summary, workspaceId);

    const cacheKey = `analytics:summary:${serverId}:${String(windowMs)}`;
    await this.cache.set(cacheKey, summary, Math.floor(windowMs / 1000));

    const envelope = {
      id: crypto.randomUUID(),
      workspaceId,
      serverId,
      sequenceNumber: 0,
      timestamp: new Date().toISOString(),
      eventType: 'analytics.summary.generated',
      payload: summary,
      checksum: '',
      correlationId: crypto.randomUUID(),
      traceId: crypto.randomUUID(),
      version: 1,
    };

    const event = {
      envelope,
      severity: Severity.Information,
      priority: Priority.Low,
      category: EventCategory.Performance,
      source: 'analytics-engine',
    };

    await this.eventBus.publish(event as unknown as DomainEvent);

    this.logger.info('analytics pipeline completed', {
      serverId,
      metricCount: metrics.length,
      aggregationCount: aggregatedMetrics.length,
      anomalyCount: anomalies.length,
    });

    return summary;
  }

  private calculateTrends(metrics: Metric[]) {
    const grouped = this.groupByType(metrics);
    const trends = [];

    for (const [metricType, items] of grouped) {
      const values = this.extractValues(metricType as MetricType, items);
      const trend = this.trendAnalyzer.analyzeTrend(values, []);
      trends.push({ ...trend, metricType });
    }

    return trends;
  }

  private detectAnomalies(metrics: Metric[]) {
    const grouped = this.groupByType(metrics);
    const allAnomalies = [];

    for (const [metricType, items] of grouped) {
      const values = this.extractValues(metricType as MetricType, items);
      const timestamps = items.map((m) => m.header.timestamp);
      const anomalies = this.anomalyDetector.detectAnomalies(values, timestamps, metricType);
      allAnomalies.push(...anomalies);
    }

    return allAnomalies;
  }

  private groupByType(metrics: Metric[]): Map<string, Metric[]> {
    const map = new Map<string, Metric[]>();
    for (const m of metrics) {
      const key = m.header.metricType;
      const existing = map.get(key) ?? [];
      existing.push(m);
      map.set(key, existing);
    }
    return map;
  }

  private extractValues(metricType: MetricType, metrics: Metric[]): number[] {
    switch (metricType) {
      case MetricType.CPU:
        return metrics.map((m) => (m as CpuMetric).usagePercent);
      case MetricType.Memory:
        return metrics.map((m) => (m as MemoryMetric).usedBytes);
      case MetricType.Disk:
        return metrics.map((m) => (m as DiskMetric).usedPercent);
      case MetricType.Network:
        return metrics.map((m) => (m as NetworkMetric).rxBytesPerSec + (m as NetworkMetric).txBytesPerSec);
      default:
        return [];
    }
  }

  private emptySummary(serverId: string, windowMs: number): AnalyticsSummary {
    return {
      serverId,
      windowMs,
      generatedAt: new Date().toISOString(),
      aggregatedMetrics: [],
      trends: [],
      anomalies: [],
      efficiencyIndices: [],
    };
  }
}
