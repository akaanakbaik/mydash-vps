import { eq } from 'drizzle-orm';
import type { DrizzleClient } from '../../persistence/connection.js';
import { workspaces, users, servers } from '../../persistence/schema/workspace.js';
import type { WorkspaceRepository, UserRepository, ServerRepository } from '../../domain/workspace/repository.js';
import type { WorkspaceId, UserId, ServerId, Workspace, User, Server } from '../../domain/workspace/entities.js';
import { makeTransactionalDb } from '../../persistence/repository/transactionContext.js';
export class WorkspaceRepositoryImpl implements WorkspaceRepository {
  private readonly db: DrizzleClient;
  constructor(db: DrizzleClient) {
    this.db = makeTransactionalDb(db);
  }
  async findById(id: WorkspaceId): Promise<Workspace | null> {
    const rows = await this.db.select().from(workspaces).where(eq(workspaces.id, id)).limit(1);
    if (rows.length === 0) return null;
    return this.mapToWorkspace(rows[0]);
  }
  async save(workspace: Workspace): Promise<void> {
    await this.db.insert(workspaces).values({
      id: workspace.id,
      workspaceId: workspace.id,
      name: workspace.name,
      displayName: workspace.displayName,
      timezone: workspace.timezone,
      language: workspace.language,
      isActive: true,
    }).onConflictDoUpdate({
      target: workspaces.id,
      set: { displayName: workspace.displayName },
    });
  }
  async findAll(): Promise<Workspace[]> {
    const rows = await this.db.select().from(workspaces);
    return rows.map(r => this.mapToWorkspace(r));
  }
  async delete(id: WorkspaceId): Promise<void> {
    await this.db.delete(workspaces).where(eq(workspaces.id, id));
  }
  private mapToWorkspace(row: Record<string, unknown>): Workspace {
    const now = new Date();
    return {
      id: row.id as WorkspaceId,
      name: row.name as string,
      displayName: row.displayName as string,
      timezone: row.timezone as string,
      language: row.language as string,
      deletedAt: null,
      createdAt: row.createdAt instanceof Date ? row.createdAt : now,
      updatedAt: row.updatedAt instanceof Date ? row.updatedAt : now,
      version: 1,
    };
  }
}
export class UserRepositoryImpl implements UserRepository {
  private readonly db: DrizzleClient;
  constructor(db: DrizzleClient) {
    this.db = makeTransactionalDb(db);
  }
  async findById(id: UserId): Promise<User | null> {
    const rows = await this.db.select().from(users).where(eq(users.id, id)).limit(1);
    if (rows.length === 0) return null;
    return this.mapToUser(rows[0]);
  }
  async findByEmail(email: string): Promise<User | null> {
    const rows = await this.db.select().from(users).where(eq(users.email, email)).limit(1);
    if (rows.length === 0) return null;
    return this.mapToUser(rows[0]);
  }
  async findByWorkspaceId(workspaceId: string): Promise<User[]> {
    const rows = await this.db.select().from(users).where(eq(users.workspaceId, workspaceId));
    return rows.map(r => this.mapToUser(r));
  }
  async save(user: User): Promise<void> {
    await this.db.insert(users).values({
      id: user.id,
      workspaceId: user.workspaceId,
      email: user.email,
      passwordHash: user.passwordHash,
      displayName: user.displayName,
      role: user.role,
      lastLoginAt: user.lastLoginAt,
    }).onConflictDoUpdate({
      target: users.id,
      set: { email: user.email, displayName: user.displayName, role: user.role, passwordHash: user.passwordHash, lastLoginAt: user.lastLoginAt },
    });
  }
  async delete(id: UserId): Promise<void> {
    await this.db.delete(users).where(eq(users.id, id));
  }
  private mapToUser(row: Record<string, unknown>): User {
    const now = new Date();
    return {
      id: row.id as UserId,
      workspaceId: row.workspaceId as WorkspaceId,
      email: row.email as string,
      displayName: row.displayName as string,
      passwordHash: row.passwordHash as string,
      role: row.role as string,
      lastLoginAt: row.lastLoginAt as string,
      createdAt: row.createdAt instanceof Date ? row.createdAt : now,
      updatedAt: row.updatedAt instanceof Date ? row.updatedAt : now,
    };
  }
}
export class ServerRepositoryImpl implements ServerRepository {
  private readonly db: DrizzleClient;
  constructor(db: DrizzleClient) {
    this.db = makeTransactionalDb(db);
  }
  async findById(id: ServerId): Promise<Server | null> {
    const rows = await this.db.select().from(servers).where(eq(servers.id, id)).limit(1);
    if (rows.length === 0) return null;
    return this.mapToServer(rows[0]);
  }
  async findByWorkspaceId(workspaceId: string): Promise<Server[]> {
    const rows = await this.db.select().from(servers).where(eq(servers.workspaceId, workspaceId));
    return rows.map(r => this.mapToServer(r));
  }
  async save(server: Server): Promise<void> {
    await this.db.insert(servers).values({
      id: server.id,
      workspaceId: server.workspaceId,
      name: server.hostname,
      hostname: server.hostname,
      displayName: server.displayName,
      status: 'offline',
      lastHeartbeat: null,
    }).onConflictDoUpdate({
      target: servers.id,
      set: { displayName: server.displayName, status: 'offline' },
    });
  }
  async delete(id: ServerId): Promise<void> {
    await this.db.delete(servers).where(eq(servers.id, id));
  }
  private mapToServer(row: Record<string, unknown>): Server {
    const now = new Date();
    return {
      id: row.id as ServerId,
      workspaceId: row.workspaceId as WorkspaceId,
      hostname: row.hostname as string,
      displayName: row.displayName as string,
      operatingSystem: '',
      kernel: '',
      architecture: '',
      cpuModel: '',
      cpuCores: 0,
      totalRamBytes: 0,
      totalDiskBytes: 0,
      publicIpv4: '',
      publicIpv6: null,
      timezone: 'UTC',
      agentVersion: '',
      lastHeartbeat: null,
      createdAt: row.createdAt instanceof Date ? row.createdAt : now,
      updatedAt: row.updatedAt instanceof Date ? row.updatedAt : now,
      version: 1,
    };
  }
}
