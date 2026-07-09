import type { MetricCollector } from '../../../domain/monitoring/services.js';
import { MetricType } from '@mydash/shared';
import type { MemoryMetric, MetricHeader } from '@mydash/shared';
import type { Logger } from '../../../logging/index.js';

export class MemoryCollector implements MetricCollector {
  public readonly collectorType = 'memory';

  constructor(private readonly logger: Logger) {}

  collect(serverId: string, workspaceId: string): Promise<MemoryMetric[]> {
    this.logger.debug('collecting memory metrics', { serverId });

    const header: MetricHeader = {
      id: crypto.randomUUID(),
      workspaceId,
      serverId,
      timestamp: new Date().toISOString(),
      metricType: MetricType.Memory,
      correlationId: crypto.randomUUID(),
      version: 1,
    };

    const metric: MemoryMetric = {
      header,
      totalBytes: 0,
      usedBytes: 0,
      freeBytes: 0,
      availableBytes: 0,
      cachedBytes: 0,
      bufferBytes: 0,
      sharedBytes: 0,
      slabBytes: 0,
      swapTotalBytes: 0,
      swapUsedBytes: 0,
      swapFreeBytes: 0,
      memoryPressure: 0,
    };

    return Promise.resolve([metric]);
  }
}
