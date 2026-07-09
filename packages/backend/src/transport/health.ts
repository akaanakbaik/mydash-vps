import type { HealthChecker, HealthReport, HealthStatus } from '../infrastructure/health/checker.js';
import { HealthState } from '../infrastructure/health/checker.js';
import type { Server } from 'http';

export class TransportHealthChecker implements HealthChecker {
  private readonly server: Server;
  private readonly checks = new Map<string, () => Promise<HealthStatus>>();

  constructor(server: Server) {
    this.server = server;
  }

  registerCheck(name: string, check: () => Promise<HealthStatus>): void {
    this.checks.set(name, check);
  }

  check(): Promise<HealthReport> {
    const checks: HealthStatus[] = [];

    if (this.server.listening) {
      checks.push({ name: 'http', status: HealthState.Healthy, latencyMs: 0, message: 'server listening' });
    } else {
      checks.push({ name: 'http', status: HealthState.Unhealthy, latencyMs: 0, message: 'server not listening' });
    }

    const overall = checks.some((c) => c.status === HealthState.Unhealthy)
      ? HealthState.Unhealthy
      : HealthState.Healthy;

    return Promise.resolve({ status: overall, checks, timestamp: new Date().toISOString() });
  }
}
