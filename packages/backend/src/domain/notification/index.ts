import type { NotificationRule, NotificationDelivery } from '@mydash/shared';
export type { NotificationRule, NotificationTemplate, NotificationDelivery, NotificationHistory } from '@mydash/shared';
export { NotificationProvider, RuleOperator } from '@mydash/shared';
export type { NotificationService, NotificationSendEvent } from '../../application/index.js';
export type { NotificationRuleEngine, NotificationTemplateEngine, NotificationProviderManager, NotificationProviderAdapter, NotificationRetryManager, NotificationRateLimiter, NotificationDeduplicator, NotificationDispatcher, DeliveryResult } from './services.js';
export { DeliveryState } from './valueObjects.js';
export interface NotificationRuleRepository {
  findById(id: string): Promise<NotificationRule | null>;
  findByWorkspaceId(workspaceId: string): Promise<NotificationRule[]>;
  save(rule: NotificationRule): Promise<void>;
  delete(id: string): Promise<void>;
}
export interface NotificationDeliveryRepository {
  save(delivery: NotificationDelivery): Promise<void>;
  findById(id: string): Promise<NotificationDelivery | null>;
  findByServerId(serverId: string): Promise<NotificationDelivery[]>;
  updateStatus(id: string, status: string): Promise<void>;
}
