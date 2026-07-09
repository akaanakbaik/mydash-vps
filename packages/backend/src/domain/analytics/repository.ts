import type { AggregatedMetric, AnomalyResult, AnalyticsSummary } from './entities.js';

export interface AnalyticsRepository {
  saveSummary(summary: AnalyticsSummary, workspaceId?: string): Promise<void>;
  getSummary(serverId: string, windowMs: number): Promise<AnalyticsSummary | null>;
  saveAggregation(serverId: string, workspaceId: string, aggregation: AggregatedMetric): Promise<void>;
  getAggregations(serverId: string, metricType: string, limit: number): Promise<AggregatedMetric[]>;
  saveAnomalies(serverId: string, workspaceId: string, anomalies: AnomalyResult[]): Promise<void>;
  getAnomalies(serverId: string, since: Date): Promise<AnomalyResult[]>;
}
