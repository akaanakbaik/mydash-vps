export interface SecurityEvent {
  readonly id: string;
  readonly workspaceId: string;
  readonly eventType: SecurityEventType;
  readonly ipAddress: string | null;
  readonly metadata: Record<string, unknown>;
  readonly timestamp: Date;
}

export enum SecurityEventType {
  LoginFailed = 'loginFailed',
  LoginSuccess = 'loginSuccess',
  BruteForceDetected = 'bruteForceDetected',
  FirewallChanged = 'firewallChanged',
  PermissionChanged = 'permissionChanged',
  CredentialRotated = 'credentialRotated',
}

export interface SecurityRepository {
  saveEvent(event: SecurityEvent): Promise<void>;
  findEvents(workspaceId: string, limit?: number): Promise<SecurityEvent[]>;
  getFailedLoginCount(workspaceId: string, windowMs: number): Promise<number>;
}
