// Mock dashboard data provider — replace with real API calls later.

export interface ServerInfo {
  hostname: string;
  os: string;
  uptime: string;
  cpuCores: number;
  cpuModel: string;
  totalRam: number;
  usedRam: number;
  totalDisk: number;
  usedDisk: number;
  agentVersion: string;
}

export interface HealthScoreData {
  score: number;
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  trend: 'up' | 'down' | 'stable';
  change1h: number;
  change24h: number;
  factors: { name: string; impact: number; label: string }[];
}

export interface ResourceMetric {
  label: string;
  used: number;
  total: number;
  unit: string;
  percent: number;
  trend: 'up' | 'down' | 'stable';
}

export interface NotificationSummary {
  total: number;
  unread: number;
  failed: number;
  lastDelivery: string;
}

export interface AutomationSummary {
  active: number;
  successRate: number;
  running: number;
  failed: number;
  lastRun: string;
}

export interface Activity {
  id: string;
  type: 'security' | 'automation' | 'notification' | 'github' | 'docker' | 'tunnel' | 'backup' | 'restore';
  message: string;
  timestamp: string;
  severity: 'info' | 'success' | 'warning' | 'error';
}

export interface Alert {
  id: string;
  title: string;
  severity: 'critical' | 'warning' | 'info';
  category: string;
  message: string;
  timestamp: string;
  duration: string;
}

export interface DashboardData {
  server: ServerInfo;
  health: HealthScoreData;
  resources: ResourceMetric[];
  notificationSummary: NotificationSummary;
  automationSummary: AutomationSummary;
  recentActivity: Activity[];
  activeAlerts: Alert[];
  quickActions: { label: string; icon: string; description: string; to: string }[];
}

const now = new Date();
const minutesAgo = (m: number) => new Date(now.getTime() - m * 60000).toISOString();

export function getMockDashboardData(): DashboardData {
  return {
    server: {
      hostname: 'vps-primary-01',
      os: 'Ubuntu 22.04.4 LTS',
      uptime: '24d 13h 42m',
      cpuCores: 4,
      cpuModel: 'AMD EPYC 7713 64-Core',
      totalRam: 8192,
      usedRam: 5120,
      totalDisk: 256000,
      usedDisk: 153600,
      agentVersion: '0.1.0',
    },
    health: {
      score: 87,
      grade: 'B',
      trend: 'up',
      change1h: 3,
      change24h: -5,
      factors: [
        { name: 'cpu', impact: -4, label: 'CPU Stability' },
        { name: 'tunnel', impact: -2, label: 'Tunnel Availability' },
        { name: 'memory', impact: 1, label: 'Memory Usage' },
        { name: 'disk', impact: -3, label: 'Disk Space' },
      ],
    },
    resources: [
      { label: 'CPU', used: 42, total: 100, unit: '%', percent: 42, trend: 'stable' },
      { label: 'RAM', used: 5120, total: 8192, unit: 'MB', percent: 62.5, trend: 'down' },
      { label: 'Disk', used: 153600, total: 256000, unit: 'MB', percent: 60, trend: 'up' },
      { label: 'Bandwidth', used: 850, total: 2000, unit: 'Mbps', percent: 42.5, trend: 'stable' },
    ],
    notificationSummary: {
      total: 1284,
      unread: 23,
      failed: 2,
      lastDelivery: minutesAgo(3),
    },
    automationSummary: {
      active: 12,
      successRate: 94.7,
      running: 3,
      failed: 1,
      lastRun: minutesAgo(1),
    },
    recentActivity: [
      { id: '1', type: 'tunnel', message: 'Tunnel reconnected after brief interruption', timestamp: minutesAgo(2), severity: 'warning' },
      { id: '2', type: 'automation', message: 'Weekly backup completed successfully', timestamp: minutesAgo(5), severity: 'success' },
      { id: '3', type: 'notification', message: 'CPU threshold warning sent to Telegram', timestamp: minutesAgo(8), severity: 'info' },
      { id: '4', type: 'github', message: 'Deployment workflow triggered for main', timestamp: minutesAgo(12), severity: 'info' },
      { id: '5', type: 'security', message: 'New login from 192.168.1.100', timestamp: minutesAgo(15), severity: 'warning' },
      { id: '6', type: 'docker', message: 'Container nginx-proxy restarted', timestamp: minutesAgo(20), severity: 'success' },
      { id: '7', type: 'backup', message: 'Database backup completed (2.4 GB)', timestamp: minutesAgo(30), severity: 'success' },
      { id: '8', type: 'automation', message: 'Disk cleanup automation failed — disk nearly full', timestamp: minutesAgo(45), severity: 'error' },
    ],
    activeAlerts: [
      { id: 'a1', title: 'Disk Usage Critical', severity: 'critical', category: 'Storage', message: 'Root partition is at 92% capacity. Estimated 5 days until full.', timestamp: minutesAgo(15), duration: '15m' },
      { id: 'a2', title: 'Memory Pressure', severity: 'warning', category: 'System', message: 'Available memory below 25% threshold for 10 minutes.', timestamp: minutesAgo(30), duration: '30m' },
      { id: 'a3', title: 'Tunnel Instability', severity: 'warning', category: 'Network', message: 'Tunnel reconnected 3 times in the last hour.', timestamp: minutesAgo(45), duration: '1h' },
      { id: 'a4', title: 'Automation Failure', severity: 'info', category: 'Automation', message: 'Nightly backup automation failed, will retry in 30 minutes.', timestamp: minutesAgo(60), duration: '1h 15m' },
    ],
    quickActions: [
      { label: 'New Backup', icon: 'HardDrive', description: 'Create manual backup', to: '/backup' },
      { label: 'Restart Tunnel', icon: 'RefreshCw', description: 'Restart tunnel connection', to: '/tunnel' },
      { label: 'Run Script', icon: 'Terminal', description: 'Execute custom script', to: '/automation' },
      { label: 'Check Logs', icon: 'FileText', description: 'View system logs', to: '/monitoring' },
    ],
  };
}

export function getMockActivity(): Activity[] {
  return getMockDashboardData().recentActivity;
}

export function getMockAlerts(): Alert[] {
  return getMockDashboardData().activeAlerts;
}
