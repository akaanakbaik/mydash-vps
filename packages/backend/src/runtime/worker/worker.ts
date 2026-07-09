import type { Logger } from '../../logging/index.js';

export class WorkerRegistry {
  private readonly workers = new Map<string, WorkerLifecycle>();
  private readonly logger: Logger;

  constructor(logger: Logger) {
    this.logger = logger;
  }

  register(name: string, lifecycle: WorkerLifecycle): void {
    this.workers.set(name, lifecycle);
    this.logger.info(`worker registered: ${name}`);
  }

  get(name: string): WorkerLifecycle | undefined {
    return this.workers.get(name);
  }

  getAll(): Map<string, WorkerLifecycle> {
    return new Map(this.workers);
  }

  async startAll(): Promise<void> {
    for (const [name, worker] of this.workers) {
      await worker.start();
      this.logger.info(`worker started: ${name}`);
    }
  }

  async stopAll(): Promise<void> {
    for (const [name, worker] of this.workers) {
      await worker.stop();
      this.logger.info(`worker stopped: ${name}`);
    }
  }
}

export interface WorkerLifecycle {
  start(): Promise<void>;
  stop(): Promise<void>;
  isRunning(): boolean;
}

export class WorkerSupervisor {
  private readonly registry: WorkerRegistry;
  private readonly logger: Logger;
  private interval: NodeJS.Timeout | null = null;

  constructor(registry: WorkerRegistry, logger: Logger) {
    this.registry = registry;
    this.logger = logger;
  }

  startHealthCheck(intervalMs: number = 30000): void {
    this.interval = setInterval(() => {
      void (async () => {
        for (const [name, worker] of this.registry.getAll()) {
          if (!worker.isRunning()) {
            this.logger.warn(`worker ${name} is not running, restarting`);
            await worker.start();
          }
        }
      })();
    }, intervalMs);
  }

  stop(): void {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
  }
}
