import type { MetricCollector } from '../../../domain/monitoring/services.js';
import type { ServiceMetric } from '@mydash/shared';
import type { Logger } from '../../../logging/index.js';
export class ServiceCollector implements MetricCollector {
  public readonly collectorType = 'service';
  constructor(private readonly logger: Logger) {}
  collect(_serverId: string, _workspaceId: string): Promise<ServiceMetric[]> {
    this.logger.debug('collecting service metrics');
    return Promise.resolve([]);
  }
}
