import type { NotificationDispatcher } from '../../domain/notification/services.js';
import type { NotificationProviderManager } from '../../domain/notification/services.js';
import type { NotificationTemplateEngine } from '../../domain/notification/services.js';
import type { NotificationRateLimiter } from '../../domain/notification/services.js';
import type { NotificationDeduplicator } from '../../domain/notification/services.js';
import type { NotificationRetryManager } from '../../domain/notification/services.js';
import type { MetricRepository } from '../../domain/monitoring/repository.js';
import type { HealthScoreRepository } from '../../domain/healthScore/index.js';
import type { NotificationRule, NotificationDelivery, MetricType } from '@mydash/shared';
import { NotificationProvider, Priority } from '@mydash/shared';
import type { CpuMetric, MemoryMetric } from '@mydash/shared';
import type { Logger } from '../../logging/index.js';
import { DeliveryStatus } from '@mydash/shared';
import { createHash } from 'crypto';

export class NotificationDispatcherImpl implements NotificationDispatcher {
  constructor(
    private readonly providerManager: NotificationProviderManager,
    private readonly templateEngine: NotificationTemplateEngine,
    private readonly rateLimiter: NotificationRateLimiter,
    private readonly deduplicator: NotificationDeduplicator,
    private readonly retryManager: NotificationRetryManager,
    private readonly metricRepo: MetricRepository,
    private readonly healthRepo: HealthScoreRepository,
    private readonly logger: Logger,
  ) {}

  async dispatch(rule: NotificationRule, serverId: string, message: string): Promise<NotificationDelivery> {
    const delivery: NotificationDelivery = {
      id: crypto.randomUUID(),
      workspaceId: rule.workspaceId,
      serverId,
      notificationId: rule.id,
      provider: NotificationProvider.Dashboard,
      status: DeliveryStatus.Sending,
      priority: Priority.Normal,
      severity: rule.severity,
      retryCount: 0,
      maxRetry: rule.maxRetry,
      deliveryStartedAt: null,
      deliveryCompletedAt: null,
      providerMessageId: null,
      errorCode: null,
      errorMessage: null,
      aiSummary: null,
      correlationId: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };

    const payloadHash = this.generateHash(rule.id + serverId + delivery.correlationId);
    if (this.deduplicator.isDuplicate(payloadHash, rule.cooldownSeconds * 1000)) {
      this.logger.debug('notification deduplicated', { ruleId: rule.id, serverId });
      delivery.status = DeliveryStatus.Sending;
      return delivery;
    }

    this.deduplicator.recordHash(payloadHash);

    for (const provider of rule.providerTarget) {
      if (!this.rateLimiter.canSend(provider)) {
        this.logger.warn('rate limit exceeded for provider', { provider, ruleId: rule.id });
        continue;
      }

      this.rateLimiter.recordSend(provider);

      const result = await this.providerManager.send(provider, serverId, message);
      delivery.provider = provider;
      delivery.status = result.success ? DeliveryStatus.Delivered : DeliveryStatus.Failed;
      delivery.providerMessageId = result.providerMessageId;
      delivery.errorCode = result.errorCode;
      delivery.errorMessage = result.errorMessage;

      if (!result.success && this.retryManager.shouldRetry(delivery)) {
        delivery.retryCount += 1;
      }

      break;
    }

    return delivery;
  }

  async dispatchBatch(rules: NotificationRule[], serverId: string): Promise<NotificationDelivery[]> {
    const context: Record<string, string | number> = {};
    try {
      const cpu = await this.metricRepo.findLatest(serverId, 'cpu' as MetricType);
      if (cpu) context.cpu = (cpu as CpuMetric).usagePercent;
      const mem = await this.metricRepo.findLatest(serverId, 'memory' as MetricType);
      if (mem) {
        context.memory = Math.round(((mem as MemoryMetric).usedBytes / (mem as MemoryMetric).totalBytes) * 100);
      }
      const health = await this.healthRepo.findLatest(serverId);
      if (health) context.healthScore = health.overall;
    } catch {
      this.logger.warn('could not load metric context for notification dispatch', { serverId });
    }

    const deliveries: NotificationDelivery[] = [];
    for (const rule of rules) {
      const renderedMessage = this.templateEngine.renderDefault(rule.category, rule.severity, context);
      const delivery = await this.dispatch(rule, serverId, renderedMessage);
      deliveries.push(delivery);
    }
    return deliveries;
  }

  private generateHash(input: string): string {
    return createHash('sha256').update(input).digest('hex').slice(0, 16);
  }
}
