import type { HealthChecker, HealthReport, HealthStatus } from '../../infrastructure/health/checker.js';
import { HealthState } from '../../infrastructure/health/checker.js';
import type { IoRedisConnection } from '../redis/connection.js';
import type { WorkerRegistry } from '../worker/worker.js';
import type { SchedulerEngine } from '../scheduler/scheduler.js';

export class RuntimeHealthChecker implements HealthChecker {
  private readonly redis: IoRedisConnection;
  private readonly workers: WorkerRegistry;
  private readonly scheduler: SchedulerEngine;
  private readonly checks = new Map<string, () => Promise<HealthStatus>>();

  constructor(redis: IoRedisConnection, workers: WorkerRegistry, scheduler: SchedulerEngine) {
    this.redis = redis;
    this.workers = workers;
    this.scheduler = scheduler;
  }

  registerCheck(name: string, check: () => Promise<HealthStatus>): void {
    this.checks.set(name, check);
  }

  async check(): Promise<HealthReport> {
    const checks: HealthStatus[] = [];
    const start = Date.now();

    try {
      await this.redis.healthCheck();
      checks.push({ name: 'redis', status: HealthState.Healthy, latencyMs: Date.now() - start, message: 'redis ok' });
    } catch {
      checks.push({ name: 'redis', status: HealthState.Unhealthy, latencyMs: Date.now() - start, message: 'redis failed' });
    }

    const workerList = this.workers.getAll();
    let allWorkersRunning = true;
    for (const [name, worker] of workerList) {
      if (!worker.isRunning()) {
        allWorkersRunning = false;
        checks.push({ name: `worker:${name}`, status: HealthState.Unhealthy, latencyMs: 0, message: 'not running' });
      }
    }
    if (allWorkersRunning && workerList.size > 0) {
      checks.push({ name: 'workers', status: HealthState.Healthy, latencyMs: 0, message: 'all workers running' });
    }

    checks.push({
      name: 'scheduler',
      status: this.scheduler.isRunning() ? HealthState.Healthy : HealthState.Degraded,
      latencyMs: 0,
      message: this.scheduler.isRunning() ? 'scheduler running' : 'scheduler stopped',
    });

    const overall = checks.some((c) => c.status === HealthState.Unhealthy)
      ? HealthState.Unhealthy
      : checks.some((c) => c.status === HealthState.Degraded)
        ? HealthState.Degraded
        : HealthState.Healthy;

    return { status: overall, checks, timestamp: new Date().toISOString() };
  }
}
