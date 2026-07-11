import type { QueueJob } from '@mydash/shared';
import type { QueueDispatcher, QueueRegistry, JobHandler } from '../../infrastructure/index.js';
import type { Logger } from '../../logging/index.js';
export class InMemoryQueueDispatcher implements QueueDispatcher {
  private readonly registry: QueueRegistry;
  private readonly logger: Logger;
  private readonly scheduledJobs = new Map<string, NodeJS.Timeout>();
  constructor(registry: QueueRegistry, logger: Logger) {
    this.registry = registry;
    this.logger = logger;
  }
  async dispatch(job: QueueJob): Promise<void> {
    const handler = this.registry.getHandler(job.jobType);
    if (!handler) {
      this.logger.error(`no handler for job type: ${job.jobType}`);
      return;
    }
    try {
      this.logger.info(`processing job ${job.id}`, { type: job.jobType });
      await handler(job);
    } catch (err) {
      this.logger.error(`job ${job.id} failed: ${err instanceof Error ? err.message : String(err)}`);
      throw err;
    }
  }
  async dispatchBatch(jobs: QueueJob[]): Promise<void> {
    for (const job of jobs) {
      await this.dispatch(job);
    }
  }
  schedule(job: QueueJob, delayMs: number): Promise<void> {
    const timeout = setTimeout(() => {
      void this.dispatch(job);
      this.scheduledJobs.delete(job.id);
    }, delayMs);
    this.scheduledJobs.set(job.id, timeout);
    return Promise.resolve();
  }
  cancel(jobId: string): Promise<void> {
    const timeout = this.scheduledJobs.get(jobId);
    if (timeout) {
      clearTimeout(timeout);
      this.scheduledJobs.delete(jobId);
    }
    return Promise.resolve();
  }
}
export class InMemoryQueueRegistry implements QueueRegistry {
  private readonly handlers = new Map<string, JobHandler>();
  register(type: string, handler: JobHandler): void {
    this.handlers.set(type, handler);
  }
  unregister(type: string): void {
    this.handlers.delete(type);
  }
  getHandler(type: string): JobHandler | undefined {
    return this.handlers.get(type);
  }
  getRegisteredTypes(): string[] {
    return Array.from(this.handlers.keys());
  }
}
