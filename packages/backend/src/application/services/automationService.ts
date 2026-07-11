import type { Result, AutomationDefinition, AutomationExecution } from '@mydash/shared';
import { AppError } from '@mydash/shared';
import type { AutomationService } from '../contracts/automation.js';
import type { AutomationRepository, AutomationExecutionRepository } from '../../domain/automation/index.js';
import type { WorkflowExecutor, WorkflowEngine, ConditionEngine } from '../../domain/automation/services.js';
import type { ConditionEvaluationContext } from '../../domain/automation/services.js';
import type { Logger } from '../../logging/index.js';
export class AutomationServiceImpl implements AutomationService {
  constructor(
    private readonly automationRepo: AutomationRepository,
    private readonly executionRepo: AutomationExecutionRepository,
    private readonly conditionEngine: ConditionEngine,
    private readonly workflowEngine: WorkflowEngine,
    private readonly executor: WorkflowExecutor,
    private readonly logger: Logger,
  ) {}
  async execute(
    automationId: string,
    triggerEvent: unknown,
  ): Promise<Result<AutomationExecution, AppError>> {
    try {
      const definition = await this.automationRepo.findById(automationId);
      if (!definition) {
        return {
          success: false,
          data: null,
          error: new AppError({
            code: 'AUTOMATION_NOT_FOUND',
            message: `Automation ${automationId} not found`,
            statusCode: 404,
            severity: 'error',
            correlationId: this.getCorrelationId(triggerEvent),
          }),
        };
      }
      if (!definition.enabled) {
        return {
          success: false,
          data: null,
          error: new AppError({
            code: 'AUTOMATION_DISABLED',
            message: 'Automation is disabled',
            statusCode: 400,
            severity: 'warning',
            correlationId: this.getCorrelationId(triggerEvent),
          }),
        };
      }
      const recentExecutions = await this.executionRepo.findByAutomationId(definition.id);
      const cooldownCheck = this.workflowEngine.shouldCooldown(definition, recentExecutions);
      if (cooldownCheck.cooldown) {
        return {
          success: false,
          data: null,
          error: new AppError({
            code: 'AUTOMATION_COOLDOWN',
            message: `Automation in cooldown, remaining: ${String(cooldownCheck.remainingMs)}ms`,
            statusCode: 429,
            severity: 'warning',
            correlationId: this.getCorrelationId(triggerEvent),
          }),
        };
      }
      const executionId = crypto.randomUUID();
      const now = new Date().toISOString();
      const context = {
        executionId,
        workspaceId: definition.workspaceId,
        serverId: 'system',
        automationId: definition.id,
        triggerType: definition.trigger.type,
        triggerEvent,
        correlationId: this.getCorrelationId(triggerEvent),
        startedAt: now,
        retryCount: 0,
        maxRetry: definition.maxRetry,
      };
      const engineContext: ConditionEvaluationContext = {
        metrics: {},
        healthScore: null,
        healthGrade: null,
        anomalies: [],
        previousExecutions: recentExecutions,
      };
      const conditionResult = await this.conditionEngine.evaluateConditions(
        definition.conditions,
        null,
        context,
        engineContext,
      );
      if (!conditionResult.satisfied) {
        return {
          success: false,
          data: null,
          error: new AppError({
            code: 'AUTOMATION_CONDITION_FAILED',
            message: conditionResult.reason ?? 'conditions not satisfied',
            statusCode: 400,
            severity: 'warning',
            correlationId: context.correlationId,
          }),
        };
      }
      const execution = await this.executor.execute(definition, context);
      return { success: true, data: execution, error: null };
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      this.logger.error('automation execution failed', error, { automationId });
      return {
        success: false,
        data: null,
        error: new AppError({
          code: 'AUTOMATION_EXEC_FAILED',
          message: error.message,
          statusCode: 500,
          severity: 'error',
          correlationId: this.getCorrelationId(triggerEvent),
        }),
      };
    }
  }
  async getExecutionStatus(
    executionId: string,
  ): Promise<Result<AutomationExecution, AppError>> {
    try {
      const execution = await this.executionRepo.findById(executionId);
      if (!execution) {
        return {
          success: false,
          data: null,
          error: new AppError({
            code: 'EXECUTION_NOT_FOUND',
            message: `Execution ${executionId} not found`,
            statusCode: 404,
            severity: 'error',
            correlationId: '',
          }),
        };
      }
      return { success: true, data: execution, error: null };
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      return {
        success: false,
        data: null,
        error: new AppError({
          code: 'EXECUTION_GET_FAILED',
          message: error.message,
          statusCode: 500,
          severity: 'error',
          correlationId: '',
        }),
      };
    }
  }
  async cancelExecution(executionId: string): Promise<Result<void, AppError>> {
    try {
      await this.executor.cancel(executionId);
      await this.executionRepo.updateStatus(executionId, 'cancelled', new Date().toISOString());
      return { success: true, data: undefined, error: null };
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      return {
        success: false,
        data: null,
        error: new AppError({
          code: 'EXECUTION_CANCEL_FAILED',
          message: error.message,
          statusCode: 500,
          severity: 'error',
          correlationId: '',
        }),
      };
    }
  }
  async getActiveAutomations(
    workspaceId: string,
  ): Promise<Result<AutomationDefinition[], AppError>> {
    try {
      const automations = await this.automationRepo.findByWorkspaceId(workspaceId);
      return { success: true, data: automations, error: null };
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      return {
        success: false,
        data: null,
        error: new AppError({
          code: 'AUTOMATION_LIST_FAILED',
          message: error.message,
          statusCode: 500,
          severity: 'error',
          correlationId: '',
        }),
      };
    }
  }
  async createAutomation(
    definition: AutomationDefinition,
  ): Promise<Result<AutomationDefinition, AppError>> {
    try {
      await this.automationRepo.save(definition);
      return { success: true, data: definition, error: null };
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      return {
        success: false,
        data: null,
        error: new AppError({
          code: 'AUTOMATION_CREATE_FAILED',
          message: error.message,
          statusCode: 500,
          severity: 'error',
          correlationId: '',
        }),
      };
    }
  }
  async updateAutomation(
    definition: AutomationDefinition,
  ): Promise<Result<AutomationDefinition, AppError>> {
    try {
      await this.automationRepo.save(definition);
      return { success: true, data: definition, error: null };
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      return {
        success: false,
        data: null,
        error: new AppError({
          code: 'AUTOMATION_UPDATE_FAILED',
          message: error.message,
          statusCode: 500,
          severity: 'error',
          correlationId: '',
        }),
      };
    }
  }
  private getCorrelationId(triggerEvent: unknown): string {
    if (triggerEvent && typeof triggerEvent === 'object' && 'correlationId' in triggerEvent) {
const rawId = (triggerEvent as Record<string, string>).correlationId;
      return rawId || crypto.randomUUID();
    }
    return crypto.randomUUID();
  }
}
