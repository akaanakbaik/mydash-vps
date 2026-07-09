import type { QueueJob, QueueJobStatus } from '@mydash/shared';

export type { QueueJob, QueueJobType, QueueJobStatus } from '@mydash/shared';
export { CircuitBreakerState } from '@mydash/shared';

export interface QueueJobRepository {
  enqueue(job: QueueJob): Promise<void>;
  dequeue(workerId: string): Promise<QueueJob | null>;
  updateStatus(id: string, status: QueueJobStatus): Promise<void>;
  findByCorrelationId(correlationId: string): Promise<QueueJob[]>;
}
