import type { DomainEvent, CompositeCondition } from '@mydash/shared';
import type { AutomationDefinition, AutomationExecution, ExecutionContext, AutomationCondition, AutomationAction } from './valueObjects.js';
import type { TriggerType, ActionType } from '@mydash/shared';
import type {
  ValidateTriggerResult,
  EvaluateConditionResult,
  ExecuteActionResult,
  VerifyActionResult,
  RecoveryAction,
  ExecutionPlan,
  AutomationEventPayload,
} from './valueObjects.js';

export type {
  ValidateTriggerResult,
  EvaluateConditionResult,
  ExecuteActionResult,
  VerifyActionResult,
  RecoveryAction,
  ExecutionPlan,
  AutomationEventPayload,
  AutomationDefinition,
  AutomationExecution,
  ExecutionContext,
  AutomationCondition,
  AutomationAction,
};

export interface TriggerEngine {
  evaluateTrigger(
    definition: AutomationDefinition,
    event: DomainEvent | null,
    triggerType: TriggerType,
    context: Omit<ExecutionContext, 'startedAt' | 'executionId'>,
  ): Promise<ValidateTriggerResult>;
}

export interface ConditionEngine {
  evaluateConditions(
    conditions: AutomationCondition[],
    composite: CompositeCondition | null,
    context: ExecutionContext,
    engineContext: ConditionEvaluationContext,
  ): Promise<EvaluateConditionResult>;

  evaluateSingleCondition(
    condition: AutomationCondition,
    context: ExecutionContext,
    engineContext: ConditionEvaluationContext,
  ): Promise<EvaluateConditionResult>;

  evaluateComposite(
    composite: CompositeCondition,
    context: ExecutionContext,
    engineContext: ConditionEvaluationContext,
  ): Promise<EvaluateConditionResult>;
}

export interface ConditionEvaluationContext {
  metrics: Record<string, unknown>;
  healthScore: number | null;
  healthGrade: string | null;
  anomalies: unknown[];
  previousExecutions: AutomationExecution[];
}

export interface ActionEngine {
  executeAction(
    action: AutomationAction,
    context: ExecutionContext,
  ): Promise<ExecuteActionResult>;

  verifyAction(
    action: AutomationAction,
    context: ExecutionContext,
    result: ExecuteActionResult,
  ): Promise<VerifyActionResult>;

  executeRollback(
    action: AutomationAction,
    context: ExecutionContext,
    originalResult: ExecuteActionResult,
  ): Promise<ExecuteActionResult>;

  getSupportedActionTypes(): ActionType[];
}

export interface WorkflowEngine {
  createExecutionPlan(
    definition: AutomationDefinition,
    context: ExecutionContext,
  ): Promise<ExecutionPlan>;

  executeWorkflow(
    definition: AutomationDefinition,
    context: ExecutionContext,
  ): Promise<AutomationExecution>;

  handleRecovery(
    execution: AutomationExecution,
    error: string,
    retryCount: number,
    maxRetry: number,
  ): Promise<RecoveryAction>;

  shouldCooldown(
    definition: AutomationDefinition,
    recentExecutions: AutomationExecution[],
  ): { cooldown: boolean; remainingMs: number };
}

export interface WorkflowExecutor {
  execute(
    definition: AutomationDefinition,
    context: ExecutionContext,
  ): Promise<AutomationExecution>;

  cancel(executionId: string): Promise<void>;
}

export interface WorkflowScheduler {
  registerScheduledAutomation(
    definition: AutomationDefinition,
  ): Promise<void>;

  unregisterScheduledAutomation(
    definition: AutomationDefinition,
  ): Promise<void>;

  start(): Promise<void>;
  stop(): Promise<void>;
}

export interface AutomationEventPublisher {
  publishWorkflowStarted(payload: AutomationEventPayload): Promise<void>;
  publishWorkflowCompleted(payload: AutomationEventPayload): Promise<void>;
  publishWorkflowFailed(payload: AutomationEventPayload): Promise<void>;
  publishStepStarted(payload: AutomationEventPayload): Promise<void>;
  publishStepCompleted(payload: AutomationEventPayload): Promise<void>;
  publishStepFailed(payload: AutomationEventPayload): Promise<void>;
  publishRollbackStarted(payload: AutomationEventPayload): Promise<void>;
  publishRollbackCompleted(payload: AutomationEventPayload): Promise<void>;
}
