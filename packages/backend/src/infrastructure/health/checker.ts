export interface HealthChecker {
  check(): Promise<HealthReport>;
  registerCheck(name: string, check: () => Promise<HealthStatus>): void;
}

export interface HealthStatus {
  name: string;
  status: HealthState;
  latencyMs: number;
  message: string | null;
}

export enum HealthState {
  Healthy = 'healthy',
  Degraded = 'degraded',
  Unhealthy = 'unhealthy',
}

export interface HealthReport {
  status: HealthState;
  checks: HealthStatus[];
  timestamp: string;
}
