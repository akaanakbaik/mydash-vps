export interface MetricHeader {
  id: string;
  workspaceId: string;
  serverId: string;
  timestamp: string;
  metricType: MetricType;
  correlationId: string;
  version: number;
}
export enum MetricType {
  CPU = 'cpu',
  Memory = 'memory',
  Swap = 'swap',
  Disk = 'disk',
  Filesystem = 'filesystem',
  Network = 'network',
  Docker = 'docker',
  Service = 'service',
  Tunnel = 'tunnel',
  Database = 'database',
  Redis = 'redis',
  Process = 'process',
  Temperature = 'temperature',
}
export interface CpuMetric {
  header: MetricHeader;
  model: string;
  vendor: string;
  sockets: number;
  cores: number;
  threads: number;
  frequencyMinMhz: number;
  frequencyMaxMhz: number;
  frequencyCurrentMhz: number;
  loadAverage: number[];
  usagePercent: number;
  perCoreUsage: number[];
  userPercent: number;
  systemPercent: number;
  idlePercent: number;
  ioWaitPercent: number;
  stealPercent: number;
}
export interface MemoryMetric {
  header: MetricHeader;
  totalBytes: number;
  usedBytes: number;
  freeBytes: number;
  availableBytes: number;
  cachedBytes: number;
  bufferBytes: number;
  sharedBytes: number;
  slabBytes: number;
  swapTotalBytes: number;
  swapUsedBytes: number;
  swapFreeBytes: number;
  memoryPressure: number;
}
export interface DiskMetric {
  header: MetricHeader;
  device: string;
  filesystem: string;
  mountPoint: string;
  totalBytes: number;
  usedBytes: number;
  availableBytes: number;
  usedPercent: number;
  inodeTotal: number;
  inodeUsed: number;
  readSpeedBps: number;
  writeSpeedBps: number;
  ioWaitPercent: number;
  smartStatus: string | null;
}
export interface NetworkMetric {
  header: MetricHeader;
  interfaceName: string;
  publicIpv4: string;
  publicIpv6: string | null;
  macAddress: string;
  rxBytesPerSec: number;
  txBytesPerSec: number;
  packetLossPercent: number;
  latencyMs: number;
  connectionCount: number;
  establishedCount: number;
}
export interface DockerMetric {
  header: MetricHeader;
  containerId: string;
  containerName: string;
  image: string;
  status: string;
  healthStatus: string;
  cpuPercent: number;
  memoryBytes: number;
  diskBytes: number;
  restartCount: number;
  exitCode: number | null;
  startedAt: string;
}
export interface TunnelMetric {
  header: MetricHeader;
  provider: string;
  domain: string;
  status: string;
  sslActive: boolean;
  latencyMs: number;
  reconnectCount: number;
  lastConnectedAt: string;
}
export interface ServiceMetric {
  header: MetricHeader;
  serviceName: string;
  status: string;
  enabled: boolean;
  activeState: string;
  subState: string;
}
export type Metric =
  | CpuMetric
  | MemoryMetric
  | DiskMetric
  | NetworkMetric
  | DockerMetric
  | TunnelMetric
  | ServiceMetric;
