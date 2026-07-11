import type { Result, AutomationDefinition, AutomationExecution } from '@mydash/shared';
import type { AppError } from '@mydash/shared';
export interface AutomationService {
  execute(automationId: string, triggerEvent: unknown): Promise<Result<AutomationExecution, AppError>>;
  getExecutionStatus(executionId: string): Promise<Result<AutomationExecution, AppError>>;
  cancelExecution(executionId: string): Promise<Result<void, AppError>>;
  getActiveAutomations(workspaceId: string): Promise<Result<AutomationDefinition[], AppError>>;
  createAutomation(definition: AutomationDefinition): Promise<Result<AutomationDefinition, AppError>>;
  updateAutomation(definition: AutomationDefinition): Promise<Result<AutomationDefinition, AppError>>;
}
