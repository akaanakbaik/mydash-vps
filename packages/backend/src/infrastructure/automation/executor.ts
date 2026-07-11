import type { WorkflowExecutor } from '../../domain/automation/services.js';
import type { ActionEngine, WorkflowEngine, AutomationEventPublisher } from '../../domain/automation/services.js';
import type { AutomationDefinition, AutomationExecution, ExecutionContext, ExecutionStep } from '../../domain/automation/valueObjects.js';
import type { AutomationAction } from '@mydash/shared';
import type { AutomationExecutionRepository } from '../../domain/automation/index.js';
import { AutomationStatus } from '@mydash/shared';
import type { Logger } from '../../logging/index.js';
import { calculateBackoffDelay } from '../utilities.js';
export class WorkflowExecutorImpl implements WorkflowExecutor {
  private cancelledExecutions = new Set<string>();
  constructor(
    private readonly actionEngine: ActionEngine,
    private readonly workflowEngine: WorkflowEngine,
    private readonly executionRepo: AutomationExecutionRepository,
    private readonly eventPublisher: AutomationEventPublisher,
    private readonly logger: Logger,
  ) {}
  private executedCorrelationIds = new Set<string>();
  async execute(
    definition: AutomationDefinition,
    context: ExecutionContext,
  ): Promise<AutomationExecution> {
    if (this.executedCorrelationIds.has(context.correlationId)) {
      const existing = await this.executionRepo.findById(context.executionId);
      if (existing) {
        return existing;
      }
    }
    this.executedCorrelationIds.add(context.correlationId);
    const execution = await this.workflowEngine.executeWorkflow(definition, context);
    await this.executionRepo.save(execution);
    await this.eventPublisher.publishWorkflowStarted({
      automationId: context.automationId,
      executionId: context.executionId,
      workspaceId: context.workspaceId,
      serverId: context.serverId,
      status: AutomationStatus.Running,
      actionType: null,
      error: null,
      durationMs: 0,
      correlationId: context.correlationId,
      timestamp: context.startedAt,
    });
    try {
      const plan = await this.workflowEngine.createExecutionPlan(definition, context);
      for (const stepPlan of plan.steps) {
        if (this.cancelledExecutions.has(context.executionId)) {
          execution.status = AutomationStatus.Cancelled;
          execution.completedAt = new Date().toISOString();
          execution.errorDetails = 'execution cancelled';
          await this.executionRepo.save(execution);
          return execution;
        }
        const stepResult = await this.executeSingleStep(
          stepPlan.action,
          context,
          stepPlan.stepIndex,
          execution,
        );
        execution.retryCount = stepResult.retryCount;
        if (!stepResult.success) {
          if (stepPlan.hasRollback) {
            await this.executeRollbackForStep(stepPlan.action, context, stepPlan.stepIndex, execution);
          }
          execution.status = AutomationStatus.Failed;
          execution.completedAt = new Date().toISOString();
          execution.errorDetails = stepResult.error;
          execution.durationMs = Date.now() - new Date(context.startedAt).getTime();
          await this.executionRepo.save(execution);
          await this.eventPublisher.publishWorkflowFailed({
            automationId: context.automationId,
            executionId: context.executionId,
            workspaceId: context.workspaceId,
            serverId: context.serverId,
            status: AutomationStatus.Failed,
            actionType: stepPlan.action.type,
            error: stepResult.error,
            durationMs: execution.durationMs,
            correlationId: context.correlationId,
            timestamp: new Date().toISOString(),
          });
          return execution;
        }
      }
      execution.status = AutomationStatus.Success;
      execution.completedAt = new Date().toISOString();
      execution.result = 'all actions completed successfully';
      execution.durationMs = Date.now() - new Date(context.startedAt).getTime();
      await this.executionRepo.save(execution);
      await this.eventPublisher.publishWorkflowCompleted({
        automationId: context.automationId,
        executionId: context.executionId,
        workspaceId: context.workspaceId,
        serverId: context.serverId,
        status: AutomationStatus.Success,
        actionType: null,
        error: null,
        durationMs: execution.durationMs,
        correlationId: context.correlationId,
        timestamp: new Date().toISOString(),
      });
      return execution;
    } catch (err) {
      const error = err instanceof Error ? err.message : String(err);
      execution.status = AutomationStatus.Failed;
      execution.completedAt = new Date().toISOString();
      execution.errorDetails = error;
      execution.durationMs = Date.now() - new Date(context.startedAt).getTime();
      await this.executionRepo.save(execution);
      await this.eventPublisher.publishWorkflowFailed({
        automationId: context.automationId,
        executionId: context.executionId,
        workspaceId: context.workspaceId,
        serverId: context.serverId,
        status: AutomationStatus.Failed,
        actionType: null,
        error,
        durationMs: execution.durationMs,
        correlationId: context.correlationId,
        timestamp: new Date().toISOString(),
      });
      return execution;
    }
  }
  async cancel(executionId: string): Promise<void> {
    this.cancelledExecutions.add(executionId);
    return Promise.resolve();
  }
  private async executeSingleStep(
    action: AutomationAction,
    context: ExecutionContext,
    stepIndex: number,
    execution: AutomationExecution,
  ): Promise<{
    step: ExecutionStep;
    success: boolean;
    error: string | null;
    retryCount: number;
  }> {
    const stepId = `${context.executionId}-step-${String(stepIndex)}`;
    const step: ExecutionStep = {
      id: stepId,
      executionId: context.executionId,
      stepIndex,
      actionType: action.type,
      status: AutomationStatus.Running,
      startedAt: new Date().toISOString(),
      completedAt: null,
      durationMs: 0,
      result: null,
      errorDetails: null,
      rollbackStatus: null,
    };
    let currentRetry = 0;
    const maxRetry = execution.maxRetry;
    while (currentRetry <= maxRetry) {
      const actionResult = await this.actionEngine.executeAction(action, context);
      if (actionResult.success) {
        const verifyResult = await this.actionEngine.verifyAction(action, context, actionResult);
        if (verifyResult.verified) {
          step.status = AutomationStatus.Success;
          step.completedAt = new Date().toISOString();
          step.durationMs = actionResult.durationMs;
          step.result = JSON.stringify(actionResult.data);
          await this.eventPublisher.publishStepCompleted({
            automationId: context.automationId,
            executionId: context.executionId,
            workspaceId: context.workspaceId,
            serverId: context.serverId,
            status: AutomationStatus.Success,
            actionType: action.type,
            error: null,
            durationMs: actionResult.durationMs,
            correlationId: context.correlationId,
            timestamp: new Date().toISOString(),
          });
          return { step, success: true, error: null, retryCount: currentRetry };
        }
        if (currentRetry < maxRetry) {
          const backoffMs = this.calculateRetryDelay(currentRetry);
          await new Promise((resolve) => setTimeout(resolve, backoffMs));
          currentRetry++;
          continue;
        }
        step.status = AutomationStatus.Failed;
        step.completedAt = new Date().toISOString();
        step.durationMs = actionResult.durationMs;
        step.errorDetails = verifyResult.error ?? 'verification failed';
        await this.eventPublisher.publishStepFailed({
          automationId: context.automationId,
          executionId: context.executionId,
          workspaceId: context.workspaceId,
          serverId: context.serverId,
          status: AutomationStatus.Failed,
          actionType: action.type,
          error: step.errorDetails,
          durationMs: actionResult.durationMs,
          correlationId: context.correlationId,
          timestamp: new Date().toISOString(),
        });
        return { step, success: false, error: step.errorDetails, retryCount: currentRetry };
      }
      if (currentRetry < maxRetry) {
        const backoffMs = this.calculateRetryDelay(currentRetry);
        await new Promise((resolve) => setTimeout(resolve, backoffMs));
        currentRetry++;
        continue;
      }
      step.status = AutomationStatus.Failed;
      step.completedAt = new Date().toISOString();
      step.durationMs = actionResult.durationMs;
      step.errorDetails = actionResult.error;
      await this.eventPublisher.publishStepFailed({
        automationId: context.automationId,
        executionId: context.executionId,
        workspaceId: context.workspaceId,
        serverId: context.serverId,
        status: AutomationStatus.Failed,
        actionType: action.type,
        error: step.errorDetails,
        durationMs: actionResult.durationMs,
        correlationId: context.correlationId,
        timestamp: new Date().toISOString(),
      });
      return { step, success: false, error: step.errorDetails, retryCount: currentRetry };
    }
    return { step, success: false, error: 'max retries exceeded', retryCount: currentRetry };
  }
  private async executeRollbackForStep(
    action: AutomationAction,
    context: ExecutionContext,
    stepIndex: number,
    execution: AutomationExecution,
  ): Promise<void> {
    if (!action.rollbackAction) return;
    this.logger.info('executing rollback', {
      actionType: action.type,
      stepIndex,
      executionId: context.executionId,
    });
    const result = await this.actionEngine.executeRollback(action, context, {
      success: false,
      data: null,
      error: 'rollback triggered',
      durationMs: 0,
      rollbackRequired: true,
    });
    if (!result.success) {
      this.logger.warn('rollback also failed', {
        actionType: action.rollbackAction.type,
        error: result.error,
      });
      execution.status = AutomationStatus.RolledBack;
    }
    await this.eventPublisher.publishRollbackCompleted({
      automationId: context.automationId,
      executionId: context.executionId,
      workspaceId: context.workspaceId,
      serverId: context.serverId,
      status: result.success ? AutomationStatus.Success : AutomationStatus.Failed,
      actionType: action.rollbackAction.type,
      error: result.error,
      durationMs: result.durationMs,
      correlationId: context.correlationId,
      timestamp: new Date().toISOString(),
    });
  }
  private calculateRetryDelay(attempt: number): number {
    return calculateBackoffDelay(attempt);
  }
}
