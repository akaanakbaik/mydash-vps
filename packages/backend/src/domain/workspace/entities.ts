import type { AggregateRoot, DomainEntity } from '../shared/base.js';
export type WorkspaceId = string & { readonly __brand: 'WorkspaceId' };
export type UserId = string & { readonly __brand: 'UserId' };
export type ServerId = string & { readonly __brand: 'ServerId' };
export enum UserRole {
  Owner = 'owner',
  Administrator = 'administrator',
  ReadOnly = 'readOnly',
}
export interface Workspace extends AggregateRoot<WorkspaceId> {
  readonly name: string;
  readonly displayName: string;
  readonly timezone: string;
  readonly language: string;
  readonly deletedAt: Date | null;
}
export interface User extends DomainEntity<UserId> {
  readonly workspaceId: WorkspaceId;
  readonly email: string;
  readonly displayName: string | null;
  readonly passwordHash: string;
  readonly role: string;
  readonly lastLoginAt: string | null;
}
export interface Server extends AggregateRoot<ServerId> {
  readonly workspaceId: WorkspaceId;
  readonly hostname: string;
  readonly displayName: string;
  readonly operatingSystem: string;
  readonly kernel: string;
  readonly architecture: string;
  readonly cpuModel: string;
  readonly cpuCores: number;
  readonly totalRamBytes: number;
  readonly totalDiskBytes: number;
  readonly publicIpv4: string;
  readonly publicIpv6: string | null;
  readonly timezone: string;
  readonly agentVersion: string;
  readonly lastHeartbeat: Date | null;
}
