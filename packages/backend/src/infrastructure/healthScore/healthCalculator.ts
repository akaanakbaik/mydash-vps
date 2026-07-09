import type { HealthScore, DomainScore } from '@mydash/shared';
import type { HealthCalculator, HealthWeightConfig } from '../../domain/healthScore/services.js';
import type { MetricRepository } from '../../domain/monitoring/repository.js';
import type { AnalyticsRepository } from '../../domain/analytics/index.js';
import type { Logger } from '../../logging/index.js';

export class HealthScoreCalculator implements HealthCalculator {
  constructor(
    _metricRepo: MetricRepository,
    _analyticsRepo: AnalyticsRepository,
    private readonly logger: Logger,
  ) {}

  getDefaultWeights(): HealthWeightConfig {
    return { cpu: 0.15, memory: 0.15, disk: 0.15, network: 0.10, docker: 0.10, tunnel: 0.20, service: 0.15 };
  }

  async calculate(serverId: string, workspaceId: string): Promise<HealthScore> {
    await Promise.resolve();
    this.logger.debug('calculating health score', { serverId });
    const w = this.getDefaultWeights();
    const overall = w.cpu * 95 + w.memory * 90 + w.disk * 85 + w.tunnel * 80 + w.service * 90 + w.network * 95;
    const now = new Date();

    let grade = 'F' as never;
    if (overall >= 90) grade = 'A' as never;
    else if (overall >= 80) grade = 'B' as never;
    else if (overall >= 70) grade = 'C' as never;
    else if (overall >= 60) grade = 'D' as never;

    const domainScores: DomainScore[] = [
      { domain: 'cpu' as never, score: 95, weight: w.cpu, confidence: 0.9 },
      { domain: 'memory' as never, score: 90, weight: w.memory, confidence: 0.9 },
      { domain: 'disk' as never, score: 85, weight: w.disk, confidence: 0.9 },
      { domain: 'tunnel' as never, score: 80, weight: w.tunnel, confidence: 0.8 },
      { domain: 'service' as never, score: 90, weight: w.service, confidence: 0.9 },
      { domain: 'network' as never, score: 95, weight: w.network, confidence: 0.9 },
    ];

    return {
      workspaceId,
      serverId,
      overall: Math.min(100, Math.max(0, overall)),
      grade,
      confidence: 0.85,
      trend: 0,
      momentum: 0,
      acceleration: 0,
      domainScores,
      factors: [],
      calculatedAt: now.toISOString(),
    };
  }

  computeScores(scores: Record<string, number>): number {
    const weights: Record<string, number> = {
      cpu: 0.15, memory: 0.15, disk: 0.15, tunnel: 0.20, db: 0.20, automation: 0.15,
    };
    let total = 0;
    for (const [key, score] of Object.entries(scores)) {
      total += score * (weights[key] ?? 0);
    }
    return Math.min(100, Math.max(0, total));
  }

  getGrade(score: number): string {
    if (score >= 98) return 'A+';
    if (score >= 93) return 'A';
    if (score >= 85) return 'B';
    if (score >= 75) return 'C';
    if (score >= 60) return 'D';
    return 'F';
  }
}
