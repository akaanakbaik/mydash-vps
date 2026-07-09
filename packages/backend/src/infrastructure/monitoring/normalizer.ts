import type { MetricNormalizer } from '../../domain/monitoring/services.js';
import type { Metric, CpuMetric, MemoryMetric, DiskMetric, NetworkMetric } from '@mydash/shared';
import { MetricType } from '@mydash/shared';

export class MetricNormalizerImpl implements MetricNormalizer {
  normalize(metric: Metric): Metric {
    switch (metric.header.metricType) {
      case MetricType.CPU:
        return this.normalizeCpu(metric as CpuMetric);
      case MetricType.Memory:
        return this.normalizeMemory(metric as MemoryMetric);
      case MetricType.Disk:
        return this.normalizeDisk(metric as DiskMetric);
      case MetricType.Network:
        return this.normalizeNetwork(metric as NetworkMetric);
      default:
        return metric;
    }
  }

  private normalizeCpu(metric: CpuMetric): CpuMetric {
    return {
      ...metric,
      usagePercent: Math.min(100, Math.max(0, metric.usagePercent)),
      perCoreUsage: metric.perCoreUsage.map((v) => Math.min(100, Math.max(0, v))),
      userPercent: Math.min(100, Math.max(0, metric.userPercent)),
      systemPercent: Math.min(100, Math.max(0, metric.systemPercent)),
      idlePercent: Math.min(100, Math.max(0, metric.idlePercent)),
      ioWaitPercent: Math.min(100, Math.max(0, metric.ioWaitPercent)),
      stealPercent: Math.min(100, Math.max(0, metric.stealPercent)),
    };
  }

  private normalizeMemory(metric: MemoryMetric): MemoryMetric {
    return {
      ...metric,
      totalBytes: Math.max(0, metric.totalBytes),
      usedBytes: Math.max(0, Math.min(metric.totalBytes, metric.usedBytes)),
      freeBytes: Math.max(0, metric.freeBytes),
      availableBytes: Math.max(0, Math.min(metric.totalBytes, metric.availableBytes)),
      swapTotalBytes: Math.max(0, metric.swapTotalBytes),
      swapUsedBytes: Math.max(0, metric.swapUsedBytes),
      swapFreeBytes: Math.max(0, metric.swapFreeBytes),
    };
  }

  private normalizeDisk(metric: DiskMetric): DiskMetric {
    return {
      ...metric,
      totalBytes: Math.max(0, metric.totalBytes),
      usedBytes: Math.max(0, Math.min(metric.totalBytes, metric.usedBytes)),
      availableBytes: Math.max(0, metric.availableBytes),
      usedPercent: Math.min(100, Math.max(0, metric.usedPercent)),
    };
  }

  private normalizeNetwork(metric: NetworkMetric): NetworkMetric {
    return {
      ...metric,
      rxBytesPerSec: Math.max(0, metric.rxBytesPerSec),
      txBytesPerSec: Math.max(0, metric.txBytesPerSec),
      packetLossPercent: Math.min(100, Math.max(0, metric.packetLossPercent)),
      latencyMs: Math.max(0, metric.latencyMs),
      connectionCount: Math.max(0, metric.connectionCount),
      establishedCount: Math.max(0, metric.establishedCount),
    };
  }
}
