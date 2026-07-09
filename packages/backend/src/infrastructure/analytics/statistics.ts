import type { StatisticsEngine } from '../../domain/analytics/services.js';

export class StatisticsEngineImpl implements StatisticsEngine {
  calculateMean(values: number[]): number {
    if (values.length === 0) return 0;
    return values.reduce((a, b) => a + b, 0) / values.length;
  }

  calculateMedian(values: number[]): number {
    if (values.length === 0) return 0;
    const sorted = [...values].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
  }

  calculateVariance(values: number[], mean: number): number {
    if (values.length <= 1) return 0;
    const squaredDiffs = values.map((v) => (v - mean) ** 2);
    return squaredDiffs.reduce((a, b) => a + b, 0) / (values.length - 1);
  }

  calculateStandardDeviation(variance: number): number {
    return Math.sqrt(variance);
  }

  calculatePercentile(values: number[], percentile: number): number {
    if (values.length === 0) return 0;
    const sorted = [...values].sort((a, b) => a - b);
    const index = (percentile / 100) * (sorted.length - 1);
    const lower = Math.floor(index);
    const upper = Math.ceil(index);
    if (lower === upper) return sorted[lower];
    return sorted[lower] + (sorted[upper] - sorted[lower]) * (index - lower);
  }

  calculateMovingAverage(values: number[], window: number): number[] {
    if (values.length < window) return [this.calculateMean(values)];
    const result: number[] = [];
    for (let i = 0; i <= values.length - window; i++) {
      const slice = values.slice(i, i + window);
      result.push(this.calculateMean(slice));
    }
    return result;
  }

  calculateEMA(values: number[], alpha: number): number[] {
    if (values.length === 0) return [];
    const result: number[] = [values[0]];
    for (let i = 1; i < values.length; i++) {
      result.push(alpha * values[i] + (1 - alpha) * result[i - 1]);
    }
    return result;
  }

  calculateZScore(value: number, mean: number, stddev: number): number {
    if (stddev === 0) return 0;
    return (value - mean) / stddev;
  }
}
