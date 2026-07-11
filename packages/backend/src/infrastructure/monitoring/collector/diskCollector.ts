import type { MetricCollector } from '../../../domain/monitoring/services.js';
import { MetricType } from '@mydash/shared';
import type { DiskMetric, MetricHeader } from '@mydash/shared';
import type { Logger } from '../../../logging/index.js';
export class DiskCollector implements MetricCollector {
  public readonly collectorType = 'disk';
  constructor(private readonly logger: Logger) {}
  collect(serverId: string, workspaceId: string): Promise<DiskMetric[]> {
    this.logger.debug('collecting disk metrics', { serverId });
    const header: MetricHeader = {
      id: crypto.randomUUID(),
      workspaceId,
      serverId,
      timestamp: new Date().toISOString(),
      metricType: MetricType.Disk,
      correlationId: crypto.randomUUID(),
      version: 1,
    };
    const metric: DiskMetric = {
      header,
      device: '/dev/sda1',
      filesystem: 'ext4',
      mountPoint: '/',
      totalBytes: 0,
      usedBytes: 0,
      availableBytes: 0,
      usedPercent: 0,
      inodeTotal: 0,
      inodeUsed: 0,
      readSpeedBps: 0,
      writeSpeedBps: 0,
      ioWaitPercent: 0,
      smartStatus: null,
    };
    return Promise.resolve([metric]);
  }
}
