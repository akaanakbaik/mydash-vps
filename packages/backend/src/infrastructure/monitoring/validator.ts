import type { MetricValidator } from '../../domain/monitoring/services.js';
import type { MetricValidationResult, MetricValidationError } from '../../domain/monitoring/valueObjects.js';
import type { Metric, CpuMetric, MemoryMetric, DiskMetric, NetworkMetric } from '@mydash/shared';
import { MetricType } from '@mydash/shared';

export class MetricValidatorImpl implements MetricValidator {
  validate(metric: Metric): MetricValidationResult {
    const errors: MetricValidationError[] = [];
    const header = metric.header;

    if (!header.serverId) {
      errors.push({ field: 'header.serverId', message: 'missing serverId', metricType: header.metricType });
    }

    if (!header.workspaceId) {
      errors.push({ field: 'header.workspaceId', message: 'missing workspaceId', metricType: header.metricType });
    }

    if (!header.timestamp) {
      errors.push({ field: 'header.timestamp', message: 'missing timestamp', metricType: header.metricType });
    }

    if (!Object.values(MetricType).includes(header.metricType)) {
      errors.push({ field: 'header.metricType', message: `invalid metric type: ${header.metricType}`, metricType: header.metricType });
    }

    switch (header.metricType) {
      case MetricType.CPU:
        return this.validateCpu(metric as CpuMetric, errors);
      case MetricType.Memory:
        return this.validateMemory(metric as MemoryMetric, errors);
      case MetricType.Disk:
        return this.validateDisk(metric as DiskMetric, errors);
      case MetricType.Network:
        return this.validateNetwork(metric as NetworkMetric, errors);
      default:
        return { valid: errors.length === 0, errors };
    }
  }

  private validateCpu(metric: CpuMetric, errors: MetricValidationError[]): MetricValidationResult {
    if (metric.usagePercent < 0 || metric.usagePercent > 100) {
      errors.push({ field: 'usagePercent', message: 'must be between 0 and 100', metricType: MetricType.CPU });
    }
    if (metric.cores < 0) {
      errors.push({ field: 'cores', message: 'must be non-negative', metricType: MetricType.CPU });
    }
    return { valid: errors.length === 0, errors };
  }

  private validateMemory(metric: MemoryMetric, errors: MetricValidationError[]): MetricValidationResult {
    if (metric.totalBytes < 0) {
      errors.push({ field: 'totalBytes', message: 'must be non-negative', metricType: MetricType.Memory });
    }
    if (metric.usedBytes < 0) {
      errors.push({ field: 'usedBytes', message: 'must be non-negative', metricType: MetricType.Memory });
    }
    return { valid: errors.length === 0, errors };
  }

  private validateDisk(metric: DiskMetric, errors: MetricValidationError[]): MetricValidationResult {
    if (metric.totalBytes < 0) {
      errors.push({ field: 'totalBytes', message: 'must be non-negative', metricType: MetricType.Disk });
    }
    if (metric.usedPercent < 0 || metric.usedPercent > 100) {
      errors.push({ field: 'usedPercent', message: 'must be between 0 and 100', metricType: MetricType.Disk });
    }
    return { valid: errors.length === 0, errors };
  }

  private validateNetwork(metric: NetworkMetric, errors: MetricValidationError[]): MetricValidationResult {
    if (metric.packetLossPercent < 0 || metric.packetLossPercent > 100) {
      errors.push({ field: 'packetLossPercent', message: 'must be between 0 and 100', metricType: MetricType.Network });
    }
    if (metric.latencyMs < 0) {
      errors.push({ field: 'latencyMs', message: 'must be non-negative', metricType: MetricType.Network });
    }
    return { valid: errors.length === 0, errors };
  }
}
