import type { AppConfig } from '@mydash/shared';

export type { AppConfig, SystemConfig, DatabaseConfig, RedisConfig, AuthenticationConfig, NotificationConfig, AIConfig, MonitoringConfig, SecurityConfig, TunnelConfig } from '@mydash/shared';

export interface ConfigurationRepository {
  get(workspaceId: string): Promise<AppConfig | null>;
  save(workspaceId: string, config: AppConfig): Promise<void>;
  getDefault(): AppConfig;
}
