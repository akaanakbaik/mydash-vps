import { apiClient } from '../api/client.js';
import type { PaginationParams } from '../api/types.js';

export interface TunnelOverview {
  status: 'connected' | 'disconnected' | 'reconnecting';
  provider: string;
  domain: string;
  publicUrl: string;
  ssl: boolean;
  latency: number;
  uptime: string;
  reconnectCount: number;
  trafficIn: number;
  trafficOut: number;
}

export interface TunnelReconnect {
  id: number;
  timestamp: string;
  reason: string;
  duration: number;
  success: boolean;
}

export interface TunnelTimelinePoint {
  timestamp: string;
  latency: number;
  traffic: number;
}

export interface TunnelResponse {
  overview: TunnelOverview;
  reconnectHistory: TunnelReconnect[];
  timeline: TunnelTimelinePoint[];
  filterOptions: { id: string; label: string }[];
}

export const tunnelRepository = {
  getOverview: () =>
    apiClient.get<TunnelResponse>('/tunnel'),
  getSessions: (params?: PaginationParams) =>
    apiClient.get<TunnelSession[]>('/tunnel/sessions', { params: params as Record<string, string | number | boolean | undefined> }),
};

export interface TunnelSession {
  id: string;
  name: string;
  type: string;
  status: string;
  target: string;
  port: number;
  uptime: string;
  bandwidth: number;
  lastActive: string;
}
