import type { DrizzleClient } from '../connection.js';
import type { Logger } from '../../logging/index.js';
import type { RepositoryFactory } from '../../application/factories/contracts.js';
import type { UseCaseContext } from '../../application/usecases/base.js';
export class DrizzleRepositoryFactory implements RepositoryFactory<unknown> {
  private readonly db: DrizzleClient;
  private readonly logger: Logger;
  private readonly registrations = new Map<string, (db: DrizzleClient, logger: Logger) => unknown>();
  constructor(db: DrizzleClient, logger: Logger) {
    this.db = db;
    this.logger = logger;
  }
  register(type: string, factory: (db: DrizzleClient, logger: Logger) => unknown): void {
    this.registrations.set(type, factory);
  }
  create(_context: UseCaseContext): Promise<unknown> {
    return Promise.resolve({});
  }
  createTyped(type: string): unknown {
    const factory = this.registrations.get(type);
    if (!factory) throw new Error(`Repository not registered: ${type}`);
    return factory(this.db, this.logger);
  }
}
