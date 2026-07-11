import type { Logger } from '../../logging/index.js';
export abstract class BaseWorker {
  protected readonly logger: Logger;
  public readonly name: string;
  public running: boolean;
  constructor(name: string, logger: Logger) {
    this.name = name;
    this.logger = logger;
    this.running = false;
  }
  abstract start(): Promise<void>;
  abstract stop(): Promise<void>;
  abstract healthCheck(): Promise<boolean>;
}
