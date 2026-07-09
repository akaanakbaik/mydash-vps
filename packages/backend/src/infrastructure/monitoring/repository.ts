import type { MetricRepository } from '../../domain/monitoring/repository.js';
import type { Metric, MetricType } from '@mydash/shared';
import type { DrizzleClient } from '../../persistence/connection.js';
import type { Logger } from '../../logging/index.js';
import { makeTransactionalDb } from '../../persistence/repository/transactionContext.js';
import { metrics } from '../../persistence/schema/monitoring.js';
import { eq, and, gte, desc, lt } from 'drizzle-orm';

export class MetricRepositoryImpl implements MetricRepository {
  constructor(
    private readonly db: DrizzleClient,
    private readonly logger: Logger,
  ) {
    this.db = makeTransactionalDb(this.db);
  }

  async save(metric: Metric): Promise<void> {
    const serialized = {
      id: metric.header.id,
      workspaceId: metric.header.workspaceId,
      serverId: metric.header.serverId,
      metricType: metric.header.metricType,
      data: metric as unknown as Record<string, unknown>,
      correlationId: metric.header.correlationId,
      version: metric.header.version,
    };

    await this.db.insert(metrics).values(serialized);
  }

  async saveBatch(batchMetrics: Metric[]): Promise<void> {
    if (batchMetrics.length === 0) return;

    const values = batchMetrics.map((metric) => ({
      id: metric.header.id,
      workspaceId: metric.header.workspaceId,
      serverId: metric.header.serverId,
      metricType: metric.header.metricType,
      data: metric as unknown as Record<string, unknown>,
      correlationId: metric.header.correlationId,
      version: metric.header.version,
    }));

    await this.db.insert(metrics).values(values);
  }

  async findLatest(serverId: string, metricType: MetricType): Promise<Metric | null> {
    const results = await this.db
      .select()
      .from(metrics)
      .where(and(eq(metrics.serverId, serverId), eq(metrics.metricType, metricType)))
      .orderBy(desc(metrics.recordedAt))
      .limit(1);

    if (results.length === 0) return null;
    return results[0].data as Metric;
  }

  async findInWindow(serverId: string, windowMs: number): Promise<Metric[]> {
    const cutoff = new Date(Date.now() - windowMs);

    const results = await this.db
      .select()
      .from(metrics)
      .where(and(eq(metrics.serverId, serverId), gte(metrics.recordedAt, cutoff)))
      .orderBy(desc(metrics.recordedAt))
      .limit(500);

    return results.map((r: { data: unknown }) => r.data as Metric);
  }

  async findByType(serverId: string, metricType: MetricType, limit: number): Promise<Metric[]> {
    const results = await this.db
      .select()
      .from(metrics)
      .where(and(eq(metrics.serverId, serverId), eq(metrics.metricType, metricType)))
      .orderBy(desc(metrics.recordedAt))
      .limit(limit);

    return results.map((r: { data: unknown }) => r.data as Metric);
  }

  async deleteOlderThan(before: Date): Promise<number> {
    const result = await this.db.delete(metrics).where(lt(metrics.recordedAt, before));
    this.logger.info('deleted old metrics', { count: result.rowCount ?? 0, before: before.toISOString() });
    return result.rowCount ?? 0;
  }
}
