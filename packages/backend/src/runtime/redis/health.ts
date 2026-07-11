import type { HealthChecker, HealthReport, HealthStatus } from '../../infrastructure/health/checker.js';
import { HealthState } from '../../infrastructure/health/checker.js';
import type { IoRedisConnection } from './connection.js';
export class RedisHealthChecker implements HealthChecker {
  private readonly redis: IoRedisConnection;
  private readonly checks = new Map<string, () => Promise<HealthStatus>>();
  constructor(redis: IoRedisConnection) {
    this.redis = redis;
  }
  registerCheck(name: string, check: () => Promise<HealthStatus>): void {
    this.checks.set(name, check);
  }
  async check(): Promise<HealthReport> {
    const start = Date.now();
    try {
      await this.redis.healthCheck();
      return {
        status: HealthState.Healthy,
        checks: [{ name: 'redis', status: HealthState.Healthy, latencyMs: Date.now() - start, message: 'redis responsive' }],
        timestamp: new Date().toISOString(),
      };
    } catch {
      return {
        status: HealthState.Unhealthy,
        checks: [{ name: 'redis', status: HealthState.Unhealthy, latencyMs: Date.now() - start, message: 'redis unreachable' }],
        timestamp: new Date().toISOString(),
      };
    }
  }
}
