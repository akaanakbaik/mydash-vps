import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MonitoringPipeline } from './pipeline.js';
import type { MetricCollector, MetricValidator, MetricNormalizer } from '../../domain/monitoring/services.js';
import type { MetricRepository } from '../../domain/monitoring/repository.js';
import type { EventBus } from '../../eventBus/contracts.js';
import type { CacheManager } from '../redis/cache.js';
import type { Logger } from '../../logging/index.js';

function createValidator(): MetricValidator {
  return { validate: vi.fn().mockReturnValue({ valid: true, errors: [] }) };
}

function createNormalizer(): MetricNormalizer {
  return { normalize: vi.fn().mockImplementation(<T>(m: T) => m) };
}

function createRepository(): MetricRepository {
  return {
    findLatest: vi.fn(),
    findByType: vi.fn(),
    findInWindow: vi.fn(),
    save: vi.fn(),
    saveBatch: vi.fn(),
    deleteOlderThan: vi.fn(),
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

function createLogger(): Logger {
  return {
    trace: vi.fn(), debug: vi.fn(), info: vi.fn(), success: vi.fn(),
    warn: vi.fn(), error: vi.fn(), critical: vi.fn(), emergency: vi.fn(),
    child: vi.fn(),
  };
}

describe('MonitoringPipeline', () => {
  let mockRepository: MetricRepository;
  let mockEventBus: EventBus;
  let pipeline: MonitoringPipeline;

  beforeEach(() => {
    mockRepository = createRepository();
    mockEventBus = createEventBus();
  });

  it('handles collector returning no metrics', async () => {
    const collectors: MetricCollector[] = [{
      collectorType: 'cpu',
      collect: vi.fn().mockResolvedValue([]),
    }];
    pipeline = new MonitoringPipeline(
      collectors, createValidator(), createNormalizer(),
      mockRepository, mockEventBus, createCache(), createLogger(),
    );
    await pipeline.process('srv-1', 'ws-1');
    expect(mockRepository.save).not.toHaveBeenCalled();
  });

  it('processes metrics through full pipeline', async () => {
    const metric = {
      id: 'm1',
      header: {
        id: 'm1', workspaceId: 'ws-1', serverId: 'srv-1',
        metricType: 'cpu', correlationId: 'corr-1', version: 1,
      },
      usagePercent: 75,
      cpuCount: 4,
      loadAverage: [1, 2, 1.5],
    };
    const collectors: MetricCollector[] = [{
      collectorType: 'cpu',
      collect: vi.fn().mockResolvedValue([metric]),
    }];
    pipeline = new MonitoringPipeline(
      collectors, createValidator(), createNormalizer(),
      mockRepository, mockEventBus, createCache(), createLogger(),
    );
    await pipeline.process('srv-1', 'ws-1');
    expect(mockRepository.save).toHaveBeenCalledTimes(1);
  });

  it('skips metrics that fail validation', async () => {
    const collectors: MetricCollector[] = [{
      collectorType: 'memory',
      collect: vi.fn().mockResolvedValue([{ id: 'm2', header: { id: 'm2', workspaceId: 'ws-1', serverId: 'srv-1', metricType: 'memory', correlationId: 'c2', version: 1 } }]),
    }];
    const strictValidator: MetricValidator = {
      validate: vi.fn().mockReturnValue({ valid: false, errors: [{ message: 'Invalid' }] }),
    };
    pipeline = new MonitoringPipeline(
      collectors, strictValidator, createNormalizer(),
      mockRepository, mockEventBus, createCache(), createLogger(),
    );
    await pipeline.process('srv-1', 'ws-1');
    expect(mockRepository.save).not.toHaveBeenCalled();
  });

  it('handles collector errors gracefully', async () => {
    const collectors: MetricCollector[] = [{
      collectorType: 'disk',
      collect: vi.fn().mockRejectedValue(new Error('Collector crashed')),
    }];
    pipeline = new MonitoringPipeline(
      collectors, createValidator(), createNormalizer(),
      mockRepository, mockEventBus, createCache(), createLogger(),
    );
    await pipeline.process('srv-1', 'ws-1');
    expect(mockRepository.save).not.toHaveBeenCalled();
  });
});
