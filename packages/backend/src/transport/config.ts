export interface TransportConfig {
  port: number;
  host: string;
  wsPath: string;
  heartbeatIntervalMs: number;
  heartbeatTimeoutMs: number;
  rateLimitMax: number;
  rateLimitWindowMs: number;
  corsOrigin: string;
}

export function createTransportConfig(env: Record<string, string | undefined>): TransportConfig {
  return {
    port: Number(env.PORT ?? '3000'),
    host: env.HOST ?? '0.0.0.0',
    wsPath: env.WS_PATH ?? '/ws',
    heartbeatIntervalMs: Number(env.WS_HEARTBEAT_INTERVAL ?? '30000'),
    heartbeatTimeoutMs: Number(env.WS_HEARTBEAT_TIMEOUT ?? '10000'),
    rateLimitMax: Number(env.RATE_LIMIT_MAX ?? '100'),
    rateLimitWindowMs: Number(env.RATE_LIMIT_WINDOW ?? '60000'),
    corsOrigin: env.CORS_ORIGIN ?? '*',
  };
}
