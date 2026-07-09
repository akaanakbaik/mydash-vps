import type { MetricCollector } from '../../../domain/monitoring/services.js';
import type { DockerMetric } from '@mydash/shared';
import type { Logger } from '../../../logging/index.js';

export class DockerCollector implements MetricCollector {
  public readonly collectorType = 'docker';

  constructor(private readonly logger: Logger) {}

  collect(_serverId: string, _workspaceId: string): Promise<DockerMetric[]> {
    this.logger.debug('collecting docker metrics');

    return Promise.resolve([]);
  }
}
