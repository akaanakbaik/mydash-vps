// Mock health score data provider — replace with real Health Score Engine later.

export type HealthGrade = 'A+' | 'A' | 'B' | 'C' | 'D' | 'F';
export type HealthCategoryLabel = 'excellent' | 'good' | 'warning' | 'critical';
export type TrendDirection = 'up' | 'down' | 'stable';

export interface OverallHealth {
  score: number;
  grade: HealthGrade;
  category: HealthCategoryLabel;
  trend: TrendDirection;
  change1h: number;
  change24h: number;
}

export interface CategoryScore {
  name: string;
  score: number;
  grade: HealthGrade;
  maxScore: number;
  impact: number;
  status: 'healthy' | 'warning' | 'critical' | 'inactive';
  description: string;
}

export interface Penalty {
  factor: string;
  points: number;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface RecoveryStatus {
  state: 'stable' | 'recovering' | 'degraded' | 'critical';
  progress: number;
  estimatedRecovery: string;
  lastIncident: string;
  duration: string;
}

export interface HealthTimelinePoint {
  timestamp: string;
  score: number;
}

export interface HealthHistoryRow {
  id: number;
  timestamp: string;
  score: number;
  grade: HealthGrade;
  change: number;
  reason: string;
  duration: string;
}

export interface HealthScoreData {
  overall: OverallHealth;
  categories: CategoryScore[];
  penalties: Penalty[];
  recovery: RecoveryStatus;
  confidence: number;
  grade: HealthGrade;
  timeline: HealthTimelinePoint[];
  history: HealthHistoryRow[];
  lastUpdated: string;
}

function randomFloat(min: number, max: number, decimals = 1): number {
  return Math.round((min + Math.random() * (max - min)) * Math.pow(10, decimals)) / Math.pow(10, decimals);
}

function minutesAgo(m: number): string {
  return new Date(Date.now() - m * 60000).toISOString();
}

export function getMockHealthScoreData(): HealthScoreData {
  return {
    overall: {
      score: 82,
      grade: 'B',
      category: 'good',
      trend: 'up',
      change1h: 3,
      change24h: -5,
    },
    categories: [
      { name: 'CPU', score: 78, grade: 'B', maxScore: 100, impact: -4, status: 'healthy', description: 'Average CPU usage 42%, spikes observed during backup window' },
      { name: 'Memory', score: 85, grade: 'A', maxScore: 100, impact: 1, status: 'healthy', description: 'Memory usage stable at 62%, swap usage minimal' },
      { name: 'Disk', score: 65, grade: 'C', maxScore: 100, impact: -3, status: 'warning', description: 'Root partition at 60%, estimated 45 days until full' },
      { name: 'Network', score: 72, grade: 'B', maxScore: 100, impact: -2, status: 'warning', description: 'Latency spikes observed during peak hours' },
      { name: 'Docker', score: 90, grade: 'A', maxScore: 100, impact: 2, status: 'healthy', description: '6 of 8 containers running normally' },
      { name: 'Tunnel', score: 88, grade: 'A', maxScore: 100, impact: 1, status: 'healthy', description: 'Tunnel stable, 2 reconnects in 24h' },
      { name: 'Service', score: 92, grade: 'A', maxScore: 100, impact: 3, status: 'healthy', description: 'All critical services running' },
    ],
    penalties: [
      { factor: 'CPU Stability', points: -4, description: 'CPU above 80% for 15+ minutes during backup', severity: 'medium' },
      { factor: 'Disk Usage', points: -3, description: 'Disk usage trend increasing 2% per week', severity: 'medium' },
      { factor: 'Network Latency', points: -2, description: 'Average latency increased 15ms in last hour', severity: 'low' },
      { factor: 'Memory Cache', points: 1, description: 'Bonus for stable memory with safe cache levels', severity: 'low' },
      { factor: 'Docker Health', points: 2, description: 'Bonus for all critical containers healthy', severity: 'low' },
      { factor: 'Service Uptime', points: 3, description: 'Bonus for 100% critical service uptime in 24h', severity: 'low' },
    ],
    recovery: {
      state: 'stable',
      progress: 100,
      estimatedRecovery: 'N/A',
      lastIncident: minutesAgo(1440),
      duration: '12m',
    },
    confidence: 87,
    grade: 'B',
    timeline: Array.from({ length: 168 }).map((_, i) => ({
      timestamp: minutesAgo(168 - i),
      score: Math.round(75 + Math.sin(i * 0.05) * 10 + Math.sin(i * 0.02) * 5 + randomFloat(-3, 3, 0)),
    })),
    history: [
      { id: 1, timestamp: minutesAgo(60), score: 79, grade: 'B', change: -3, reason: 'CPU spike during backup operation', duration: '15m' },
      { id: 2, timestamp: minutesAgo(120), score: 82, grade: 'B', change: 2, reason: 'Recovery from network latency spike', duration: '30m' },
      { id: 3, timestamp: minutesAgo(240), score: 80, grade: 'B', change: -5, reason: 'Network latency increase due to peering issue', duration: '45m' },
      { id: 4, timestamp: minutesAgo(480), score: 85, grade: 'A', change: 3, reason: 'Memory pressure resolved', duration: '1h' },
      { id: 5, timestamp: minutesAgo(720), score: 82, grade: 'B', change: -2, reason: 'Disk usage increase', duration: '2h' },
      { id: 6, timestamp: minutesAgo(1440), score: 84, grade: 'A', change: 4, reason: 'Docker container health restored', duration: '30m' },
      { id: 7, timestamp: minutesAgo(2880), score: 80, grade: 'B', change: -6, reason: 'Tunnel reconnection event', duration: '2m' },
      { id: 8, timestamp: minutesAgo(4320), score: 86, grade: 'A', change: 1, reason: 'System stabilized after maintenance', duration: '4h' },
      { id: 9, timestamp: minutesAgo(5760), score: 85, grade: 'A', change: 0, reason: 'Normal operation', duration: '6h' },
      { id: 10, timestamp: minutesAgo(10080), score: 87, grade: 'A', change: 3, reason: 'Service update completed', duration: '2h' },
    ],
    lastUpdated: minutesAgo(0.5),
  };
}
