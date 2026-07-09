import { apiClient } from '../api/client.js';

export interface AnalyticsSummaryData {
  totalMetrics: number;
  metricsCollected: number;
  metricsFailed: number;
  storageUsed: number;
  storageTotal: number;
  oldestTimestamp: string;
  newestTimestamp: string;
}

export interface Aggregation {
  label: string;
  count: number;
  avg: number;
  min: number;
  max: number;
  period: string;
}

export interface TrendPoint {
  timestamp: string;
  value: number;
  movingAvg: number;
}

export interface Anomaly {
  id: string;
  metric: string;
  value: number;
  expected: number;
  deviation: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: string;
  description: string;
}

export interface Statistic {
  label: string;
  value: number;
  unit: string;
  description: string;
}

export interface PercentileData {
  p50: number;
  p75: number;
  p90: number;
  p95: number;
  p99: number;
  label: string;
}

export interface PredictionPoint {
  timestamp: string;
  predicted: number;
  lower: number;
  upper: number;
  confidence: number;
}

export interface ResourceEfficiency {
  resource: string;
  score: number;
  trend: 'up' | 'down' | 'stable';
  recommendation: string;
}

export interface AnalyticsRow {
  id: number;
  metric: string;
  category: string;
  avg: number;
  min: number;
  max: number;
  p95: number;
  count: number;
  trend: 'up' | 'down' | 'stable';
}

export interface AnalyticsResponse {
  summary: AnalyticsSummaryData;
  aggregations: Aggregation[];
  trend: TrendPoint[];
  anomalies: Anomaly[];
  statistics: Statistic[];
  percentiles: PercentileData[];
  predictions: PredictionPoint[];
  efficiency: ResourceEfficiency[];
  tableData: AnalyticsRow[];
  timeRange: string;
  categories: { id: string; label: string }[];
}

export const analyticsRepository = {
  getSummary: () =>
    apiClient.get<AnalyticsResponse>('/analytics'),
  getTrends: (metric: string, range: string) =>
    apiClient.get<TrendPoint[]>(`/analytics/trends/${metric}`, { params: { range } }),
  getAnomalies: () =>
    apiClient.get<Anomaly[]>('/analytics/anomalies'),
};
