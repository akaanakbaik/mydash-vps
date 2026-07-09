import { eq } from 'drizzle-orm';
import type { DrizzleClient } from '../../persistence/connection.js';
import { makeTransactionalDb } from '../../persistence/repository/transactionContext.js';
import { plugins } from '../../persistence/schema/plugin.js';
import type { PluginRepository } from '../../domain/plugin/index.js';
import type { PluginManifest } from '@mydash/shared';

export class PluginRepositoryImpl implements PluginRepository {
  private readonly db: DrizzleClient;

  constructor(db: DrizzleClient) {
    this.db = makeTransactionalDb(db);
  }

  async save(manifest: PluginManifest): Promise<void> {
    await this.db.insert(plugins).values({
      id: manifest.id,
      workspaceId: manifest.id,
      name: manifest.name,
      version: manifest.version,
      author: manifest.author,
      description: manifest.description,
      capabilities: manifest.capabilities,
      permissions: manifest.permissions,
      enabled: true,
      config: manifest.configSchema,
      installedAt: new Date(),
    }).onConflictDoUpdate({
      target: plugins.id,
      set: { enabled: true },
    });
  }

  async findById(id: string): Promise<PluginManifest | null> {
    const rows = await this.db.select().from(plugins).where(eq(plugins.id, id)).limit(1);
    if (rows.length === 0) return null;
    return rows[0] as unknown as PluginManifest;
  }

  async findAll(): Promise<PluginManifest[]> {
    const rows = await this.db.select().from(plugins);
    return rows as unknown as PluginManifest[];
  }

  async delete(id: string): Promise<void> {
    await this.db.delete(plugins).where(eq(plugins.id, id));
  }
}
