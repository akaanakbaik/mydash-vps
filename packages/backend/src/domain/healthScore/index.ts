import type { HealthScore, HealthHistory } from '@mydash/shared';

export type { HealthScore, HealthHistory, DomainScore, HealthFactor } from '@mydash/shared';
export { HealthGrade, HealthDomain } from '@mydash/shared';
export type { HealthCalculator, HealthWeightConfig, CategoryScore, HealthCalculationContext } from './services.js';

export interface HealthScoreRepository {
  save(score: HealthScore): Promise<void>;
  findLatest(serverId: string): Promise<HealthScore | null>;
  findHistory(serverId: string, windowMs: number): Promise<HealthHistory[]>;
}
