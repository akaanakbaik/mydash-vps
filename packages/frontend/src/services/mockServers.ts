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
function minutesAgo(m: number): string {
  return new Date(Date.now() - m * 60000).toISOString();
}
function daysAgo(d: number): string {
  return new Date(Date.now() - d * 86400000).toISOString();
}
export function getMockServersData(): ServerData {
  const servers: Server[] = [
    {
      id: 'srv-1', name: 'VPS Primary', hostname: 'vps-primary-01', ipv4: '203.0.113.42', ipv6: '2001:db8::1',
      os: 'Ubuntu 22.04 LTS', status: 'online', tags: ['production', 'web', 'database'],
      healthScore: 87, cpuModel: 'AMD EPYC 7713', cpuCores: 8,
      ramTotal: 16384, ramUsed: 10240, diskTotal: 512000, diskUsed: 307200,
      bandwidthTotal: 10000, bandwidthUsed: 4250,
      cpuUsage: 42, ramUsage: 62.5, diskUsage: 60,
      location: 'US East', datacenter: 'NYC1', region: 'us-east-1',
      uptime: '24d 13h 42m', lastSeen: minutesAgo(0.5), agentVersion: '1.2.0', created: daysAgo(365),
    },
    {
      id: 'srv-2', name: 'VPS Secondary', hostname: 'vps-secondary-02', ipv4: '203.0.113.84', ipv6: '2001:db8::2',
      os: 'Debian 12', status: 'online', tags: ['production', 'worker'],
      healthScore: 92, cpuModel: 'Intel Xeon Platinum', cpuCores: 4,
      ramTotal: 8192, ramUsed: 4096, diskTotal: 256000, diskUsed: 128000,
      bandwidthTotal: 5000, bandwidthUsed: 1850,
      cpuUsage: 28, ramUsage: 50, diskUsage: 50,
      location: 'Europe West', datacenter: 'AMS1', region: 'eu-west-1',
      uptime: '18d 6h 12m', lastSeen: minutesAgo(1), agentVersion: '1.2.0', created: daysAgo(180),
    },
    {
      id: 'srv-3', name: 'Dev Environment', hostname: 'dev-sandbox-01', ipv4: '203.0.113.126', ipv6: '2001:db8::3',
      os: 'Ubuntu 24.04 LTS', status: 'online', tags: ['development', 'testing'],
      healthScore: 78, cpuModel: 'AMD Ryzen 9', cpuCores: 16,
      ramTotal: 32768, ramUsed: 24576, diskTotal: 1024000, diskUsed: 409600,
      bandwidthTotal: 20000, bandwidthUsed: 8200,
      cpuUsage: 65, ramUsage: 75, diskUsage: 40,
      location: 'US West', datacenter: 'SFO1', region: 'us-west-1',
      uptime: '5d 2h 30m', lastSeen: minutesAgo(2), agentVersion: '1.1.0', created: daysAgo(90),
    },
    {
      id: 'srv-4', name: 'Staging Server', hostname: 'staging-01', ipv4: '203.0.113.168', ipv6: '2001:db8::4',
      os: 'Debian 11', status: 'degraded', tags: ['staging', 'web'],
      healthScore: 62, cpuModel: 'Intel Xeon Gold', cpuCores: 4,
      ramTotal: 8192, ramUsed: 7168, diskTotal: 256000, diskUsed: 204800,
      bandwidthTotal: 5000, bandwidthUsed: 3800,
      cpuUsage: 88, ramUsage: 87.5, diskUsage: 80,
      location: 'Europe West', datacenter: 'FRA1', region: 'eu-central-1',
      uptime: '2d 8h 15m', lastSeen: minutesAgo(5), agentVersion: '1.0.0', created: daysAgo(60),
    },
    {
      id: 'srv-5', name: 'DB Replica', hostname: 'db-replica-01', ipv4: '203.0.113.210', ipv6: '2001:db8::5',
      os: 'Ubuntu 22.04 LTS', status: 'online', tags: ['production', 'database'],
      healthScore: 95, cpuModel: 'AMD EPYC 7713', cpuCores: 16,
      ramTotal: 65536, ramUsed: 32768, diskTotal: 2048000, diskUsed: 1024000,
      bandwidthTotal: 25000, bandwidthUsed: 12500,
      cpuUsage: 35, ramUsage: 50, diskUsage: 50,
      location: 'US East', datacenter: 'NYC1', region: 'us-east-1',
      uptime: '60d 2h 0m', lastSeen: minutesAgo(0.5), agentVersion: '1.2.0', created: daysAgo(730),
    },
    {
      id: 'srv-6', name: 'Cache Node', hostname: 'cache-01', ipv4: '203.0.113.252', ipv6: '2001:db8::6',
      os: 'Alpine Linux 3.19', status: 'online', tags: ['production', 'cache', 'redis'],
      healthScore: 90, cpuModel: 'Intel Xeon Platinum', cpuCores: 4,
      ramTotal: 16384, ramUsed: 12288, diskTotal: 128000, diskUsed: 32000,
      bandwidthTotal: 10000, bandwidthUsed: 6800,
      cpuUsage: 22, ramUsage: 75, diskUsage: 25,
      location: 'Asia Pacific', datacenter: 'SGP1', region: 'ap-southeast-1',
      uptime: '45d 10h 20m', lastSeen: minutesAgo(0.5), agentVersion: '1.2.0', created: daysAgo(365),
    },
    {
      id: 'srv-7', name: 'Monitoring Stack', hostname: 'monitor-01', ipv4: '203.0.113.41', ipv6: '2001:db8::7',
      os: 'Ubuntu 22.04 LTS', status: 'maintenance', tags: ['monitoring', 'observability'],
      healthScore: 70, cpuModel: 'AMD Ryzen 7', cpuCores: 8,
      ramTotal: 16384, ramUsed: 8192, diskTotal: 512000, diskUsed: 200000,
      bandwidthTotal: 5000, bandwidthUsed: 1200,
      cpuUsage: 45, ramUsage: 50, diskUsage: 39,
      location: 'US East', datacenter: 'NYC1', region: 'us-east-1',
      uptime: '0d 0h 0m', lastSeen: minutesAgo(30), agentVersion: '1.2.0', created: daysAgo(200),
    },
    {
      id: 'srv-8', name: 'Legacy Server', hostname: 'legacy-01', ipv4: '10.0.0.1', ipv6: 'fd00::1',
      os: 'CentOS 7', status: 'offline', tags: ['legacy', 'deprecated'],
      healthScore: 0, cpuModel: 'Intel Xeon E5', cpuCores: 2,
      ramTotal: 4096, ramUsed: 0, diskTotal: 102400, diskUsed: 0,
      bandwidthTotal: 1000, bandwidthUsed: 0,
      cpuUsage: 0, ramUsage: 0, diskUsage: 0,
      location: 'US East', datacenter: 'NYC1', region: 'us-east-1',
      uptime: '0d 0h 0m', lastSeen: daysAgo(14), agentVersion: '0.9.0', created: daysAgo(1095),
    },
  ];
  return {
    servers,
    totalCount: servers.length,
    onlineCount: servers.filter((s) => s.status === 'online').length,
    offlineCount: servers.filter((s) => s.status === 'offline').length,
    degradedCount: servers.filter((s) => s.status === 'degraded').length,
    avgHealthScore: Math.round(servers.filter((s) => s.status !== 'offline').reduce((a, s) => a + s.healthScore, 0) / servers.filter((s) => s.status !== 'offline').length),
    totalCores: servers.reduce((a, s) => a + s.cpuCores, 0),
    totalRam: servers.reduce((a, s) => a + s.ramTotal, 0),
    totalDisk: servers.reduce((a, s) => a + s.diskTotal, 0),
    tagOptions: [
      { id: 'production', label: 'Production' },
      { id: 'development', label: 'Development' },
      { id: 'staging', label: 'Staging' },
      { id: 'database', label: 'Database' },
      { id: 'cache', label: 'Cache' },
      { id: 'worker', label: 'Worker' },
      { id: 'web', label: 'Web' },
      { id: 'monitoring', label: 'Monitoring' },
      { id: 'legacy', label: 'Legacy' },
    ],
    statusOptions: [
      { id: 'online', label: 'Online' },
      { id: 'offline', label: 'Offline' },
      { id: 'degraded', label: 'Degraded' },
      { id: 'maintenance', label: 'Maintenance' },
    ],
  };
}
