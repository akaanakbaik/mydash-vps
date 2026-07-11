import type { ConditionEngine, EvaluateConditionResult, ConditionEvaluationContext } from '../../domain/automation/services.js';
import type { AutomationCondition, ExecutionContext } from '../../domain/automation/valueObjects.js';
import type { CompositeCondition } from '@mydash/shared';
import { ConditionOperator, CompositeOperator } from '@mydash/shared';
function safeString(val: unknown): string {
  if (typeof val === 'string') return val;
  if (val === null || val === undefined) return '';
  return JSON.stringify(val);
}
export class ConditionEngineImpl implements ConditionEngine {
  async evaluateConditions(
    conditions: AutomationCondition[],
    composite: CompositeCondition | null,
    context: ExecutionContext,
    engineContext: ConditionEvaluationContext,
  ): Promise<EvaluateConditionResult> {
    if (composite) {
      return this.evaluateComposite(composite, context, engineContext);
    }
    if (conditions.length === 0) {
      return { satisfied: true, confidence: 100, reason: 'no conditions to evaluate' };
    }
    for (const condition of conditions) {
      const result = await this.evaluateSingleCondition(condition, context, engineContext);
      if (!result.satisfied) {
        return { satisfied: false, confidence: result.confidence, reason: result.reason };
      }
    }
    return { satisfied: true, confidence: 100, reason: 'all conditions satisfied' };
  }
  evaluateSingleCondition(
    condition: AutomationCondition,
    _context: ExecutionContext,
    engineContext: ConditionEvaluationContext,
  ): Promise<EvaluateConditionResult> {
    const operator = condition.operator;
    const fieldValue = this.resolveFieldValue(condition.field, engineContext);
    if (fieldValue === undefined) {
      return Promise.resolve({ satisfied: false, confidence: 80, reason: `field '${condition.field}' not available` });
    }
    const satisfied = this.applyOperator(operator, fieldValue, condition.value);
    const strValue = safeString(condition.value);
    const strField = safeString(fieldValue);
    const reason = satisfied
      ? `condition '${condition.field} ${operator} ${strValue}' satisfied`
      : `condition '${condition.field} ${operator} ${strValue}' not satisfied (value: ${strField})`;
    return Promise.resolve({ satisfied, confidence: 90, reason });
  }
  async evaluateComposite(
    composite: CompositeCondition,
    context: ExecutionContext,
    engineContext: ConditionEvaluationContext,
  ): Promise<EvaluateConditionResult> {
    if (composite.operator === CompositeOperator.NOT) {
      if (composite.conditions.length > 0) {
        const result = await this.evaluateSingleCondition(composite.conditions[0], context, engineContext);
        const satisfied = !result.satisfied;
        return { satisfied, confidence: result.confidence, reason: satisfied ? 'NOT condition satisfied' : 'NOT condition not satisfied' };
      }
      if (composite.subConditions.length > 0) {
        const result = await this.evaluateComposite(composite.subConditions[0], context, engineContext);
        const satisfied = !result.satisfied;
        return { satisfied, confidence: result.confidence, reason: satisfied ? 'NOT composite condition satisfied' : 'NOT composite condition not satisfied' };
      }
      return { satisfied: true, confidence: 100, reason: 'empty NOT condition' };
    }
    const conditionResults = await Promise.all(
      composite.conditions.map((c) => this.evaluateSingleCondition(c, context, engineContext)),
    );
    const subResults = await Promise.all(
      composite.subConditions.map((sc) => this.evaluateComposite(sc, context, engineContext)),
    );
    const allResults = [...conditionResults, ...subResults];
    const minConfidence = Math.min(...allResults.map((r) => r.confidence));
    if (composite.operator === CompositeOperator.AND) {
      const allSatisfied = allResults.every((r) => r.satisfied);
      const failedReasons = allResults.filter((r) => !r.satisfied).map((r) => r.reason);
      return {
        satisfied: allSatisfied,
        confidence: minConfidence,
        reason: allSatisfied ? 'AND condition satisfied' : `AND condition failed: ${failedReasons.join('; ')}`,
      };
    }
    const anySatisfied = allResults.some((r) => r.satisfied);
    return {
      satisfied: anySatisfied,
      confidence: minConfidence,
      reason: anySatisfied ? 'OR condition satisfied' : 'OR condition not satisfied',
    };
  }
  private resolveFieldValue(field: string, ctx: ConditionEvaluationContext): unknown {
    if (field.startsWith('metric.')) {
      const metricKey = field.slice(7);
      return this.resolveNested(ctx.metrics, metricKey);
    }
    if (field === 'healthScore') return ctx.healthScore;
    if (field === 'healthGrade') return ctx.healthGrade;
    if (field.startsWith('anomaly.')) {
      const anomalyField = field.slice(8);
      if (anomalyField === 'count') return ctx.anomalies.length;
      if (anomalyField === 'exists') return ctx.anomalies.length > 0;
    }
    if (field.startsWith('previous.')) {
      if (field === 'previous.executionCount') return ctx.previousExecutions.length;
      if (field === 'previous.lastStatus' && ctx.previousExecutions.length > 0) {
        return ctx.previousExecutions[0].status;
      }
    }
    return undefined;
  }
  private resolveNested(obj: Record<string, unknown>, path: string): unknown {
    const keys = path.split('.');
    let current: unknown = obj;
    for (const key of keys) {
      if (current === null || current === undefined || typeof current !== 'object') return undefined;
      current = (current as Record<string, unknown>)[key];
    }
    return current;
  }
  private applyOperator(operator: ConditionOperator, fieldValue: unknown, threshold: unknown): boolean {
    switch (operator) {
      case ConditionOperator.Equals:
        return fieldValue === threshold;
      case ConditionOperator.NotEquals:
        return fieldValue !== threshold;
      case ConditionOperator.GreaterThan:
        return this.compareNumbers(fieldValue, threshold, (a, b) => a > b);
      case ConditionOperator.GreaterThanOrEqual:
        return this.compareNumbers(fieldValue, threshold, (a, b) => a >= b);
      case ConditionOperator.LessThan:
        return this.compareNumbers(fieldValue, threshold, (a, b) => a < b);
      case ConditionOperator.LessThanOrEqual:
        return this.compareNumbers(fieldValue, threshold, (a, b) => a <= b);
      case ConditionOperator.Contains:
        return this.stringContains(fieldValue, threshold);
      case ConditionOperator.NotContains:
        return !this.stringContains(fieldValue, threshold);
      case ConditionOperator.StartsWith:
        return this.stringStartsWith(fieldValue, threshold);
      case ConditionOperator.EndsWith:
        return this.stringEndsWith(fieldValue, threshold);
      case ConditionOperator.IsTrue:
        return fieldValue === true;
      case ConditionOperator.IsFalse:
        return fieldValue === false;
      case ConditionOperator.IsPresent:
        return fieldValue !== null && fieldValue !== undefined;
      case ConditionOperator.IsAbsent:
        return fieldValue === null || fieldValue === undefined;
      case ConditionOperator.InRange:
        return this.isInRange(fieldValue, threshold);
      case ConditionOperator.Matches:
        return this.matchesPattern(fieldValue, threshold);
      default:
        return false;
    }
  }
  private compareNumbers(
    fieldValue: unknown,
    threshold: unknown,
    compare: (a: number, b: number) => boolean,
  ): boolean {
    const a = typeof fieldValue === 'number' ? fieldValue : Number(fieldValue);
    const b = typeof threshold === 'number' ? threshold : Number(threshold);
    if (isNaN(a) || isNaN(b)) return false;
    return compare(a, b);
  }
  private stringContains(fieldValue: unknown, threshold: unknown): boolean {
    if (typeof fieldValue !== 'string' || typeof threshold !== 'string') return false;
    return fieldValue.includes(threshold);
  }
  private stringStartsWith(fieldValue: unknown, threshold: unknown): boolean {
    if (typeof fieldValue !== 'string' || typeof threshold !== 'string') return false;
    return fieldValue.startsWith(threshold);
  }
  private stringEndsWith(fieldValue: unknown, threshold: unknown): boolean {
    if (typeof fieldValue !== 'string' || typeof threshold !== 'string') return false;
    return fieldValue.endsWith(threshold);
  }
  private isInRange(fieldValue: unknown, threshold: unknown): boolean {
    if (!Array.isArray(threshold) || threshold.length !== 2) return false;
    const val = typeof fieldValue === 'number' ? fieldValue : Number(fieldValue);
    const min = Number(threshold[0]);
    const max = Number(threshold[1]);
    if (isNaN(val) || isNaN(min) || isNaN(max)) return false;
    return val >= min && val <= max;
  }
  private matchesPattern(fieldValue: unknown, threshold: unknown): boolean {
    if (typeof fieldValue !== 'string' || typeof threshold !== 'string') return false;
    try {
      return new RegExp(threshold).test(fieldValue);
    } catch {
      return false;
    }
  }
}
