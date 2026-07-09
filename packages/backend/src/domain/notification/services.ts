import type { NotificationRule, NotificationDelivery, NotificationProvider, NotificationTemplate } from '@mydash/shared';

export interface NotificationRuleEngine {
  evaluate(serverId: string, workspaceId: string): Promise<NotificationRule[]>;
  evaluateRule(rule: NotificationRule, serverId: string): Promise<boolean>;
}

export interface NotificationTemplateEngine {
  render(template: NotificationTemplate, values: Record<string, string | number>): string;
  renderDefault(category: string, severity: string, values: Record<string, string | number>): string;
}

export interface NotificationProviderManager {
  register(provider: NotificationProviderAdapter): void;
  send(provider: NotificationProvider, recipient: string, message: string): Promise<DeliveryResult>;
  getAvailableProviders(): NotificationProvider[];
  healthCheck(provider: NotificationProvider): Promise<boolean>;
}

export interface NotificationProviderAdapter {
  readonly providerType: NotificationProvider;
  readonly isAvailable: boolean;
  send(recipient: string, message: string): Promise<DeliveryResult>;
  healthCheck(): Promise<boolean>;
}

export interface DeliveryResult {
  success: boolean;
  providerMessageId: string | null;
  errorCode: string | null;
  errorMessage: string | null;
  latencyMs: number;
}

export interface NotificationRetryManager {
  shouldRetry(delivery: NotificationDelivery): boolean;
  calculateDelay(retryCount: number): number;
  markDeadLetter(delivery: NotificationDelivery): Promise<void>;
}

export interface NotificationRateLimiter {
  canSend(provider: NotificationProvider): boolean;
  recordSend(provider: NotificationProvider): void;
}

export interface NotificationDeduplicator {
  isDuplicate(payloadHash: string, windowMs: number): boolean;
  recordHash(payloadHash: string): void;
}

export interface NotificationDispatcher {
  dispatch(rule: NotificationRule, serverId: string, message: string): Promise<NotificationDelivery>;
  dispatchBatch(rules: NotificationRule[], serverId: string): Promise<NotificationDelivery[]>;
}
