export interface MetricSnapshot {
  id: string;
  workspaceId: string;
  serverId: string;
  metricType: string;
  data: Record<string, unknown>;
  correlationId: string;
  version: number;
  recordedAt: Date;
}
export interface CollectorResult {
  collectorType: string;
  metrics: MetricSnapshot[];
  durationMs: number;
  timestamp: Date;
}
export interface CollectorError {
  collectorType: string;
  error: string;
  timestamp: Date;
}
