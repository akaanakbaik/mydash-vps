import type { Workspace, WorkspaceId, User, UserId, Server, ServerId } from './entities.js';

export interface WorkspaceRepository {
  findById(id: WorkspaceId): Promise<Workspace | null>;
  findAll(): Promise<Workspace[]>;
  save(workspace: Workspace): Promise<void>;
  delete(id: WorkspaceId): Promise<void>;
}
export interface UserRepository {
  findById(id: UserId): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findByWorkspaceId(workspaceId: WorkspaceId): Promise<User[]>;
  save(user: User): Promise<void>;
  delete(id: UserId): Promise<void>;
}

export interface ServerRepository {
  findById(id: ServerId): Promise<Server | null>;
  findByWorkspaceId(workspaceId: WorkspaceId): Promise<Server[]>;
  save(server: Server): Promise<void>;
  delete(id: ServerId): Promise<void>;
}
