import type { Metric } from '@mydash/shared';
import type { AggregatedMetric, TrendResult, AnomalyResult, AnalyticsSummary } from './entities.js';
export interface AggregationEngine {
  aggregate(metrics: Metric[], windowMs: number): AggregatedMetric[];
}
export interface StatisticsEngine {
  calculateMean(values: number[]): number;
  calculateMedian(values: number[]): number;
  calculateVariance(values: number[], mean: number): number;
  calculateStandardDeviation(variance: number): number;
  calculatePercentile(values: number[], percentile: number): number;
  calculateMovingAverage(values: number[], window: number): number[];
  calculateEMA(values: number[], alpha: number): number[];
  calculateZScore(value: number, mean: number, stddev: number): number;
}
export interface TrendAnalyzer {
  analyzeTrend(values: number[], timestamps: string[]): TrendResult;
  calculateLinearRegression(xs: number[], ys: number[]): { slope: number; intercept: number; rSquared: number };
}
export interface AnomalyDetector {
  detectAnomalies(values: number[], timestamps: string[], metricType: string): AnomalyResult[];
}
export interface AnalyticsPipeline {
  process(serverId: string, workspaceId: string, windowMs: number): Promise<AnalyticsSummary>;
}
