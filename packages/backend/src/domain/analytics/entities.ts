export interface AggregatedMetric {
  metricType: string;
  windowMs: number;
  sampleCount: number;
  min: number;
  max: number;
  average: number;
  median: number;
  standardDeviation: number;
  variance: number;
  percentile95: number;
  percentile99: number;
}
export interface TrendResult {
  metricType: string;
  direction: 'rising' | 'falling' | 'stable';
  slope: number;
  intercept: number;
  rSquared: number;
  confidence: number;
}
export interface AnomalyResult {
  metricType: string;
  timestamp: string;
  value: number;
  expectedValue: number;
  zScore: number;
  severity: 'normal' | 'warning' | 'critical';
  confidence: number;
  description: string;
}
export interface ResourceEfficiencyIndex {
  metricType: string;
  usefulResource: number;
  allocatedResource: number;
  efficiencyPercent: number;
}
export interface AnalyticsSummary {
  serverId: string;
  windowMs: number;
  generatedAt: string;
  aggregatedMetrics: AggregatedMetric[];
  trends: TrendResult[];
  anomalies: AnomalyResult[];
  efficiencyIndices: ResourceEfficiencyIndex[];
}
export interface TimeSeriesPoint {
  timestamp: string;
  values: number[];
}
export interface PredictionResult {
  metricType: string;
  estimatedDaysUntilFull: number;
  growthRatePerDay: number;
  confidence: number;
}
