import { apiClient } from '../api/client.js';

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

export interface HealthFactor {
  name: string;
  label: string;
  impact: number;
}

export interface HealthData {
  score: number;
  grade: string;
  trend: 'up' | 'down' | 'stable';
  factors: HealthFactor[];
}

export interface ResourceMetric {
  label: string;
  used: number;
  total: number;
  percent: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
}

export interface NotificationSummaryData {
  total: number;
  unread: number;
  failed: number;
  lastDelivery: string;
}

export interface AutomationSummaryData {
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

export interface QuickAction {
  label: string;
  icon: string;
  description: string;
  to: string;
}

export interface DashboardResponse {
  server: ServerInfo;
  health: HealthData;
  resources: ResourceMetric[];
  notificationSummary: NotificationSummaryData;
  automationSummary: AutomationSummaryData;
  activeAlerts: Alert[];
  recentActivity: Activity[];
  quickActions: QuickAction[];
}

export const overviewRepository = {
  getDashboard: () =>
    apiClient.get<DashboardResponse>('/dashboard'),
};
