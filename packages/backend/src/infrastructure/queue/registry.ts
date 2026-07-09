import type { QueueJob } from '@mydash/shared';

export interface QueueRegistry {
  register(type: string, handler: JobHandler): void;
  unregister(type: string): void;
  getHandler(type: string): JobHandler | undefined;
  getRegisteredTypes(): string[];
}

export type JobHandler = (job: QueueJob) => Promise<void>;
