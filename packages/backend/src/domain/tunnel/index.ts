import type { TunnelConfig, TunnelState } from '@mydash/shared';

export type { TunnelConfig, TunnelState } from '@mydash/shared';

export interface TunnelRepository {
  getConfig(workspaceId: string): Promise<TunnelConfig | null>;
  saveConfig(config: TunnelConfig): Promise<void>;
  saveState(state: TunnelState): Promise<void>;
  getState(workspaceId: string): Promise<TunnelState | null>;
}
