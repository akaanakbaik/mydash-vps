import type { Logger } from '../../logging/index.js';

export interface ScheduledTask {
  name: string;
  handler: () => Promise<void>;
  intervalMs: number;
}

export class SchedulerEngine {
  private readonly tasks = new Map<string, ScheduledTask>();
  private readonly timers = new Map<string, NodeJS.Timeout>();
  private readonly logger: Logger;
  private running = false;

  constructor(logger: Logger) {
    this.logger = logger;
  }

  register(task: ScheduledTask): void {
    this.tasks.set(task.name, task);
    this.logger.info(`scheduled task registered: ${task.name}`);
  }

  unregister(name: string): void {
    this.tasks.delete(name);
    this.stopTask(name);
  }

  start(): void {
    if (this.running) return;
    this.running = true;
    for (const [name, task] of this.tasks) {
      this.scheduleTask(name, task);
    }
    this.logger.info('scheduler started');
  }

  stop(): void {
    this.running = false;
    for (const name of this.timers.keys()) {
      this.stopTask(name);
    }
    this.logger.info('scheduler stopped');
  }

  isRunning(): boolean {
    return this.running;
  }

  getRegisteredTasks(): string[] {
    return Array.from(this.tasks.keys());
  }

  private scheduleTask(name: string, task: ScheduledTask): void {
    const timer = setInterval(() => {
      void (async () => {
        try {
          this.logger.info(`running task: ${name}`);
          await task.handler();
        } catch (err) {
          this.logger.error(`task ${name} failed: ${err instanceof Error ? err.message : String(err)}`);
        }
      })();
    }, task.intervalMs);
    this.timers.set(name, timer);
  }

  private stopTask(name: string): void {
    const timer = this.timers.get(name);
    if (timer) {
      clearInterval(timer);
      this.timers.delete(name);
    }
  }
}

export class CronScheduler {
  private readonly logger: Logger;
  private readonly jobs = new Map<string, { cron: string; handler: () => Promise<void> }>();
  private interval: NodeJS.Timeout | null = null;

  constructor(logger: Logger) {
    this.logger = logger;
  }

  register(name: string, cronExpression: string, handler: () => Promise<void>): void {
    this.jobs.set(name, { cron: cronExpression, handler });
    this.logger.info(`cron job registered: ${name} (${cronExpression})`);
  }

  start(): void {
    this.interval = setInterval(() => {
      void (async () => {
        for (const [name, job] of this.jobs) {
          try {
            await job.handler();
          } catch (err) {
            this.logger.error(`cron job ${name} failed: ${err instanceof Error ? err.message : String(err)}`);
          }
        }
      })();
    }, 60000);
    this.logger.info('cron scheduler started');
  }

  stop(): void {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
  }
}
