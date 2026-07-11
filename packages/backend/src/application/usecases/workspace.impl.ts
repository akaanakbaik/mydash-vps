import type { Result, AppError } from '@mydash/shared';
import type { UseCase, UseCaseContext, UseCaseMetadata } from './base.js';
import type { WorkspaceRepository } from '../../domain/workspace/repository.js';
import type { WorkspaceCreateDTO } from '../dto/index.js';
import type { Logger } from '../../logging/index.js';
import type { Workspace, WorkspaceId } from '../../domain/workspace/entities.js';
const createMetadata: UseCaseMetadata = {
  name: 'CreateWorkspace',
  description: 'Create a new workspace',
  category: 'Workspace',
  requiresAuth: true,
  idempotent: false,
  timeoutMs: 5000,
};
export class CreateWorkspaceUseCaseImpl implements UseCase<WorkspaceCreateDTO, unknown> {
  public readonly metadata = createMetadata;
  constructor(
    private readonly repository: WorkspaceRepository,
    private readonly logger: Logger,
  ) {}
  async execute(input: WorkspaceCreateDTO, context: UseCaseContext): Promise<Result<unknown, AppError>> {
    try {
      const now = new Date();
      const workspace: Workspace = {
        id: crypto.randomUUID() as WorkspaceId,
        name: input.name,
        displayName: input.displayName,
        timezone: input.timezone,
        language: input.language,
        createdAt: now,
        updatedAt: now,
        deletedAt: null,
        version: 1,
      };
      await this.repository.save(workspace);
      this.logger.info('workspace created', {
        workspaceId: workspace.id,
        name: workspace.name,
        correlationId: context.correlationId,
      });
      return { success: true, data: workspace, error: null };
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      this.logger.error('workspace creation failed', error, { correlationId: context.correlationId });
      return {
        success: false,
        data: null,
        error: { name: error.name, message: error.message, code: 'WORKSPACE_CREATE_FAILED' } as AppError,
      };
    }
  }
}
const getMetadata: UseCaseMetadata = {
  name: 'GetWorkspace',
  description: 'Retrieve workspace by ID',
  category: 'Workspace',
  requiresAuth: true,
  idempotent: true,
  timeoutMs: 3000,
};
export class GetWorkspaceUseCaseImpl implements UseCase<string, unknown> {
  public readonly metadata = getMetadata;
  constructor(
    private readonly repository: WorkspaceRepository,
  ) {}
  async execute(id: string, _context: UseCaseContext): Promise<Result<unknown, AppError>> {
    try {
      const workspace = await this.repository.findById(id as WorkspaceId);
      return { success: true, data: workspace, error: null };
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      return {
        success: false,
        data: null,
        error: { name: error.name, message: error.message, code: 'WORKSPACE_GET_FAILED' } as AppError,
      };
    }
  }
}
const listMetadata: UseCaseMetadata = {
  name: 'ListWorkspaces',
  description: 'List all workspaces',
  category: 'Workspace',
  requiresAuth: true,
  idempotent: true,
  timeoutMs: 3000,
};
export class ListWorkspacesUseCaseImpl implements UseCase<undefined, unknown[]> {
  public readonly metadata = listMetadata;
  constructor(
    private readonly repository: WorkspaceRepository,
  ) {}
  async execute(_input: undefined, _context: UseCaseContext): Promise<Result<unknown[], AppError>> {
    try {
      const workspaces = await this.repository.findAll();
      return { success: true, data: workspaces, error: null };
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      return {
        success: false,
        data: null,
        error: { name: error.name, message: error.message, code: 'WORKSPACE_LIST_FAILED' } as AppError,
      };
    }
  }
}
const deleteMetadata: UseCaseMetadata = {
  name: 'DeleteWorkspace',
  description: 'Delete a workspace by ID',
  category: 'Workspace',
  requiresAuth: true,
  idempotent: true,
  timeoutMs: 3000,
};
export class DeleteWorkspaceUseCaseImpl implements UseCase<string, undefined> {
  public readonly metadata = deleteMetadata;
  constructor(
    private readonly repository: WorkspaceRepository,
    private readonly logger: Logger,
  ) {}
  async execute(id: string, _context: UseCaseContext): Promise<Result<undefined, AppError>> {
    try {
      await this.repository.delete(id as WorkspaceId);
      return { success: true, data: undefined, error: null };
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      this.logger.error('workspace deletion failed', error);
      return {
        success: false,
        data: null,
        error: { name: error.name, message: error.message, code: 'WORKSPACE_DELETE_FAILED' } as AppError,
      };
    }
  }
}
