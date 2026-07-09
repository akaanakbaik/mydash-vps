// Mock monitoring data provider — replace with real API calls later.

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

const now = new Date();
const ago = (m: number) => new Date(now.getTime() - m * 60000).toISOString();
const later = (m: number) => new Date(now.getTime() + m * 60000).toISOString();

export function getMockMonitoringData(): MonitoringData {
  return {
    cpu: {
      model: 'AMD EPYC 7713 64-Core Processor',
      vendor: 'AMD',
      cores: 4,
      threads: 8,
      clockMin: 1.5,
      clockMax: 3.7,
      clockCurrent: 2.4,
      loadAverage: 1.8,
      usagePercent: 42,
      temperature: 68,
      perCore: [38, 45, 41, 44],
    },
    memory: {
      total: 8192,
      used: 5120,
      available: 3072,
      cached: 1024,
      buffered: 512,
      swapTotal: 2048,
      swapUsed: 128,
      usagePercent: 62.5,
    },
    disks: [
      { device: '/dev/sda1', mount: '/', filesystem: 'ext4', total: 256000, used: 153600, available: 102400, usagePercent: 60, inodeUsage: 12, readSpeed: 180, writeSpeed: 120 },
      { device: '/dev/sdb1', mount: '/data', filesystem: 'xfs', total: 512000, used: 204800, available: 307200, usagePercent: 40, inodeUsage: 8, readSpeed: 220, writeSpeed: 160 },
    ],
    network: {
      interface: 'eth0',
      publicIpv4: '203.0.113.42',
      publicIpv6: '2001:db8::1',
      rxBytes: 1_024_000_000_000,
      txBytes: 512_000_000_000,
      rxSpeed: 45.2,
      txSpeed: 12.8,
      packetLoss: 0.01,
      latency: 3.2,
      connections: 127,
    },
    docker: {
      containerCount: 8,
      running: 6,
      stopped: 2,
      cpuPercent: 18,
      memoryPercent: 35,
      restartCount: 3,
      health: 'healthy',
    },
    tunnel: {
      provider: 'Cloudflare Tunnel',
      status: 'connected',
      domain: 'mydash.example.com',
      ssl: true,
      latency: 5.1,
      reconnectCount: 2,
      uptime: '14d 6h 32m',
    },
    services: [
      { name: 'nginx', status: 'running', cpu: 2.4, memory: 128, uptime: '24d 13h', port: 80 },
      { name: 'postgresql', status: 'running', cpu: 8.1, memory: 512, uptime: '24d 12h', port: 5432 },
      { name: 'redis', status: 'running', cpu: 1.2, memory: 64, uptime: '24d 10h', port: 6379 },
      { name: 'mydash-agent', status: 'running', cpu: 3.5, memory: 256, uptime: '24d 8h', port: 9001 },
      { name: 'prometheus', status: 'stopped', cpu: 0, memory: 0, uptime: '0s', port: 9090 },
      { name: 'grafana', status: 'running', cpu: 5.2, memory: 384, uptime: '20d 4h', port: 3000 },
    ],
    timeline: Array.from({ length: 24 }).map((_, i) => ({
      timestamp: ago(24 - i),
      cpu: 30 + Math.round(Math.sin(i * 0.5) * 15 + Math.random() * 10),
      memory: 55 + Math.round(Math.sin(i * 0.3) * 10 + Math.random() * 5),
      disk: 50 + Math.round(Math.sin(i * 0.2) * 8 + Math.random() * 5),
      network: 35 + Math.round(Math.sin(i * 0.4) * 12 + Math.random() * 8),
    })),
    collection: {
      status: 'success',
      lastUpdated: ago(0.5),
      errorCount: 0,
      errors: [],
      summary: 'All collectors reported successfully. Next collection in 30s.',
      nextCollection: later(0.5),
    },
    categories: [
      { id: 'cpu', label: 'CPU', count: 8 },
      { id: 'memory', label: 'Memory', count: 6 },
      { id: 'disk', label: 'Disk', count: 5 },
      { id: 'network', label: 'Network', count: 7 },
      { id: 'docker', label: 'Docker', count: 4 },
      { id: 'tunnel', label: 'Tunnel', count: 3 },
      { id: 'services', label: 'Services', count: 6 },
    ],
  };
}

export function getMockFilteredMonitoringData(_category: string): MonitoringData {
  return getMockMonitoringData();
}
