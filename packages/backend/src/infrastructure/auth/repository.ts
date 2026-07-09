import { eq } from 'drizzle-orm';
import type { DrizzleClient } from '../../persistence/connection.js';
import { makeTransactionalDb } from '../../persistence/repository/transactionContext.js';
import { sessions } from '../../persistence/schema/auth.js';
import type { SessionRepository } from '../../domain/auth/repository.js';
import type { Session, AuthSessionId } from '../../domain/auth/entities.js';
import { SessionStatus } from '../../domain/auth/entities.js';

export class SessionRepositoryImpl implements SessionRepository {
  private readonly db: DrizzleClient;

  constructor(db: DrizzleClient) {
    this.db = makeTransactionalDb(db);
  }

  async findById(id: AuthSessionId): Promise<Session | null> {
    const rows = await this.db.select().from(sessions).where(eq(sessions.id, id)).limit(1);
    if (rows.length === 0) return null;
    return this.mapToSession(rows[0]);
  }

  async findByToken(token: string): Promise<Session | null> {
    const rows = await this.db.select().from(sessions).where(eq(sessions.token, token)).limit(1);
    if (rows.length === 0) return null;
    return this.mapToSession(rows[0]);
  }

  async save(session: Session): Promise<void> {
    await this.db.insert(sessions).values({
      id: session.id,
      workspaceId: session.workspaceId,
      userId: session.userId,
      token: session.sessionIdentifier,
      ipAddress: session.ipAddress,
      device: `${session.device} / ${session.browser}`,
      browser: session.browser,
      isTrusted: session.trusted,
      expiresAt: session.expiresAt.toISOString(),
      createdAt: new Date().toISOString(),
      lastActivity: session.lastActivityAt.toISOString(),
    }).onConflictDoUpdate({
      target: sessions.id,
      set: {
        lastActivity: session.lastActivityAt.toISOString(),
        expiresAt: session.expiresAt.toISOString(),
      },
    });
  }

  async delete(id: AuthSessionId): Promise<void> {
    await this.db.delete(sessions).where(eq(sessions.id, id));
  }

  async findByWorkspaceId(workspaceId: string): Promise<Session[]> {
    const rows = await this.db.select().from(sessions).where(eq(sessions.workspaceId, workspaceId));
    return rows.map(r => this.mapToSession(r));
  }

  async expireAll(userId: string): Promise<void> {
    await this.db.delete(sessions).where(eq(sessions.userId, userId));
  }

  private mapToSession(row: typeof sessions.$inferSelect): Session {
    const now = new Date();
    return {
      id: row.id,
      workspaceId: row.workspaceId,
      userId: row.userId,
      sessionIdentifier: row.token,
      device: row.device ?? '',
      browser: row.browser ?? '',
      ipAddress: row.ipAddress ?? '',
      operatingSystem: '',
      trusted: row.isTrusted,
      expiresAt: new Date(row.expiresAt),
      lastActivityAt: row.lastActivity ? new Date(row.lastActivity) : now,
      status: new Date(row.expiresAt) < now ? SessionStatus.Expired : SessionStatus.Active,
      createdAt: now,
      updatedAt: now,
    } as unknown as Session;
  }
}
