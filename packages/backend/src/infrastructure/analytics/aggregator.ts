import type { AggregationEngine } from '../../domain/analytics/services.js';
import type { AggregatedMetric } from '../../domain/analytics/entities.js';
import type { Metric, CpuMetric, MemoryMetric, DiskMetric, NetworkMetric } from '@mydash/shared';
import { MetricType } from '@mydash/shared';
import type { StatisticsEngine } from '../../domain/analytics/services.js';
export class AggregationEngineImpl implements AggregationEngine {
  constructor(private readonly stats: StatisticsEngine) {}
  aggregate(metrics: Metric[], windowMs: number): AggregatedMetric[] {
    const grouped = this.groupByType(metrics);
    const results: AggregatedMetric[] = [];
    for (const [metricType, items] of grouped) {
      const values = this.extractValues(metricType as MetricType, items);
      if (values.length === 0) continue;
      const mean = this.stats.calculateMean(values);
      const variance = this.stats.calculateVariance(values, mean);
      results.push({
        metricType,
        windowMs,
        sampleCount: values.length,
        min: Math.min(...values),
        max: Math.max(...values),
        average: mean,
        median: this.stats.calculateMedian(values),
        standardDeviation: this.stats.calculateStandardDeviation(variance),
        variance,
        percentile95: this.stats.calculatePercentile(values, 95),
        percentile99: this.stats.calculatePercentile(values, 99),
      });
    }
    return results;
  }
  private groupByType(metrics: Metric[]): Map<string, Metric[]> {
    const map = new Map<string, Metric[]>();
    for (const m of metrics) {
      const key = m.header.metricType;
      const existing = map.get(key) ?? [];
      existing.push(m);
      map.set(key, existing);
    }
    return map;
  }
  private extractValues(metricType: MetricType, metrics: Metric[]): number[] {
    const values = (() => {
      switch (metricType) {
        case MetricType.CPU:
          return metrics.map((m) => (m as CpuMetric).usagePercent);
        case MetricType.Memory:
          return metrics.map((m) => {
            const memory = m as MemoryMetric;
            return memory.totalBytes > 0 ? memory.usedBytes / memory.totalBytes * 100 : 0;
          });
        case MetricType.Disk:
          return metrics.map((m) => (m as DiskMetric).usedPercent);
        case MetricType.Network:
          return metrics.map((m) => {
            const network = m as NetworkMetric;
            return (network.rxBytesPerSec + network.txBytesPerSec) / (1024 * 1024);
          });
        default:
          return [];
      }
    })();
    return values.filter((value) => Number.isFinite(value)).map((value) => Math.max(0, value));
  }
}
