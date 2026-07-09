import type { Result } from '@mydash/shared';
import type { Workspace, WorkspaceId } from './entities.js';
import type { AppError } from '@mydash/shared';

export interface WorkspaceService {
  create(name: string, displayName: string, timezone: string): Promise<Result<Workspace, AppError>>;
  getById(id: WorkspaceId): Promise<Result<Workspace, AppError>>;
  update(id: WorkspaceId, data: Partial<Workspace>): Promise<Result<Workspace, AppError>>;
  softDelete(id: WorkspaceId): Promise<Result<void, AppError>>;
}
