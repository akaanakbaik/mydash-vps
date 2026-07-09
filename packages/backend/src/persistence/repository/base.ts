import type { DrizzleClient } from '../connection.js';
import type { Logger } from '../../logging/index.js';
import { eq } from 'drizzle-orm';
import { makeTransactionalDb } from './transactionContext.js';

export class BaseDrizzleRepository {
  protected readonly db: DrizzleClient;
  protected readonly logger: Logger;
  protected readonly table: unknown;

  constructor(db: DrizzleClient, logger: Logger, table: unknown) {
    this.db = makeTransactionalDb(db);
    this.logger = logger;
    this.table = table;
  }

  async findById(id: string): Promise<unknown> {
    const t = this.table as { id: unknown };
    const results = await this.db.select().from(t as never).where(eq(t.id as never, id as never)).limit(1);
    return (results as unknown[])[0] ?? null;
  }

  async findAll(): Promise<unknown[]> {
    const tbl: never = this.table as never;
    return this.db.select().from(tbl);
  }

  async create(entity: unknown): Promise<unknown> {
    const results = await this.db.insert(this.table as never).values(entity as never).returning();
    return (results as unknown[])[0];
  }

  async update(id: string, data: unknown): Promise<unknown> {
    const t = this.table as { id: unknown };
    const up: never = t as never;
    const results = await this.db.update(up)
      .set({ ...(data as object), updatedAt: new Date() })
      .where(eq(t.id as never, id as never))
      .returning();
    return (results as unknown[])[0];
  }

  async delete(id: string): Promise<void> {
    const t = this.table as { id: unknown };
    const del: never = t as never;
    await this.db.delete(del).where(eq(t.id as never, id as never));
  }

  async softDelete(id: string): Promise<void> {
    const t = this.table as { id: unknown };
    const upd: never = t as never;
    await this.db.update(upd)
      .set({ deletedAt: new Date() })
      .where(eq(t.id as never, id as never));
  }

  async exists(id: string): Promise<boolean> {
    const result = await this.findById(id);
    return result !== null;
  }

  async count(): Promise<number> {
    const results = await this.db.select().from(this.table as never);
    return (results as unknown[]).length;
  }
}
