import { apiClient } from '../api/client.js';
import type { PaginationParams } from '../api/types.js';

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

export const healthRepository = {
  getScore: () =>
    apiClient.get<HealthScoreData>('/health'),
  getHistory: (params?: PaginationParams) =>
    apiClient.get<HealthHistoryRow[]>('/health/history', { params: params as Record<string, string | number | boolean | undefined> }),
};
