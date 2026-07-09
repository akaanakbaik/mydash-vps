export interface RedisPubSub {
  publish(channel: string, message: string): Promise<void>;
  subscribe(channel: string, handler: (message: string) => void): Promise<void>;
  unsubscribe(channel: string): Promise<void>;
  isConnected(): boolean;
}

export interface PubSubMessage {
  channel: string;
  payload: unknown;
  timestamp: string;
}
