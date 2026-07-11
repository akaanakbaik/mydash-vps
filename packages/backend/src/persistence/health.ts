import { sql } from 'drizzle-orm';
import type { HealthChecker, HealthReport, HealthStatus } from '../infrastructure/health/checker.js';
import { HealthState } from '../infrastructure/health/checker.js';
import type { DrizzleClient } from './connection.js';
import type { Logger } from '../logging/index.js';
export class DatabaseHealthChecker implements HealthChecker {
  private readonly db: DrizzleClient;
  private readonly checks = new Map<string, () => Promise<HealthStatus>>();
  constructor(db: DrizzleClient, _logger: Logger) {
    this.db = db;
  }
  registerCheck(name: string, check: () => Promise<HealthStatus>): void {
    this.checks.set(name, check);
  }
  async check(): Promise<HealthReport> {
    const start = Date.now();
    const checks: HealthStatus[] = [];
    try {
      await this.db.execute(sql`SELECT 1`);
      const latencyMs = Date.now() - start;
      checks.push({
        name: 'database',
        status: HealthState.Healthy,
        latencyMs,
        message: 'database responsive',
      });
    } catch (error) {
      checks.push({
        name: 'database',
        status: HealthState.Unhealthy,
        latencyMs: Date.now() - start,
        message: `database error: ${String(error)}`,
      });
    }
    for (const [name, checkFn] of this.checks) {
      try {
        const status = await checkFn();
        checks.push(status);
      } catch (error) {
        checks.push({ name, status: HealthState.Unhealthy, latencyMs: 0, message: String(error) });
      }
    }
    const overall = checks.some((c) => c.status === HealthState.Unhealthy)
      ? HealthState.Unhealthy
      : checks.some((c) => c.status === HealthState.Degraded)
        ? HealthState.Degraded
        : HealthState.Healthy;
    return { status: overall, checks, timestamp: new Date().toISOString() };
  }
}
