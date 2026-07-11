import { apiClient } from '../api/client.js';
import type { PaginationParams } from '../api/types.js';
export interface CpuMetric {
  model: string;
  vendor: string;
  cores: number;
  threads: number;
  clockMin: number;
  clockMax: number;
  clockCurrent: number;
  loadAverage: number;
  usagePercent: number;
  temperature: number | null;
  perCore: number[];
}
export interface MemoryMetric {
  total: number;
  used: number;
  available: number;
  cached: number;
  buffered: number;
  swapTotal: number;
  swapUsed: number;
  usagePercent: number;
}
export interface DiskMetric {
  device: string;
  mount: string;
  filesystem: string;
  total: number;
  used: number;
  available: number;
  usagePercent: number;
  inodeUsage: number;
  readSpeed: number;
  writeSpeed: number;
}
export interface NetworkMetric {
  interface: string;
  publicIpv4: string;
  publicIpv6: string;
  rxBytes: number;
  txBytes: number;
  rxSpeed: number;
  txSpeed: number;
  packetLoss: number;
  latency: number;
  connections: number;
}
export interface DockerMetric {
  containerCount: number;
  running: number;
  stopped: number;
  cpuPercent: number;
  memoryPercent: number;
  restartCount: number;
  health: 'healthy' | 'degraded' | 'unhealthy';
}
export interface TunnelMetric {
  provider: string;
  status: 'connected' | 'disconnected' | 'reconnecting';
  domain: string;
  ssl: boolean;
  latency: number;
  reconnectCount: number;
  uptime: string;
}
export interface ServiceMetric {
  name: string;
  status: 'running' | 'stopped' | 'failed' | 'restarting';
  cpu: number;
  memory: number;
  uptime: string;
  port: number;
}
export interface MetricTimelinePoint {
  timestamp: string;
  cpu: number;
  memory: number;
  disk: number;
  network: number;
}
export interface CollectionInfo {
  status: 'idle' | 'collecting' | 'success' | 'error';
  lastUpdated: string;
  errorCount: number;
  errors: { message: string; timestamp: string; severity: 'warning' | 'error' }[];
  summary: string;
  nextCollection: string;
}
export interface MonitoringData {
  cpu: CpuMetric;
  memory: MemoryMetric;
  disks: DiskMetric[];
  network: NetworkMetric;
  docker: DockerMetric;
  tunnel: TunnelMetric;
  services: ServiceMetric[];
  timeline: MetricTimelinePoint[];
  collection: CollectionInfo;
  categories: { id: string; label: string; count: number }[];
}
export const monitoringRepository = {
  getMetrics: (params?: PaginationParams) =>
    apiClient.get<MonitoringData>('/monitoring', { params: params as Record<string, string | number | boolean | undefined> }),
  getTimeline: (metric: string, range: string) =>
    apiClient.get<MetricTimelinePoint[]>(`/monitoring/${metric}`, { params: { range } }),
};
