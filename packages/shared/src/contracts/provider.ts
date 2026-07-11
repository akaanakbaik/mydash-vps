export interface Provider<TConfig = Record<string, unknown>> {
  initialize(config: TConfig): Promise<void>;
  healthCheck(): Promise<ProviderHealth>;
  shutdown(): Promise<void>;
  readonly name: string;
  readonly version: string;
}
export interface ProviderHealth {
  status: ProviderHealthStatus;
  latencyMs: number;
  lastCheckAt: string;
  message: string | null;
}
export enum ProviderHealthStatus {
  Healthy = 'healthy',
  Degraded = 'degraded',
  Unhealthy = 'unhealthy',
  Unknown = 'unknown',
}
export interface NotificationProviderContract extends Provider {
  send(payload: ProviderDeliveryPayload): Promise<ProviderDeliveryResult>;
  verifyDelivery(messageId: string): Promise<boolean>;
}
export interface ProviderDeliveryPayload {
  recipient: string;
  content: string;
  priority: number;
  correlationId: string;
}
export interface ProviderDeliveryResult {
  success: boolean;
  messageId: string | null;
  errorCode: string | null;
  latencyMs: number;
}
