import type { MetricCollector } from '../../../domain/monitoring/services.js';
import { MetricType } from '@mydash/shared';
import type { NetworkMetric, MetricHeader } from '@mydash/shared';
import type { Logger } from '../../../logging/index.js';

export class NetworkCollector implements MetricCollector {
  public readonly collectorType = 'network';

  constructor(private readonly logger: Logger) {}

  collect(serverId: string, workspaceId: string): Promise<NetworkMetric[]> {
    this.logger.debug('collecting network metrics', { serverId });

    const header: MetricHeader = {
      id: crypto.randomUUID(),
      workspaceId,
      serverId,
      timestamp: new Date().toISOString(),
      metricType: MetricType.Network,
      correlationId: crypto.randomUUID(),
      version: 1,
    };

    const metric: NetworkMetric = {
      header,
      interfaceName: 'eth0',
      publicIpv4: '0.0.0.0',
      publicIpv6: null,
      macAddress: '00:00:00:00:00:00',
      rxBytesPerSec: 0,
      txBytesPerSec: 0,
      packetLossPercent: 0,
      latencyMs: 0,
      connectionCount: 0,
      establishedCount: 0,
    };

    return Promise.resolve([metric]);
  }
}
