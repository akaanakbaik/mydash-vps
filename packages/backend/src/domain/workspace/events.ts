import type { WorkspaceId, UserId } from './entities.js';

export interface WorkspaceCreatedEvent {
  readonly workspaceId: WorkspaceId;
  readonly name: string;
  readonly timestamp: Date;
}
export interface UserLoginEvent {
  readonly workspaceId: WorkspaceId;
  readonly userId: UserId;
  readonly ipAddress: string;
  readonly device: string;
  readonly timestamp: Date;
}
