import type { QueueJob } from '@mydash/shared';

export interface DeadLetterQueue {
  push(job: QueueJob, reason: string): Promise<void>;
  retry(jobId: string): Promise<void>;
  purge(): Promise<void>;
  getEntries(): Promise<DeadLetterEntry[]>;
  count(): Promise<number>;
}

export interface DeadLetterEntry {
  job: QueueJob;
  reason: string;
  failedAt: string;
  originalAttempts: number;
}
