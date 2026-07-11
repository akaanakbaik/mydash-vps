import type { QueueJob } from '@mydash/shared';
export interface QueueEngine {
  start(): Promise<void>;
  stop(): Promise<void>;
  enqueue(job: QueueJob): Promise<void>;
  dequeue(workerId: string): Promise<QueueJob | null>;
  acknowledge(jobId: string): Promise<void>;
  retry(jobId: string, delayMs?: number): Promise<void>;
  moveToDeadLetter(jobId: string): Promise<void>;
  getStats(): QueueStats;
  healthCheck(): Promise<boolean>;
}
export interface QueueStats {
  total: number;
  pending: number;
  running: number;
  failed: number;
  deadLetter: number;
}
