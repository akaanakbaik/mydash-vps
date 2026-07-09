import type { Result, Session, UserRole } from '@mydash/shared';
import type { AppError } from '@mydash/shared';

export interface AuthService {
  verifyPassword(password: string): Promise<Result<boolean, AppError>>;
  createSession(workspaceId: string, userId: string, metadata: SessionMetadata): Promise<Result<Session, AppError>>;
  validateSession(sessionId: string): Promise<Result<Session, AppError>>;
  destroySession(sessionId: string): Promise<Result<void, AppError>>;
}

export interface SessionMetadata {
  device: string;
  browser: string;
  ipAddress: string;
  operatingSystem: string;
}

export interface AuthorizationService {
  checkPermission(userId: string, workspaceId: string, permission: string): Promise<Result<boolean, AppError>>;
  getUserRole(userId: string, workspaceId: string): Promise<Result<UserRole, AppError>>;
}
