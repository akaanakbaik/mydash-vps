import type { AppConfig } from '@mydash/shared';

export function loadConfig(): AppConfig {
  return {
    system: {
      nodeEnv: getEnv('NODE_ENV', 'development'),
      port: getEnvNumber('BACKEND_PORT', 4000),
      host: getEnv('HOST', '0.0.0.0'),
      timezone: getEnv('TZ', 'UTC'),
      logLevel: getEnv('LOG_LEVEL', 'info'),
      logRetentionDays: getEnvNumber('LOG_RETENTION_DAYS', 30),
    },
    database: {
      url: getEnvRequired('DATABASE_URL'),
      maxConnections: getEnvNumber('DB_MAX_CONNECTIONS', 20),
      idleTimeoutMs: getEnvNumber('DB_IDLE_TIMEOUT_MS', 30000),
      migrationEnabled: getEnvBool('DB_MIGRATION_ENABLED', true),
    },
    redis: {
      url: getEnvRequired('REDIS_URL'),
      maxRetries: getEnvNumber('REDIS_MAX_RETRIES', 5),
      retryDelayMs: getEnvNumber('REDIS_RETRY_DELAY_MS', 5000),
      keyPrefix: getEnv('REDIS_KEY_PREFIX', 'mydash:'),
    },
    authentication: {
      sessionLifetimeHours: getEnvNumber('SESSION_LIFETIME_HOURS', 24),
      maxLoginAttempts: getEnvNumber('MAX_LOGIN_ATTEMPTS', 5),
      bruteForceCooldownMs: getEnvNumber('BRUTE_FORCE_COOLDOWN_MS', 300000),
      passwordMinLength: getEnvNumber('PASSWORD_MIN_LENGTH', 12),
    },
    notification: {
      enabled: getEnvBool('NOTIFICATION_ENABLED', true),
      workerCount: getEnvNumber('NOTIFICATION_WORKER_COUNT', 2),
      maxRetry: getEnvNumber('NOTIFICATION_MAX_RETRY', 5),
      aiTimeoutSeconds: getEnvNumber('AI_TIMEOUT_SECONDS', 32),
      defaultCooldownMs: getEnvNumber('NOTIFICATION_COOLDOWN_MS', 600000),
      rateLimitPerMinute: getEnvNumber('NOTIFICATION_RATE_LIMIT_PER_MINUTE', 10),
    },
    tunnel: {
      primaryProvider: getEnv('TUNNEL_PRIMARY_PROVIDER', 'instatunnel'),
      fallbackProvider: getEnv('TUNNEL_FALLBACK_PROVIDER', 'localtunnel'),
      healthCheckIntervalMs: getEnvNumber('TUNNEL_HEALTH_CHECK_MS', 30000),
      maxRetry: getEnvNumber('TUNNEL_MAX_RETRY', 5),
      autoReconnect: getEnvBool('TUNNEL_AUTO_RECONNECT', true),
    },
    ai: {
      enabled: getEnvBool('AI_ENABLED', false),
      provider: getEnv('AI_PROVIDER', 'openai'),
      model: getEnv('AI_MODEL', 'gpt-4o'),
      timeoutSeconds: getEnvNumber('AI_TIMEOUT_SECONDS', 32),
      maxTokens: getEnvNumber('AI_MAX_TOKENS', 4096),
    },
    monitoring: {
      cpuSamplingIntervalMs: getEnvNumber('CPU_SAMPLING_MS', 1000),
      memorySamplingIntervalMs: getEnvNumber('MEMORY_SAMPLING_MS', 2000),
      diskSamplingIntervalMs: getEnvNumber('DISK_SAMPLING_MS', 5000),
      networkSamplingIntervalMs: getEnvNumber('NETWORK_SAMPLING_MS', 1000),
      snapshotIntervalMs: getEnvNumber('SNAPSHOT_INTERVAL_MS', 300000),
    },
    security: {
      rateLimitRequestsPerMinute: getEnvNumber('RATE_LIMIT_PER_MINUTE', 60),
      corsAllowedOrigins: getEnv('CORS_ORIGINS', 'http://localhost:3000').split(','),
      encryptionEnabled: getEnvBool('ENCRYPTION_ENABLED', true),
    },
    version: 1,
  };
}

function getEnv(key: string, fallback: string): string {
  return process.env[key] ?? fallback;
}

function getEnvRequired(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Required environment variable ${key} is not set`);
  }
  return value;
}

function getEnvNumber(key: string, fallback: number): number {
  const value = process.env[key];
  if (!value) return fallback;
  const parsed = parseInt(value, 10);
  if (Number.isNaN(parsed)) {
    throw new Error(`Environment variable ${key} must be a valid number`);
  }
  return parsed;
}

function getEnvBool(key: string, fallback: boolean): boolean {
  const value = process.env[key];
  if (!value) return fallback;
  return value === 'true' || value === '1';
}
