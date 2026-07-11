export interface RedisConfig {
  url: string;
  keyPrefix: string;
  maxRetries: number;
}
export interface RuntimeConfig {
  redis: RedisConfig;
  workerHealthCheckIntervalMs: number;
  schedulerDefaultIntervalMs: number;
  queueMaxRetries: number;
  queueRetryBaseDelayMs: number;
}
export function createRuntimeConfig(env: Record<string, string | undefined>): RuntimeConfig {
  return {
    redis: {
      url: env.REDIS_URL ?? 'redis://localhost:6379',
      keyPrefix: env.REDIS_KEY_PREFIX ?? 'mydash:',
      maxRetries: Number(env.REDIS_MAX_RETRIES ?? '10'),
    },
    workerHealthCheckIntervalMs: Number(env.WORKER_HEALTH_INTERVAL ?? '30000'),
    schedulerDefaultIntervalMs: Number(env.SCHEDULER_INTERVAL ?? '60000'),
    queueMaxRetries: Number(env.QUEUE_MAX_RETRIES ?? '3'),
    queueRetryBaseDelayMs: Number(env.QUEUE_RETRY_DELAY ?? '1000'),
  };
}
