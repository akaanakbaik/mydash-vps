import type { HealthCalculator, HealthWeightConfig } from '../../domain/healthScore/services.js';
import type { MetricRepository } from '../../domain/monitoring/repository.js';
import type { AnalyticsRepository } from '../../domain/analytics/index.js';
import type { Logger } from '../../logging/index.js';
import { HealthDomain, HealthGrade, MetricType } from '@mydash/shared';
import type { DomainScore, HealthFactor, HealthScore, Metric } from '@mydash/shared';

function finite(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function utilizationScore(value: unknown): number | null {
  const normalized = finite(value);
  if (normalized === null) return null;
  return Math.min(100, Math.max(0, 100 - normalized));
}

function gradeFor(score: number): HealthGrade {
  if (score >= 98) return HealthGrade.APlus;
  if (score >= 93) return HealthGrade.A;
  if (score >= 85) return HealthGrade.B;
  if (score >= 75) return HealthGrade.C;
  if (score >= 60) return HealthGrade.D;
  return HealthGrade.F;
}

export class HealthScoreCalculator implements HealthCalculator {
  constructor(
    private readonly metricRepo: MetricRepository,
    private readonly analyticsRepo: AnalyticsRepository,
    private readonly logger: Logger,
  ) {}

  getDefaultWeights(): HealthWeightConfig {
    return { cpu: 0.33, memory: 0.28, disk: 0.24, network: 0.10, docker: 0, tunnel: 0.05, service: 0 };
  }

  async calculate(serverId: string, workspaceId: string): Promise<HealthScore> {
    void this.analyticsRepo;
    this.logger.debug('calculating health score', { serverId });
    const [cpu, memory, disk, network] = await Promise.all([
      this.metricRepo.findLatest(serverId, MetricType.CPU),
      this.metricRepo.findLatest(serverId, MetricType.Memory),
      this.metricRepo.findLatest(serverId, MetricType.Disk),
      this.metricRepo.findLatest(serverId, MetricType.Network),
    ]);
    const weights = this.getDefaultWeights();
    const candidates: Array<{ domain: HealthDomain; score: number | null; weight: number }> = [
      { domain: HealthDomain.CPU, score: utilizationScore((cpu as Record<string, unknown> | null)?.usagePercent), weight: weights.cpu },
      { domain: HealthDomain.Memory, score: utilizationScore((memory as Record<string, unknown> | null)?.memoryPressure), weight: weights.memory },
      { domain: HealthDomain.Disk, score: utilizationScore((disk as Record<string, unknown> | null)?.usedPercent), weight: weights.disk },
      { domain: HealthDomain.Network, score: networkScore(network), weight: weights.network },
    ];
    const available = candidates.filter((item) => item.score !== null && item.weight > 0);
    const weightTotal = available.reduce((total, item) => total + item.weight, 0);
    const overall = weightTotal > 0 ? available.reduce((total, item) => total + (item.score ?? 0) * item.weight, 0) / weightTotal : 0;
    const domainScores: DomainScore[] = available.map((item) => ({
      domain: item.domain,
      score: item.score ?? 0,
      weight: item.weight / weightTotal,
      confidence: 1,
    }));
    const factors: HealthFactor[] = available
      .filter((item) => (item.score ?? 100) < 70)
      .map((item) => ({
        domain: item.domain,
        description: `${item.domain} utilization requires attention`,
        impact: Math.round(100 - (item.score ?? 0)),
        penalty: Math.round(100 - (item.score ?? 0)),
        bonus: 0,
      }));
    const score = Math.round(Math.min(100, Math.max(0, overall)) * 100) / 100;
    return {
      workspaceId,
      serverId,
      overall: score,
      grade: gradeFor(score),
      confidence: Math.round((available.length / candidates.length) * 100) / 100,
      trend: 0,
      momentum: 0,
      acceleration: 0,
      domainScores,
      factors,
      calculatedAt: new Date().toISOString(),
    };
  }

  computeScores(scores: Record<string, number>): number {
    const values = Object.values(scores).filter((value) => Number.isFinite(value));
    if (values.length === 0) return 0;
    const average = values.reduce((total, value) => total + value, 0) / values.length;
    return Math.round(Math.min(100, Math.max(0, average)) * 100) / 100;
  }

  getGrade(score: number): string {
    return gradeFor(score);
  }
}

function networkScore(metric: Metric | null): number | null {
  const data = metric as Record<string, unknown> | null;
  if (!data) return null;
  const packetLoss = finite(data.packetLossPercent);
  const latency = finite(data.latencyMs);
  if (packetLoss === null || latency === null || (packetLoss === 0 && latency === 0)) return null;
  const packetScore = Math.max(0, 100 - packetLoss * 10);
  const latencyScore = Math.max(0, 100 - latency / 5);
  return Math.min(packetScore, latencyScore);
}
