import type { NotificationRetryManager } from '../../domain/notification/services.js';
import type { NotificationDelivery } from '@mydash/shared';
import type { Logger } from '../../logging/index.js';

export class NotificationRetryManagerImpl implements NotificationRetryManager {
  private readonly deadLetters: NotificationDelivery[] = [];

  constructor(private readonly logger: Logger) {}

  shouldRetry(delivery: NotificationDelivery): boolean {
    return delivery.retryCount < delivery.maxRetry;
  }

  calculateDelay(retryCount: number): number {
    const baseDelay = 5000;
    const exponentialDelay = baseDelay * Math.pow(2, retryCount);
    const jitter = exponentialDelay * 0.15 * (Math.random() * 2 - 1);
    return Math.min(exponentialDelay + jitter, 300000);
  }

  async markDeadLetter(delivery: NotificationDelivery): Promise<void> {
    this.deadLetters.push(delivery);
    this.logger.warn('notification moved to dead letter queue', {
      deliveryId: delivery.id,
      provider: delivery.provider,
      retryCount: delivery.retryCount,
    });
    await Promise.resolve();
  }
}
