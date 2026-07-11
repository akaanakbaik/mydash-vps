import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AnalyticsPipelineImpl } from './pipeline.js';
import type { MetricRepository } from '../../domain/monitoring/repository.js';
import type { AnalyticsRepository } from '../../domain/analytics/repository.js';
import type { AggregationEngine, TrendAnalyzer, AnomalyDetector } from '../../domain/analytics/services.js';
import type { CacheManager } from '../redis/cache.js';
import type { EventBus } from '../../eventBus/contracts.js';
import type { Logger } from '../../logging/index.js';
import type { Metric } from '@mydash/shared';
function createMetricRepo(): MetricRepository {
  return {
    findLatest: vi.fn(),
    findByType: vi.fn(),
    findInWindow: vi.fn(),
    save: vi.fn(),
    saveBatch: vi.fn(),
    deleteOlderThan: vi.fn(),
  };
}
function createAnalyticsRepo(): AnalyticsRepository {
  return {
    saveSummary: vi.fn(),
    getSummary: vi.fn(),
    saveAggregation: vi.fn(),
    getAggregations: vi.fn(),
    saveAnomalies: vi.fn(),
    getAnomalies: vi.fn(),
  };
}
function createAggregator(): AggregationEngine {
  return { aggregate: vi.fn().mockReturnValue([]) };
}
function createTrendAnalyzer(): TrendAnalyzer {
  return {
    analyzeTrend: vi.fn().mockReturnValue({ direction: 'stable', strength: 0.5, confidence: 0.8, period: 0 }),
    calculateLinearRegression: vi.fn().mockReturnValue({ slope: 0, intercept: 0, rSquared: 0 }),
  };
}
function createAnomalyDetector(): AnomalyDetector {
  return { detectAnomalies: vi.fn().mockReturnValue([]) };
}
function createCache(): CacheManager {
  return {
    get: vi.fn(),
    set: vi.fn(),
    delete: vi.fn(),
    exists: vi.fn(),
    clear: vi.fn(),
    getStats: vi.fn().mockReturnValue({ hits: 0, misses: 0, hitRatio: 0, keyCount: 0 }),
  };
}
function createEventBus(): EventBus {
  return {
    start: vi.fn(),
    stop: vi.fn(),
    publish: vi.fn(),
    subscribe: vi.fn(),
    unsubscribe: vi.fn(),
    healthCheck: vi.fn(),
  };
}
function createLogger(): Logger {
  return {
    trace: vi.fn(), debug: vi.fn(), info: vi.fn(), success: vi.fn(),
    warn: vi.fn(), error: vi.fn(), critical: vi.fn(), emergency: vi.fn(),
    child: vi.fn(),
  };
}
describe('AnalyticsPipelineImpl', () => {
  let mockMetricRepo: MetricRepository;
  let mockAnalyticsRepo: AnalyticsRepository;
  let pipeline: AnalyticsPipelineImpl;
  beforeEach(() => {
    mockMetricRepo = createMetricRepo();
    mockAnalyticsRepo = createAnalyticsRepo();
    pipeline = new AnalyticsPipelineImpl(
      mockMetricRepo,
      mockAnalyticsRepo,
      createAggregator(),
      createTrendAnalyzer(),
      createAnomalyDetector(),
      createCache(),
      createEventBus(),
      createLogger(),
    );
  });
  it('returns empty summary when no metrics exist', async () => {
    vi.mocked(mockMetricRepo.findInWindow).mockResolvedValue([]);
    const result = await pipeline.process('srv-1', 'ws-1', 3600000);
    expect(result.serverId).toBe('srv-1');
    expect(result.windowMs).toBe(3600000);
    expect(result.aggregatedMetrics).toEqual([]);
    expect(result.trends).toEqual([]);
    expect(result.anomalies).toEqual([]);
  });
  it('processes metrics and generates summary', async () => {
    const cpuMetric = {
      id: 'm1',
      header: {
        id: 'm1', workspaceId: 'ws-1', serverId: 'srv-1',
        metricType: 'cpu', correlationId: 'c1', version: 1,
      },
      usagePercent: 75,
      cpuCount: 4,
      loadAverage: [1, 2, 1.5],
    } as unknown as Metric;
    vi.mocked(mockMetricRepo.findInWindow).mockResolvedValue([cpuMetric]);
    const result = await pipeline.process('srv-1', 'ws-1', 3600000);
    expect(result.aggregatedMetrics).toBeDefined();
    expect(result.serverId).toBe('srv-1');
  });
  it('publishes event when summary is generated', async () => {
    const metric = {
      id: 'm2',
      header: {
        id: 'm2', workspaceId: 'ws-1', serverId: 'srv-1',
        metricType: 'memory', correlationId: 'c2', version: 1,
      },
      usedBytes: 8589934592,
      totalBytes: 17179869184,
      usedPercent: 50,
    } as unknown as Metric;
    const eventBus = createEventBus();
    const publishSpy = vi.mocked(eventBus.publish);
    pipeline = new AnalyticsPipelineImpl(
      mockMetricRepo, mockAnalyticsRepo,
      createAggregator(), createTrendAnalyzer(), createAnomalyDetector(),
      createCache(), eventBus, createLogger(),
    );
    vi.mocked(mockMetricRepo.findInWindow).mockResolvedValue([metric]);
    await pipeline.process('srv-1', 'ws-1', 3600000);
    expect(publishSpy).toHaveBeenCalled();
  });
  it('completes with metric counts', async () => {
    const metric = {
      id: 'm3',
      header: {
        id: 'm3', workspaceId: 'ws-1', serverId: 'srv-1',
        metricType: 'cpu', correlationId: 'c3', version: 1,
      },
      usagePercent: 50,
      cpuCount: 4,
      loadAverage: [1, 1, 1],
    } as unknown as Metric;
    vi.mocked(mockMetricRepo.findInWindow).mockResolvedValue([metric]);
    await pipeline.process('srv-1', 'ws-1', 3600000);
    expect(mockMetricRepo.findInWindow).toHaveBeenCalledWith('srv-1', 3600000);
  });
});
