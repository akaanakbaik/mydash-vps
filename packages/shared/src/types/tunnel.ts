export interface TunnelConfig {
  id: string;
  workspaceId: string;
  primaryProvider: string;
  fallbackProvider: string;
  domain: string | null;
  autoReconnect: boolean;
  autoFailback: boolean;
  healthCheckIntervalMs: number;
  retryLimit: number;
  timeoutMs: number;
  apiToken: string;
  createdAt: string;
  updatedAt: string;
}
export interface TunnelState {
  workspaceId: string;
  activeProvider: string;
  url: string;
  status: string;
  latencyMs: number;
  reconnectCount: number;
  lastConnectedAt: string;
  totalDowntimeMs: number;
  averageReconnectTimeMs: number;
}
