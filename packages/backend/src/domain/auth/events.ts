import type { WorkspaceId, UserId } from '../workspace/entities.js';
export interface SessionCreatedEvent {
  readonly sessionId: string;
  readonly workspaceId: WorkspaceId;
  readonly userId: UserId;
  readonly ipAddress: string;
  readonly timestamp: Date;
}
export interface SessionExpiredEvent {
  readonly sessionId: string;
  readonly workspaceId: WorkspaceId;
  readonly userId: UserId;
  readonly reason: string;
  readonly timestamp: Date;
}
