import type { PluginManifest } from '@mydash/shared';
export type { PluginManifest, PluginState } from '@mydash/shared';
export { PluginCapability, PluginPermission, PluginStatus } from '@mydash/shared';
export interface PluginRepository {
  save(manifest: PluginManifest): Promise<void>;
  findById(id: string): Promise<PluginManifest | null>;
  findAll(): Promise<PluginManifest[]>;
  delete(id: string): Promise<void>;
}
