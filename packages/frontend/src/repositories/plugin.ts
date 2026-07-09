import { apiClient } from '../api/client.js';
import type { PaginationParams } from '../api/types.js';

export interface Plugin {
  id: string;
  name: string;
  description: string;
  version: string;
  author: string;
  status: 'installed' | 'available' | 'update_available' | 'disabled' | 'incompatible';
  category: string;
  installedAt: string | null;
  size: number;
  downloads: number;
  rating: number;
  compatible: boolean;
  dependencies: string[];
  permissions: string[];
}

export interface PluginCategory {
  id: string;
  label: string;
  count: number;
}

export interface PluginResponse {
  plugins: Plugin[];
  marketplace: Plugin[];
  categories: PluginCategory[];
  installed: number;
  updates: number;
}

export const pluginRepository = {
  getAll: (params?: PaginationParams) =>
    apiClient.get<PluginResponse>('/plugins', { params: params as Record<string, string | number | boolean | undefined> }),
  getMarketplace: () =>
    apiClient.get<Plugin[]>('/plugins/marketplace'),
  install: (id: string) =>
    apiClient.post(`/plugins/${id}/install`),
  uninstall: (id: string) =>
    apiClient.post(`/plugins/${id}/uninstall`),
};
