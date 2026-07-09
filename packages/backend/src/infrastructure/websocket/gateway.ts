import type { WebSocketEnvelope, SubscriptionRequest } from '@mydash/shared';

export interface WebSocketGateway {
  start(port: number): Promise<void>;
  stop(): Promise<void>;
  broadcast(channel: string, envelope: WebSocketEnvelope): void;
  subscribe(clientId: string, request: SubscriptionRequest): void;
  unsubscribe(clientId: string, channel: string): void;
  getConnectedClients(): number;
  healthCheck(): Promise<boolean>;
}
