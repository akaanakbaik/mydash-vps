import type { HealthScore, HealthFactor } from '@mydash/shared';
export interface HealthWeightConfig {
  cpu: number;
  memory: number;
  disk: number;
  network: number;
  docker: number;
  tunnel: number;
  service: number;
}
export interface HealthCalculator {
  calculate(serverId: string, workspaceId: string): Promise<HealthScore>;
  getDefaultWeights(): HealthWeightConfig;
}
export interface CategoryScore {
  domain: string;
  score: number;
  weight: number;
  confidence: number;
  factors: HealthFactor[];
  penalty: number;
  bonus: number;
}
export interface HealthCalculationContext {
  serverId: string;
  workspaceId: string;
  categoryScores: CategoryScore[];
  overallScore: number;
  confidence: number;
  trend: number;
  grade: string;
}
