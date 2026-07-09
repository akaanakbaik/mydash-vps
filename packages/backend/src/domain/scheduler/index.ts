import type { SchedulerTask } from '@mydash/shared';

export type { SchedulerTask, SchedulerExecution } from '@mydash/shared';
export { ScheduleType, TaskStatus } from '@mydash/shared';

export interface SchedulerRepository {
  save(task: SchedulerTask): Promise<void>;
  findById(id: string): Promise<SchedulerTask | null>;
  findDue(): Promise<SchedulerTask[]>;
  delete(id: string): Promise<void>;
}
