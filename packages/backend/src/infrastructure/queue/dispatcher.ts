import type { QueueJob } from '@mydash/shared';
export interface QueueDispatcher {
  dispatch(job: QueueJob): Promise<void>;
  dispatchBatch(jobs: QueueJob[]): Promise<void>;
  schedule(job: QueueJob, delayMs: number): Promise<void>;
  cancel(jobId: string): Promise<void>;
}
