import type { AnalyticsRepository } from '../../domain/analytics/repository.js';
import type { AggregatedMetric, AnomalyResult, AnalyticsSummary } from '../../domain/analytics/entities.js';
import type { DrizzleClient } from '../../persistence/connection.js';
import type { Logger } from '../../logging/index.js';
import { makeTransactionalDb } from '../../persistence/repository/transactionContext.js';
import { metrics } from '../../persistence/schema/monitoring.js';
import { eq, and, desc, gte } from 'drizzle-orm';
export class AnalyticsRepositoryImpl implements AnalyticsRepository {
  constructor(
    private readonly db: DrizzleClient,
    private readonly logger: Logger,
  ) {
    this.db = makeTransactionalDb(this.db);
  }
  async saveSummary(summary: AnalyticsSummary, workspaceId?: string): Promise<void> {
    const wsId = workspaceId ?? '';
    for (const aggregation of summary.aggregatedMetrics) {
      await this.saveAggregation(summary.serverId, wsId, aggregation);
    }
    if (summary.anomalies.length > 0) {
      await this.saveAnomalies(summary.serverId, wsId, summary.anomalies);
    }
    this.logger.debug('analytics summary saved', { serverId: summary.serverId, windowMs: summary.windowMs });
  }
  async getSummary(serverId: string, windowMs: number): Promise<AnalyticsSummary | null> {
    const aggregations = await this.getAggregations(serverId, 'cpu', 50);
    if (aggregations.length === 0) return null;
    return {
      serverId,
      windowMs,
      generatedAt: new Date().toISOString(),
      aggregatedMetrics: aggregations,
      trends: [],
      anomalies: await this.getAnomalies(serverId, new Date(Date.now() - windowMs)),
      efficiencyIndices: [],
    };
  }
  async saveAggregation(serverId: string, workspaceId: string, aggregation: AggregatedMetric): Promise<void> {
    const aggData: Record<string, unknown> = aggregation as unknown as Record<string, unknown>;
    await this.db.insert(metrics).values({
      id: crypto.randomUUID(),
      workspaceId,
      serverId,
      metricType: aggregation.metricType,
      data: aggData,
      correlationId: crypto.randomUUID(),
      version: 1,
    });
  }
  async getAggregations(serverId: string, metricType: string, limit: number): Promise<AggregatedMetric[]> {
    const results = await this.db
      .select({ data: metrics.data })
      .from(metrics)
      .where(and(eq(metrics.serverId, serverId), eq(metrics.metricType, metricType)))
      .orderBy(desc(metrics.recordedAt))
      .limit(limit);
    return results.map((r: { data: unknown }) => r.data as AggregatedMetric);
  }
  async saveAnomalies(serverId: string, workspaceId: string, anomalies: AnomalyResult[]): Promise<void> {
    if (anomalies.length === 0) return;
    const values = anomalies.map(anomaly => ({
      id: crypto.randomUUID(),
      workspaceId,
      serverId,
      metricType: `anomaly:${anomaly.metricType}`,
      data: anomaly as unknown as Record<string, unknown>,
      correlationId: crypto.randomUUID(),
      version: 1,
    }));
    await this.db.insert(metrics).values(values);
  }
  async getAnomalies(serverId: string, since: Date): Promise<AnomalyResult[]> {
    const results = await this.db
      .select({ metricType: metrics.metricType, data: metrics.data })
      .from(metrics)
      .where(and(eq(metrics.serverId, serverId), gte(metrics.recordedAt, since)))
      .limit(100);
    return results
      .filter(r => r.metricType.startsWith('anomaly:'))
      .map(r => r.data as AnomalyResult);
  }
}
