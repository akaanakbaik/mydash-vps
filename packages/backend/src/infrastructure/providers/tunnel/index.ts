export interface TunnelProvider {
  start(): Promise<void>;
  stop(): Promise<void>;
  getUrl(): string | null;
  healthCheck(): Promise<boolean>;
  reconnect(): Promise<void>;
}
