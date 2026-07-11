import type { AutomationStatus, ActionType } from '@mydash/shared';
export interface WorkflowStartedEvent {
  readonly eventType: 'automation.workflow.started';
  readonly automationId: string;
  readonly executionId: string;
  readonly workspaceId: string;
  readonly serverId: string;
  readonly triggerType: string;
  readonly timestamp: string;
  readonly correlationId: string;
}
export interface WorkflowCompletedEvent {
  readonly eventType: 'automation.workflow.completed';
  readonly automationId: string;
  readonly executionId: string;
  readonly workspaceId: string;
  readonly serverId: string;
  readonly status: AutomationStatus;
  readonly durationMs: number;
  readonly timestamp: string;
  readonly correlationId: string;
}
export interface WorkflowFailedEvent {
  readonly eventType: 'automation.workflow.failed';
  readonly automationId: string;
  readonly executionId: string;
  readonly workspaceId: string;
  readonly serverId: string;
  readonly error: string;
  readonly retryCount: number;
  readonly timestamp: string;
  readonly correlationId: string;
}
export interface StepExecutedEvent {
  readonly eventType: 'automation.step.executed';
  readonly automationId: string;
  readonly executionId: string;
  readonly stepIndex: number;
  readonly actionType: ActionType;
  readonly status: AutomationStatus;
  readonly durationMs: number;
  readonly error: string | null;
  readonly timestamp: string;
  readonly correlationId: string;
}
export interface RollbackExecutedEvent {
  readonly eventType: 'automation.rollback.executed';
  readonly automationId: string;
  readonly executionId: string;
  readonly stepIndex: number;
  readonly actionType: ActionType;
  readonly status: AutomationStatus;
  readonly durationMs: number;
  readonly error: string | null;
  readonly timestamp: string;
  readonly correlationId: string;
}
export type AutomationDomainEvent =
  | WorkflowStartedEvent
  | WorkflowCompletedEvent
  | WorkflowFailedEvent
  | StepExecutedEvent
  | RollbackExecutedEvent;
