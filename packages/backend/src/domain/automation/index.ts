import type { AutomationDefinition, AutomationExecution } from '@mydash/shared';

export type { AutomationDefinition, AutomationExecution, AutomationTrigger, AutomationAction, ExecutionStep, ExecutionContext, AutomationStats } from '@mydash/shared';
export { TriggerType, ActionType, AutomationStatus, ConditionOperator } from '@mydash/shared';
export type { AutomationService } from '../../application/index.js';

export interface AutomationRepository {
  findById(id: string): Promise<AutomationDefinition | null>;
  findByWorkspaceId(workspaceId: string): Promise<AutomationDefinition[]>;
  findAll(): Promise<AutomationDefinition[]>;
  save(automation: AutomationDefinition): Promise<void>;
  delete(id: string): Promise<void>;
}

export interface AutomationExecutionRepository {
  save(execution: AutomationExecution): Promise<void>;
  findById(id: string): Promise<AutomationExecution | null>;
  findByAutomationId(automationId: string): Promise<AutomationExecution[]>;
  findByWorkspaceId(workspaceId: string, limit?: number): Promise<AutomationExecution[]>;
  findByWorkspaceAndStatus(workspaceId: string, status: string, limit?: number): Promise<AutomationExecution[]>;
  updateStatus(id: string, status: string, completedAt?: string): Promise<void>;
}
