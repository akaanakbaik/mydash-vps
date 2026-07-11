import type { Result, AppError, NotificationDelivery } from '@mydash/shared';
import type { Command, CommandHandler, CommandMetadata } from './base.js';
import type { NotificationRuleEngine } from '../../domain/notification/services.js';
import type { NotificationDispatcher } from '../../domain/notification/services.js';
import type { Logger } from '../../logging/index.js';
export interface DispatchNotificationCommand extends Command {
  serverId: string;
}
export const dispatchNotificationMetadata: CommandMetadata = {
  handlerType: 'DispatchNotification',
  description: 'Evaluate rules and dispatch notifications for a server',
  requiresAuth: false,
  idempotent: false,
  retryable: true,
  timeoutMs: 30000,
};
export class DispatchNotificationCommandHandler implements CommandHandler<DispatchNotificationCommand, NotificationDelivery[]> {
  public readonly handlerType = 'DispatchNotification';
  public readonly metadata = dispatchNotificationMetadata;
  constructor(
    private readonly ruleEngine: NotificationRuleEngine,
    private readonly dispatcher: NotificationDispatcher,
    private readonly logger: Logger,
  ) {}
  async handle(command: DispatchNotificationCommand): Promise<Result<NotificationDelivery[], AppError>> {
    try {
      const triggeredRules = await this.ruleEngine.evaluate(command.serverId, command.workspaceId);
      this.logger.info('dispatching notifications', {
        correlationId: command.correlationId,
        ruleCount: triggeredRules.length,
      });
      const deliveries = await this.dispatcher.dispatchBatch(triggeredRules, command.serverId);
      return { success: true, data: deliveries, error: null };
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      this.logger.error('notification dispatch failed', error, { correlationId: command.correlationId });
      return {
        success: false,
        data: null,
        error: { name: error.name, message: error.message, code: 'NOTIFICATION_DISPATCH_FAILED' } as AppError,
      };
    }
  }
}
