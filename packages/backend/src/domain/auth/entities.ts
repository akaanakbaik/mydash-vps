import type { DomainEntity } from '../shared/base.js';
import type { WorkspaceId, UserId } from '../workspace/entities.js';

export type AuthSessionId = string & { readonly __brand: 'AuthSessionId' };

export interface Session extends DomainEntity<AuthSessionId> {
  readonly workspaceId: WorkspaceId;
  readonly userId: UserId;
  readonly sessionIdentifier: string;
  readonly device: string;
  readonly browser: string;
  readonly ipAddress: string;
  readonly operatingSystem: string;
  readonly trusted: boolean;
  readonly expiresAt: Date;
  readonly lastActivityAt: Date;
  readonly status: SessionStatus;
}

export enum SessionStatus {
  Created = 'created',
  Authenticated = 'authenticated',
  Active = 'active',
  Idle = 'idle',
  Expiring = 'expiring',
  Expired = 'expired',
  Destroyed = 'destroyed',
}
