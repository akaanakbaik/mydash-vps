import { apiClient } from '../api/client.js';
import type { PaginationParams } from '../api/types.js';

export interface Server {
  id: string;
  name: string;
  hostname: string;
  ipv4: string;
  ipv6: string;
  os: string;
  status: 'online' | 'offline' | 'degraded' | 'maintenance';
  tags: string[];
  healthScore: number;
  cpuModel: string;
  cpuCores: number;
  ramTotal: number;
  ramUsed: number;
  diskTotal: number;
  diskUsed: number;
  bandwidthTotal: number;
  bandwidthUsed: number;
  cpuUsage: number;
  ramUsage: number;
  diskUsage: number;
  location: string;
  datacenter: string;
  region: string;
  uptime: string;
  lastSeen: string;
  agentVersion: string;
  created: string;
}

export interface ServerData {
  servers: Server[];
  totalCount: number;
  onlineCount: number;
  offlineCount: number;
  degradedCount: number;
  avgHealthScore: number;
  totalCores: number;
  totalRam: number;
  totalDisk: number;
  tagOptions: { id: string; label: string }[];
  statusOptions: { id: string; label: string }[];
}

export const serverRepository = {
  getAll: (params?: PaginationParams) =>
    apiClient.get<ServerData>('/servers', { params: params as Record<string, string | number | boolean | undefined> }),
  getById: (id: string) =>
    apiClient.get<Server>(`/servers/${id}`),
};
