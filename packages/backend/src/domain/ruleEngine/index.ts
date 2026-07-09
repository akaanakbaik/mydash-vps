import type { Rule } from '@mydash/shared';

export type { Rule, CompositeRule, RuleEvaluationResult } from '@mydash/shared';
export { RuleStatus, CompositeOperator } from '@mydash/shared';

export interface RuleRepository {
  findById(id: string): Promise<Rule | null>;
  findByWorkspaceId(workspaceId: string): Promise<Rule[]>;
  save(rule: Rule): Promise<void>;
  delete(id: string): Promise<void>;
}
