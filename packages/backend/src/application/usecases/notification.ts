import type { Result, AppError, NotificationDelivery } from '@mydash/shared';
import type { UseCase, UseCaseContext, UseCaseMetadata } from './base.js';
import type { NotificationRuleEngine } from '../../domain/notification/services.js';
import type { NotificationDispatcher } from '../../domain/notification/services.js';
import type { Logger } from '../../logging/index.js';
const dispatchMetadata: UseCaseMetadata = {
  name: 'DispatchNotifications',
  description: 'Evaluate rules and dispatch notifications for a server',
  category: 'Notification',
  requiresAuth: false,
  idempotent: false,
  timeoutMs: 30000,
};
export class DispatchNotificationsUseCase implements UseCase<{ serverId: string }, NotificationDelivery[]> {
  public readonly metadata = dispatchMetadata;
  constructor(
    private readonly ruleEngine: NotificationRuleEngine,
    private readonly dispatcher: NotificationDispatcher,
    private readonly logger: Logger,
  ) {}
  async execute(
    input: { serverId: string },
    context: UseCaseContext,
  ): Promise<Result<NotificationDelivery[], AppError>> {
    try {
      const triggeredRules = await this.ruleEngine.evaluate(input.serverId, context.workspaceId);
      if (triggeredRules.length === 0) {
        return { success: true, data: [], error: null };
      }
      const deliveries = await this.dispatcher.dispatchBatch(triggeredRules, input.serverId);
      this.logger.info('notifications dispatched', {
        serverId: input.serverId,
        ruleCount: triggeredRules.length,
        deliveryCount: deliveries.length,
      });
      return { success: true, data: deliveries, error: null };
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      this.logger.error('notification dispatch failed', error, {
        correlationId: context.correlationId,
      });
      return {
        success: false,
        data: null,
        error: { name: error.name, message: error.message, code: 'NOTIFICATION_FAILED' } as AppError,
      };
    }
  }
}
