import type { AutomationDefinition, AutomationExecution, ExecutionContext as SharedExecutionContext, ExecutionStep, AutomationTrigger, AutomationAction, AutomationCondition } from '@mydash/shared';
import { TriggerType, ActionType, AutomationStatus, ConditionOperator } from '@mydash/shared';
export type {
  AutomationDefinition,
  AutomationExecution,
  ExecutionStep,
  AutomationTrigger,
  AutomationAction,
};
export {
  TriggerType,
  ActionType,
  AutomationStatus,
  ConditionOperator,
};
export type { SharedExecutionContext, AutomationCondition };
export type ExecutionContext = SharedExecutionContext;
export interface WorkflowExecutionContext {
  definition: AutomationDefinition;
  execution: AutomationExecution;
  context: SharedExecutionContext;
}
export interface ValidateTriggerResult {
  matched: boolean;
  confidence: number;
  reason: string | null;
}
export interface EvaluateConditionResult {
  satisfied: boolean;
  confidence: number;
  reason: string | null;
}
export interface ExecuteActionResult {
  success: boolean;
  data: Record<string, unknown> | null;
  error: string | null;
  durationMs: number;
  rollbackRequired: boolean;
}
export interface VerifyActionResult {
  verified: boolean;
  data: Record<string, unknown> | null;
  error: string | null;
}
export interface RecoveryAction {
  type: 'retry' | 'rollback' | 'skip' | 'abort';
  delayMs: number;
  reason: string;
}
export interface ExecutionPlan {
  executionId: string;
  definition: AutomationDefinition;
  steps: ExecutionStepPlan[];
  totalDurationEstimateMs: number;
}
export interface ExecutionStepPlan {
  action: AutomationAction;
  stepIndex: number;
  estimatedDurationMs: number;
  hasRollback: boolean;
}
export interface AutomationEventPayload {
  automationId: string;
  executionId: string;
  workspaceId: string;
  serverId: string;
  status: AutomationStatus;
  actionType: ActionType | null;
  error: string | null;
  durationMs: number;
  correlationId: string;
  timestamp: string;
}
