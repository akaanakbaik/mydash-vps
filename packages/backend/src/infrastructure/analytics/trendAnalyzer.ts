import type { TrendAnalyzer } from '../../domain/analytics/services.js';
import type { TrendResult } from '../../domain/analytics/entities.js';

export class TrendAnalyzerImpl implements TrendAnalyzer {
  analyzeTrend(values: number[], _timestamps: string[]): TrendResult {
    if (values.length < 2) {
      return {
        metricType: 'unknown',
        direction: 'stable',
        slope: 0,
        intercept: values[0] ?? 0,
        rSquared: 0,
        confidence: 0,
      };
    }

    const xs = values.map((_, i) => i);
    const { slope, intercept, rSquared } = this.calculateLinearRegression(xs, values);
    const direction = Math.abs(slope) < 0.01 ? 'stable' : slope > 0 ? 'rising' : 'falling';

    return {
      metricType: 'unknown',
      direction,
      slope,
      intercept,
      rSquared,
      confidence: Math.min(100, Math.max(0, rSquared * 100)),
    };
  }

  calculateLinearRegression(
    xs: number[],
    ys: number[],
  ): { slope: number; intercept: number; rSquared: number } {
    const n = xs.length;
    if (n === 0) return { slope: 0, intercept: 0, rSquared: 0 };

    const sumX = xs.reduce((a, b) => a + b, 0);
    const sumY = ys.reduce((a, b) => a + b, 0);
    const sumXY = xs.reduce((a, x, i) => a + x * ys[i], 0);
    const sumX2 = xs.reduce((a, x) => a + x * x, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    const meanY = sumY / n;
    const totalSS = ys.reduce((a, y) => a + (y - meanY) ** 2, 0);
    const residualSS = ys.reduce((a, y, i) => {
      const predicted = slope * xs[i] + intercept;
      return a + (y - predicted) ** 2;
    }, 0);
    const rSquared = totalSS === 0 ? 0 : 1 - residualSS / totalSS;

    return { slope, intercept, rSquared };
  }
}
