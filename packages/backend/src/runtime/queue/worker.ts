import type { QueueJob } from '@mydash/shared';
import type { QueueDispatcher, DeadLetterQueue, DeadLetterEntry } from '../../infrastructure/index.js';
import type { Logger } from '../../logging/index.js';
import { createExponentialBackoff } from '../../infrastructure/queue/retry.js';
export class QueueWorker {
  private readonly dispatcher: QueueDispatcher;
  private readonly deadLetter: DeadLetterQueue;
  private readonly logger: Logger;
  constructor(_registry: unknown, dispatcher: QueueDispatcher, deadLetter: DeadLetterQueue, logger: Logger) {
    this.dispatcher = dispatcher;
    this.deadLetter = deadLetter;
    this.logger = logger;
  }
  start(): void {
    this.logger.info('queue worker started');
  }
  stop(): void {
    this.logger.info('queue worker stopped');
  }
  async processJob(job: QueueJob): Promise<void> {
    const policy = createExponentialBackoff(1000, job.maxRetry);
    let attempt = 0;
    while (attempt <= policy.getMaxRetries()) {
      try {
        await this.dispatcher.dispatch(job);
        return;
      } catch (err) {
        attempt++;
        if (attempt > policy.getMaxRetries()) {
          await this.deadLetter.push(job, err instanceof Error ? err.message : String(err));
          this.logger.error(`job ${job.id} moved to dead letter after ${String(attempt)} attempts`);
          return;
        }
        const delay = policy.getDelayMs(attempt);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }
}
export class InMemoryDeadLetterQueue implements DeadLetterQueue {
  private readonly entries = new Map<string, DeadLetterEntry>();
  private readonly logger: Logger;
  constructor(logger: Logger) {
    this.logger = logger;
  }
  push(job: QueueJob, reason: string): Promise<void> {
    this.entries.set(job.id, {
      job,
      reason,
      failedAt: new Date().toISOString(),
      originalAttempts: job.retryCount,
    });
    return Promise.resolve();
  }
  retry(jobId: string): Promise<void> {
    this.entries.delete(jobId);
    return Promise.resolve();
  }
  purge(): Promise<void> {
    this.entries.clear();
    this.logger.info('dead letter queue purged');
    return Promise.resolve();
  }
  getEntries(): Promise<DeadLetterEntry[]> {
    return Promise.resolve(Array.from(this.entries.values()));
  }
  count(): Promise<number> {
    return Promise.resolve(this.entries.size);
  }
}
