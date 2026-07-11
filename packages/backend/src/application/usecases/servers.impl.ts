import type { Result, AppError } from '@mydash/shared';
import type { UseCase, UseCaseContext, UseCaseMetadata } from './base.js';
import type { ServerRepository } from '../../domain/workspace/repository.js';
import type { DockerRepository } from '../../domain/docker/index.js';
import type { TunnelRepository } from '../../domain/tunnel/index.js';
import type { GitHubDomainRepository } from '../../domain/github/index.js';
import type { SessionRepository } from '../../domain/auth/repository.js';
import type { WorkspaceId } from '../../domain/workspace/entities.js';
const listServersMetadata: UseCaseMetadata = {
  name: 'ListServers',
  description: 'List all servers for a workspace',
  category: 'Server',
  requiresAuth: true,
  idempotent: true,
  timeoutMs: 5000,
};
export class ListServersUseCaseImpl implements UseCase<string, unknown[]> {
  public readonly metadata = listServersMetadata;
  constructor(private readonly repository: ServerRepository) {}
  async execute(workspaceId: string, _context: UseCaseContext): Promise<Result<unknown[], AppError>> {
    try {
      const servers = await this.repository.findByWorkspaceId(workspaceId as unknown as WorkspaceId);
      return { success: true, data: servers, error: null };
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      return { success: false, data: null, error: { name: error.name, message: error.message, code: 'SERVER_LIST_FAILED' } as AppError };
    }
  }
}
const listContainersMetadata: UseCaseMetadata = {
  name: 'ListContainers',
  description: 'List Docker containers for a server',
  category: 'Docker',
  requiresAuth: true,
  idempotent: true,
  timeoutMs: 5000,
};
export class ListContainersUseCaseImpl implements UseCase<string, unknown[]> {
  public readonly metadata = listContainersMetadata;
  constructor(private readonly repository: DockerRepository) {}
  async execute(serverId: string, _context: UseCaseContext): Promise<Result<unknown[], AppError>> {
    try {
      const containers = await this.repository.findByServerId(serverId);
      return { success: true, data: containers, error: null };
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      return { success: false, data: null, error: { name: error.name, message: error.message, code: 'CONTAINER_LIST_FAILED' } as AppError };
    }
  }
}
const getTunnelConfigMetadata: UseCaseMetadata = {
  name: 'GetTunnelConfig',
  description: 'Get tunnel configuration for a workspace',
  category: 'Tunnel',
  requiresAuth: true,
  idempotent: true,
  timeoutMs: 3000,
};
export class GetTunnelConfigUseCaseImpl implements UseCase<string, unknown> {
  public readonly metadata = getTunnelConfigMetadata;
  constructor(private readonly repository: TunnelRepository) {}
  async execute(workspaceId: string, _context: UseCaseContext): Promise<Result<unknown, AppError>> {
    try {
      const config = await this.repository.getConfig(workspaceId);
      return { success: true, data: config, error: null };
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      return { success: false, data: null, error: { name: error.name, message: error.message, code: 'TUNNEL_GET_FAILED' } as AppError };
    }
  }
}
const getGithubReposMetadata: UseCaseMetadata = {
  name: 'GetGithubRepos',
  description: 'Get GitHub repositories for a workspace',
  category: 'GitHub',
  requiresAuth: true,
  idempotent: true,
  timeoutMs: 5000,
};
export class GetGithubReposUseCaseImpl implements UseCase<string, unknown[]> {
  public readonly metadata = getGithubReposMetadata;
  constructor(private readonly repository: GitHubDomainRepository) {}
  async execute(workspaceId: string, _context: UseCaseContext): Promise<Result<unknown[], AppError>> {
    try {
      const repos = await this.repository.findByWorkspaceId(workspaceId);
      return { success: true, data: repos, error: null };
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      return { success: false, data: null, error: { name: error.name, message: error.message, code: 'GITHUB_LIST_FAILED' } as AppError };
    }
  }
}
const listSessionsMetadata: UseCaseMetadata = {
  name: 'ListSessions',
  description: 'List active sessions for a workspace',
  category: 'Session',
  requiresAuth: true,
  idempotent: true,
  timeoutMs: 3000,
};
export class ListSessionsUseCaseImpl implements UseCase<string, unknown[]> {
  public readonly metadata = listSessionsMetadata;
  constructor(private readonly repository: SessionRepository) {}
  async execute(workspaceId: string, _context: UseCaseContext): Promise<Result<unknown[], AppError>> {
    try {
      const sessions = await this.repository.findByWorkspaceId(workspaceId);
      return { success: true, data: sessions, error: null };
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      return { success: false, data: null, error: { name: error.name, message: error.message, code: 'SESSION_LIST_FAILED' } as AppError };
    }
  }
}
const listRolesMetadata: UseCaseMetadata = {
  name: 'ListRoles',
  description: 'List all roles and permissions',
  category: 'Role',
  requiresAuth: true,
  idempotent: true,
  timeoutMs: 3000,
};
export class ListRolesUseCaseImpl implements UseCase<undefined, unknown[]> {
  public readonly metadata = listRolesMetadata;
  async execute(_input: undefined, _context: UseCaseContext): Promise<Result<unknown[], AppError>> {
    await Promise.resolve();
    try {
      return { success: true, data: [
        { id: 'owner', name: 'Owner', permissions: ['*'] },
        { id: 'admin', name: 'Administrator', permissions: ['admin:*', 'workspace:*', 'monitoring:*', 'notification:*', 'automation:*', 'backup:*', 'docker:*', 'tunnel:*', 'github:*', 'plugin:*', 'security:*', 'audit:*', 'settings:*'] },
        { id: 'member', name: 'Member', permissions: ['monitoring:read', 'analytics:read', 'health:read', 'notification:read', 'automation:execute'] },
        { id: 'readonly', name: 'Read Only', permissions: ['monitoring:read', 'analytics:read', 'health:read'] },
      ], error: null };
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      return { success: false, data: null, error: { name: error.name, message: error.message, code: 'ROLE_LIST_FAILED' } as AppError };
    }
  }
}
