export type { AppConfig } from '@mydash/shared';

export interface SystemRepository {
  getHealth(): Promise<SystemHealth>;
}

export interface SystemHealth {
  uptime: number;
  status: string;
  checks: Record<string, boolean>;
}
