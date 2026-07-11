export interface Workspace {
  id: string;
  name: string;
  displayName: string;
  timezone: string;
  language: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  version: number;
}
export interface Server {
  id: string;
  workspaceId: string;
  hostname: string;
  displayName: string;
  operatingSystem: string;
  kernel: string;
  architecture: string;
  cpuModel: string;
  cpuCores: number;
  totalRamBytes: number;
  totalDiskBytes: number;
  publicIpv4: string;
  publicIpv6: string | null;
  timezone: string;
  agentVersion: string;
  healthScore: number;
  status: string;
  tunnelStatus: string;
  lastHeartbeat: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  version: number;
}
export interface User {
  id: string;
  workspaceId: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}
export enum UserRole {
  Owner = 'owner',
  Administrator = 'administrator',
  ReadOnly = 'readOnly',
}
export interface Session {
  id: string;
  workspaceId: string;
  userId: string;
  sessionIdentifier: string;
  device: string;
  browser: string;
  ipAddress: string;
  operatingSystem: string;
  trusted: boolean;
  createdAt: string;
  expiresAt: string;
  lastActivityAt: string;
  status: SessionStatus;
  correlationId: string;
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
