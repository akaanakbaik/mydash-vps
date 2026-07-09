import type { Logger } from '../../logging/index.js';
import type { MigrationRunner, Migration } from '../../infrastructure/database/migration.js';
import { MigrationStatus } from '../../infrastructure/database/migration.js';

export class DrizzleMigrationRunner implements MigrationRunner {
  private migrations: Migration[] = [];
  private readonly logger: Logger;

  constructor(logger: Logger) {
    this.logger = logger;
  }

  register(migration: Migration): void {
    this.migrations.push(migration);
    this.migrations.sort((a, b) => a.version - b.version);
  }

  async runAll(): Promise<void> {
    const applied = this.getAppliedVersions();
    const pending = this.migrations.filter((m) => !applied.has(m.version));

    for (const migration of pending) {
      this.logger.info(`Running migration ${migration.name} v${String(migration.version)}`);
      await migration.up();
      this.logger.info(`Migration ${migration.name} applied`);
    }
  }

  async rollback(version: number): Promise<void> {
    const migration = this.migrations.find((m) => m.version === version);
    if (!migration) throw new Error(`Migration v${String(version)} not found`);
    this.logger.info(`Rolling back migration ${migration.name}`);
    await migration.down();
  }

  getStatus(): Map<string, MigrationStatus> {
    const status = new Map<string, MigrationStatus>();
    for (const m of this.migrations) {
      status.set(m.name, MigrationStatus.Pending);
    }
    return status;
  }

  private getAppliedVersions(): Map<number, unknown> {
    return new Map();
  }
}
