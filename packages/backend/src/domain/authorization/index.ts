import type { UserId, WorkspaceId } from '../workspace/entities.js';
import type { Result } from '@mydash/shared';
import type { AppError } from '@mydash/shared';
export interface AuthorizationService {
  checkPermission(userId: UserId, workspaceId: WorkspaceId, permission: string): Promise<Result<boolean, AppError>>;
  getUserRole(userId: UserId, workspaceId: WorkspaceId): Promise<Result<string, AppError>>;
  assignRole(userId: UserId, workspaceId: WorkspaceId, role: string): Promise<Result<void, AppError>>;
}
export interface Permission {
  id: string;
  name: string;
  description: string;
}
