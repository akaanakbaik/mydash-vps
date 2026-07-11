import { eq } from 'drizzle-orm';
import type { InferInsertModel } from 'drizzle-orm';
import type { DrizzleClient } from '../../persistence/connection.js';
import { makeTransactionalDb } from '../../persistence/repository/transactionContext.js';
import { tunnelConfigs } from '../../persistence/schema/tunnel.js';
import type { TunnelRepository } from '../../domain/tunnel/index.js';
import type { TunnelConfig, TunnelState } from '@mydash/shared';
type TunnelConfigInsert = InferInsertModel<typeof tunnelConfigs>;
export class TunnelRepositoryImpl implements TunnelRepository {
  private readonly db: DrizzleClient;
  constructor(db: DrizzleClient) {
    this.db = makeTransactionalDb(db);
  }
  async getConfig(workspaceId: string): Promise<TunnelConfig | null> {
    const rows = await this.db.select().from(tunnelConfigs).where(eq(tunnelConfigs.workspaceId, workspaceId)).limit(1);
    if (rows.length === 0) return null;
    return rows[0] as unknown as TunnelConfig;
  }
  async saveConfig(config: TunnelConfig): Promise<void> {
    const raw = config as unknown as Record<string, unknown>;
    const values = {
      id: raw.id ?? '',
      workspaceId: raw.workspaceId ?? '',
      serverId: raw.serverId ?? '',
      provider: raw.primaryProvider ?? '',
      domain: raw.domain ?? '',
      port: raw.port ?? '8080',
      sslEnabled: raw.sslEnabled ?? true,
      autoReconnect: raw.autoReconnect ?? true,
      status: raw.status ?? 'disconnected',
      lastConnectedAt: raw.lastConnectedAt ?? null,
    } as TunnelConfigInsert;
    await this.db.insert(tunnelConfigs).values(values).onConflictDoUpdate({
      target: tunnelConfigs.id,
      set: { status: values.status },
    });
  }
  async saveState(state: TunnelState): Promise<void> {
    const existing = await this.getConfig(state.workspaceId);
    if (existing) {
      const values: TunnelConfigInsert = {
        status: state.status,
        lastConnectedAt: new Date(state.lastConnectedAt),
      } as unknown as TunnelConfigInsert;
      await this.db.update(tunnelConfigs).set(values).where(eq(tunnelConfigs.workspaceId, state.workspaceId));
    }
  }
  async getState(workspaceId: string): Promise<TunnelState | null> {
    const config = await this.getConfig(workspaceId);
    if (!config) return null;
    return {
      workspaceId,
      activeProvider: config.primaryProvider,
      url: config.domain != null ? config.domain : '',
      status: 'disconnected',
      latencyMs: 0,
      reconnectCount: 0,
      lastConnectedAt: '',
      totalDowntimeMs: 0,
      averageReconnectTimeMs: 0,
    };
  }
}
