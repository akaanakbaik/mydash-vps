import type { Result } from '@mydash/shared';
import type { Session } from './entities.js';
import type { AppError } from '@mydash/shared';
export interface AuthenticationService {
  verifyPassword(password: string, hash: string, salt: string): Promise<Result<boolean, AppError>>;
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
