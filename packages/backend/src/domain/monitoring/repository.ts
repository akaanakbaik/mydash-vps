import type { Metric, MetricType } from '@mydash/shared';
export interface MetricRepository {
  save(metric: Metric): Promise<void>;
  saveBatch(metrics: Metric[]): Promise<void>;
  findLatest(serverId: string, metricType: MetricType): Promise<Metric | null>;
  findInWindow(serverId: string, windowMs: number): Promise<Metric[]>;
  findByType(serverId: string, metricType: MetricType, limit: number): Promise<Metric[]>;
  deleteOlderThan(before: Date): Promise<number>;
}
