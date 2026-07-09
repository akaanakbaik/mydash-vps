import type { MetricCollector } from '../../../domain/monitoring/services.js';
import { MetricType } from '@mydash/shared';
import type { CpuMetric, MetricHeader } from '@mydash/shared';
import type { Logger } from '../../../logging/index.js';

export class CpuCollector implements MetricCollector {
  public readonly collectorType = 'cpu';

  constructor(private readonly logger: Logger) {}

  collect(serverId: string, workspaceId: string): Promise<CpuMetric[]> {
    this.logger.debug('collecting cpu metrics', { serverId });

    const header: MetricHeader = {
      id: crypto.randomUUID(),
      workspaceId,
      serverId,
      timestamp: new Date().toISOString(),
      metricType: MetricType.CPU,
      correlationId: crypto.randomUUID(),
      version: 1,
    };

    const metric: CpuMetric = {
      header,
      model: 'unknown',
      vendor: 'unknown',
      sockets: 1,
      cores: 1,
      threads: 1,
      frequencyMinMhz: 0,
      frequencyMaxMhz: 0,
      frequencyCurrentMhz: 0,
      loadAverage: [0, 0, 0],
      usagePercent: 0,
      perCoreUsage: [0],
      userPercent: 0,
      systemPercent: 0,
      idlePercent: 100,
      ioWaitPercent: 0,
      stealPercent: 0,
    };

    return Promise.resolve([metric]);
  }
}
