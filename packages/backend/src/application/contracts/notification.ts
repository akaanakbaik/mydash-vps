import type { Result, NotificationDelivery, NotificationRule } from '@mydash/shared';
import type { AppError } from '@mydash/shared';
export interface NotificationService {
  send(event: NotificationSendEvent): Promise<Result<NotificationDelivery, AppError>>;
  getDeliveryStatus(deliveryId: string): Promise<Result<NotificationDelivery, AppError>>;
  getActiveRules(workspaceId: string): Promise<Result<NotificationRule[], AppError>>;
  updateRule(rule: NotificationRule): Promise<Result<NotificationRule, AppError>>;
}
export interface NotificationSendEvent {
  workspaceId: string;
  serverId: string;
  ruleId: string;
  eventType: string;
  metricValues: Record<string, number>;
  requiresAI: boolean;
}
