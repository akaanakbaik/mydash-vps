import type { NotificationRuleEngine } from '../../domain/notification/services.js';
import type { MetricRepository } from '../../domain/monitoring/repository.js';
import type { NotificationRule, Metric } from '@mydash/shared';
import { MetricType, RuleOperator } from '@mydash/shared';
import type { CpuMetric, MemoryMetric, DiskMetric, NetworkMetric } from '@mydash/shared';
export class NotificationRuleEngineImpl implements NotificationRuleEngine {
  constructor(
    private readonly metricRepo: MetricRepository,
  ) {}
  evaluate(_serverId: string, _workspaceId: string): Promise<NotificationRule[]> {
    return Promise.resolve([]);
  }
  async evaluateRule(rule: NotificationRule, serverId: string): Promise<boolean> {
    if (!rule.enabled) return false;
    const metric = await this.metricRepo.findLatest(serverId, rule.sourceMetric as MetricType);
    if (!metric) return false;
    const value = this.extractMetricValue(metric, rule.sourceMetric);
    const op = rule.operator;
    if (op === RuleOperator.GreaterThan) return value > rule.threshold;
    if (op === RuleOperator.LessThan) return value < rule.threshold;
    if (op === RuleOperator.Equal) return value === rule.threshold;
    if (op === RuleOperator.GreaterThanOrEqual) return value >= rule.threshold;
    if (op === RuleOperator.LessThanOrEqual) return value <= rule.threshold;
    return false;
  }
  private extractMetricValue(metric: Metric, metricType: string): number {
    if (metricType === (MetricType.CPU as unknown as string)) return (metric as CpuMetric).usagePercent;
    if (metricType === (MetricType.Memory as unknown as string)) {
      const m = metric as MemoryMetric;
      return m.totalBytes > 0 ? (m.usedBytes / m.totalBytes) * 100 : 0;
    }
    if (metricType === (MetricType.Disk as unknown as string)) return (metric as DiskMetric).usedPercent;
    if (metricType === (MetricType.Network as unknown as string)) return (metric as NetworkMetric).packetLossPercent;
    return 0;
  }
}
