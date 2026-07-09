import type { WorkflowEngine, RecoveryAction } from '../../domain/automation/services.js';
import type { AutomationDefinition, AutomationExecution, ExecutionContext, ExecutionPlan, ExecutionStepPlan } from '../../domain/automation/valueObjects.js';
import { AutomationStatus, Priority } from '@mydash/shared';
import { calculateBackoffDelay } from '../utilities.js';
export class WorkflowEngineImpl implements WorkflowEngine {

  createExecutionPlan(
    definition: AutomationDefinition,
    context: ExecutionContext,
  ): Promise<ExecutionPlan> {
    const steps: ExecutionStepPlan[] = definition.actions.map((action, index) => ({
      action,
      stepIndex: index,
      estimatedDurationMs: action.timeoutSeconds * 1000,
      hasRollback: action.rollbackAction !== null,
    }));

    const totalEstimateMs = steps.reduce((sum, s) => sum + s.estimatedDurationMs, 0);

    return Promise.resolve({
      executionId: context.executionId,
      definition,
      steps,
      totalDurationEstimateMs: totalEstimateMs,
    });
  }

  executeWorkflow(
    _definition: AutomationDefinition,
    context: ExecutionContext,
  ): Promise<AutomationExecution> {
    const execution: AutomationExecution = {
      id: context.executionId,
      workspaceId: context.workspaceId,
      serverId: context.serverId,
      automationId: context.automationId,
      triggerEvent: context.triggerEvent,
      status: AutomationStatus.Running,
      priority: Priority.Normal,
      retryCount: context.retryCount,
      maxRetry: context.maxRetry,
      startedAt: context.startedAt,
      completedAt: null,
      durationMs: 0,
      result: null,
      errorDetails: null,
      correlationId: context.correlationId,
      createdAt: context.startedAt,
    };

    return Promise.resolve(execution);
  }

  handleRecovery(
    execution: AutomationExecution,
    error: string,
    retryCount: number,
    maxRetry: number,
  ): Promise<RecoveryAction> {
    if (retryCount < maxRetry) {
      const delayMs = this.calculateBackoff(retryCount);
      return Promise.resolve({
        type: 'retry',
        delayMs,
        reason: `retrying after failure: ${error} (attempt ${String(retryCount + 1)}/${String(maxRetry)})`,
      });
    }

    execution.status = AutomationStatus.Failed;
    execution.completedAt = new Date().toISOString();
    execution.errorDetails = error;

    return Promise.resolve({
      type: 'abort',
      delayMs: 0,
      reason: `max retries (${String(maxRetry)}) exceeded: ${error}`,
    });
  }

  shouldCooldown(
    definition: AutomationDefinition,
    recentExecutions: AutomationExecution[],
  ): { cooldown: boolean; remainingMs: number } {
    if (definition.cooldownSeconds <= 0 || recentExecutions.length === 0) {
      return { cooldown: false, remainingMs: 0 };
    }

    const latestExecution = recentExecutions[0];
    if (!latestExecution.completedAt && !latestExecution.startedAt) {
      return { cooldown: false, remainingMs: 0 };
    }

    const latestTimestamp = latestExecution.completedAt || latestExecution.startedAt || '';
    const elapsed = Date.now() - new Date(latestTimestamp).getTime();
    const cooldownMs = definition.cooldownSeconds * 1000;
    const remaining = cooldownMs - elapsed;

    if (remaining > 0) {
      return { cooldown: true, remainingMs: remaining };
    }

    return { cooldown: false, remainingMs: 0 };
  }

  private calculateBackoff(attempt: number): number {
    return calculateBackoffDelay(attempt);
  }
}
