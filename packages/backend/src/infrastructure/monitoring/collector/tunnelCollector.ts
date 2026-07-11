import type { MetricCollector } from '../../../domain/monitoring/services.js';
import { MetricType } from '@mydash/shared';
import type { TunnelMetric, MetricHeader } from '@mydash/shared';
import type { Logger } from '../../../logging/index.js';
export class TunnelCollector implements MetricCollector {
  public readonly collectorType = 'tunnel';
  constructor(private readonly logger: Logger) {}
  collect(serverId: string, workspaceId: string): Promise<TunnelMetric[]> {
    this.logger.debug('collecting tunnel metrics', { serverId });
    const header: MetricHeader = {
      id: crypto.randomUUID(),
      workspaceId,
      serverId,
      timestamp: new Date().toISOString(),
      metricType: MetricType.Tunnel,
      correlationId: crypto.randomUUID(),
      version: 1,
    };
    const metric: TunnelMetric = {
      header,
      provider: 'none',
      domain: '',
      status: 'disconnected',
      sslActive: false,
      latencyMs: 0,
      reconnectCount: 0,
      lastConnectedAt: new Date(0).toISOString(),
    };
    return Promise.resolve([metric]);
  }
}
