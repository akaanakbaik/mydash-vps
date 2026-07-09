import type { AnomalyDetector } from '../../domain/analytics/services.js';
import type { AnomalyResult } from '../../domain/analytics/entities.js';
import type { StatisticsEngine } from '../../domain/analytics/services.js';

export class AnomalyDetectorImpl implements AnomalyDetector {
  constructor(private readonly stats: StatisticsEngine) {}

  detectAnomalies(values: number[], timestamps: string[], metricType: string): AnomalyResult[] {
    if (values.length < 3) return [];

    const mean = this.stats.calculateMean(values);
    const variance = this.stats.calculateVariance(values, mean);
    const stddev = this.stats.calculateStandardDeviation(variance);
    const results: AnomalyResult[] = [];

    for (let i = 0; i < values.length; i++) {
      const zScore = this.stats.calculateZScore(values[i], mean, stddev);
      const absZ = Math.abs(zScore);

      if (absZ > 2) {
        results.push({
          metricType,
          timestamp: timestamps[i],
          value: values[i],
          expectedValue: mean,
          zScore: absZ,
          severity: absZ > 3 ? 'critical' : 'warning',
          confidence: Math.min(100, Math.max(0, (absZ - 2) * 50)),
          description: absZ > 3
            ? `${metricType} value ${values[i].toFixed(1)} is ${absZ.toFixed(1)} standard deviations from mean ${mean.toFixed(1)}`
            : `${metricType} value ${values[i].toFixed(1)} is slightly above normal range (${absZ.toFixed(1)}σ)`,
        });
      }
    }

    return results;
  }
}
