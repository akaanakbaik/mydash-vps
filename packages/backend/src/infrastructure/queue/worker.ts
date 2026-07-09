import { BaseWorker } from '../base/worker.js';

export abstract class QueueWorker extends BaseWorker {
  abstract process(): Promise<void>;
}
