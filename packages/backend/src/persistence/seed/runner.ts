import type { Logger } from '../../logging/index.js';
import type { DrizzleClient } from '../connection.js';
export interface Seed {
  name: string;
  domain: string;
  run(db: DrizzleClient): Promise<void>;
}
export class SeedRunner {
  private seeds: Seed[] = [];
  private readonly db: DrizzleClient;
  private readonly logger: Logger;
  constructor(db: DrizzleClient, logger: Logger) {
    this.db = db;
    this.logger = logger;
  }
  register(seed: Seed): void {
    this.seeds.push(seed);
  }
  async runAll(): Promise<void> {
    for (const seed of this.seeds) {
      this.logger.info(`Running seed: ${seed.domain}/${seed.name}`);
      await seed.run(this.db);
    }
    this.logger.info('All seeds complete');
  }
}
