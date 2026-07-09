import type { Result, HealthScore } from '@mydash/shared';
import type { AppError } from '@mydash/shared';

export interface AnalyticsService {
  calculateCpuSummary(serverId: string, windowSeconds: number): Promise<Result<CpuSummary, AppError>>;
  calculateMemorySummary(serverId: string, windowSeconds: number): Promise<Result<MemorySummary, AppError>>;
  calculateDiskSummary(serverId: string, windowSeconds: number): Promise<Result<DiskSummary, AppError>>;
  calculateHealthScore(serverId: string): Promise<Result<HealthScore, AppError>>;
  detectAnomalies(serverId: string): Promise<Result<AnomalyResult[], AppError>>;
}

export interface CpuSummary {
  average: number;
  min: number;
  max: number;
  median: number;
  standardDeviation: number;
}

export interface MemorySummary {
  averageUsedBytes: number;
  averageAvailableBytes: number;
  peakUsedBytes: number;
}

export interface DiskSummary {
  averageUsedPercent: number;
  growthRateBytesPerDay: number;
  estimatedFullDays: number;
}

export interface AnomalyResult {
  metricType: string;
  severity: string;
  description: string;
  confidence: number;
}
