export interface PresenceManager {
  register(userId: string, metadata: PresenceMetadata): Promise<void>;
  unregister(userId: string): Promise<void>;
  heartbeat(userId: string): Promise<void>;
  getPresence(userId: string): Promise<PresenceStatus>;
  getOnlineUsers(): Promise<string[]>;
}

export interface PresenceMetadata {
  device: string;
  browser: string;
  ipAddress: string;
  workspaceId: string;
}

export interface PresenceStatus {
  userId: string;
  state: PresenceState;
  lastHeartbeat: string;
  metadata: PresenceMetadata;
}

export enum PresenceState {
  Online = 'online',
  Idle = 'idle',
  Offline = 'offline',
}
