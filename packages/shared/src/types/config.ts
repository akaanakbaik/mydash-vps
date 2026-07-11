export interface AppConfig {
  system: SystemConfig;
  database: DatabaseConfig;
  redis: RedisConfig;
  authentication: AuthenticationConfig;
  notification: NotificationConfig;
  tunnel: TunnelConfig;
  ai: AIConfig;
  monitoring: MonitoringConfig;
  security: SecurityConfig;
  version: number;
}
export interface SystemConfig {
  nodeEnv: string;
  port: number;
  host: string;
  timezone: string;
  logLevel: string;
  logRetentionDays: number;
}
export interface DatabaseConfig {
  url: string;
  maxConnections: number;
  idleTimeoutMs: number;
  migrationEnabled: boolean;
}
export interface RedisConfig {
  url: string;
  maxRetries: number;
  retryDelayMs: number;
  keyPrefix: string;
}
export interface AuthenticationConfig {
  sessionLifetimeHours: number;
  maxLoginAttempts: number;
  bruteForceCooldownMs: number;
  passwordMinLength: number;
}
export interface NotificationConfig {
  enabled: boolean;
  workerCount: number;
  maxRetry: number;
  aiTimeoutSeconds: number;
  defaultCooldownMs: number;
  rateLimitPerMinute: number;
}
export interface TunnelConfig {
  primaryProvider: string;
  fallbackProvider: string;
  healthCheckIntervalMs: number;
  maxRetry: number;
  autoReconnect: boolean;
}
export interface AIConfig {
  enabled: boolean;
  provider: string;
  model: string;
  timeoutSeconds: number;
  maxTokens: number;
}
export interface MonitoringConfig {
  cpuSamplingIntervalMs: number;
  memorySamplingIntervalMs: number;
  diskSamplingIntervalMs: number;
  networkSamplingIntervalMs: number;
  snapshotIntervalMs: number;
}
export interface SecurityConfig {
  rateLimitRequestsPerMinute: number;
  corsAllowedOrigins: string[];
  encryptionEnabled: boolean;
}
