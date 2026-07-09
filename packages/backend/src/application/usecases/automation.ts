import type { Result, AppError, AutomationDefinition, AutomationExecution, DomainEvent } from '@mydash/shared';
import { TriggerType } from '@mydash/shared';
import type { UseCase, UseCaseContext, UseCaseMetadata } from './base.js';
import type { AutomationRepository, AutomationExecutionRepository } from '../../domain/automation/index.js';
import type { TriggerEngine, ConditionEngine, WorkflowEngine, WorkflowExecutor } from '../../domain/automation/services.js';
import type { AutomationCreateDTO } from '../dto/domain.js';
import type { ConditionEvaluationContext } from '../../domain/automation/services.js';

import type { Logger } from '../../logging/index.js';

const createMetadata: UseCaseMetadata = {
  name: 'CreateAutomation',
  description: 'Create a new automation definition',
  category: 'Automation',
  requiresAuth: true,
  idempotent: false,
  timeoutMs: 5000,
};

const listMetadata: UseCaseMetadata = {
  name: 'ListAutomations',
  description: 'List all automation definitions for a workspace',
  category: 'Automation',
  requiresAuth: true,
  idempotent: true,
  timeoutMs: 5000,
};

const executeMetadata: UseCaseMetadata = {
  name: 'ExecuteAutomation',
  description: 'Execute an automation by ID',
  category: 'Automation',
  requiresAuth: true,
  idempotent: false,
  timeoutMs: 120000,
};

export class CreateAutomationUseCase implements UseCase<AutomationCreateDTO, AutomationDefinition> {
  public readonly metadata = createMetadata;

  constructor(
    private readonly repository: AutomationRepository,
    private readonly logger: Logger,
  ) {}

  async execute(
    input: AutomationCreateDTO,
    context: UseCaseContext,
  ): Promise<Result<AutomationDefinition, AppError>> {
    try {
      const now = new Date().toISOString();
      const automation: AutomationDefinition = {
        id: crypto.randomUUID(),
        workspaceId: context.workspaceId,
        name: input.name,
        description: input.description ?? '',
        enabled: input.enabled ?? true,
        trigger: input.trigger as AutomationDefinition['trigger'],
        conditions: input.conditions ?? [],
        actions: input.actions,
        cooldownSeconds: input.cooldownSeconds ?? 60,
        maxRetry: input.maxRetry ?? 3,
        timeoutSeconds: input.timeoutSeconds ?? 30,
        requiresApproval: input.requiresApproval ?? false,
        createdAt: now,
        updatedAt: now,
      };

      await this.repository.save(automation);

      this.logger.info('automation created', {
        automationId: automation.id,
        name: automation.name,
        correlationId: context.correlationId,
      });

      return { success: true, data: automation, error: null };
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      this.logger.error('automation creation failed', error, {
        correlationId: context.correlationId,
      });
      return {
        success: false,
        data: null,
        error: { name: error.name, message: error.message, code: 'AUTOMATION_CREATE_FAILED' } as AppError,
      };
    }
  }
}

export class ListAutomationsUseCase implements UseCase<string, AutomationDefinition[]> {
  public readonly metadata = listMetadata;

  constructor(
    private readonly repository: AutomationRepository,
  ) {}

  async execute(
    workspaceId: string,
    _context: UseCaseContext,
  ): Promise<Result<AutomationDefinition[], AppError>> {
    try {
      const automations = await this.repository.findByWorkspaceId(workspaceId);
      return { success: true, data: automations, error: null };
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      return {
        success: false,
        data: null,
        error: { name: error.name, message: error.message, code: 'AUTOMATION_LIST_FAILED' } as AppError,
      };
    }
  }
}

export class ExecuteAutomationUseCase implements UseCase<{ automationId: string; serverId: string; triggerEvent: unknown }, AutomationExecution> {
  public readonly metadata = executeMetadata;

  constructor(
    private readonly repository: AutomationRepository,
    private readonly executionRepo: AutomationExecutionRepository,
    private readonly conditionEngine: ConditionEngine,
    private readonly workflowEngine: WorkflowEngine,
    private readonly executor: WorkflowExecutor,
    private readonly logger: Logger,
  ) {}

  async execute(
    input: { automationId: string; serverId: string; triggerEvent: unknown },
    context: UseCaseContext,
  ): Promise<Result<AutomationExecution, AppError>> {
    try {
      const definition = await this.repository.findById(input.automationId);
      if (!definition) {
        return {
          success: false,
          data: null,
          error: { name: 'NotFoundError', message: `Automation ${input.automationId} not found`, code: 'AUTOMATION_NOT_FOUND' } as AppError,
        };
      }

      if (!definition.enabled) {
        return {
          success: false,
          data: null,
          error: { name: 'DisabledError', message: 'Automation is disabled', code: 'AUTOMATION_DISABLED' } as AppError,
        };
      }

      const recentExecutions = await this.executionRepo.findByAutomationId(definition.id);
      const cooldownCheck = this.workflowEngine.shouldCooldown(definition, recentExecutions);
      if (cooldownCheck.cooldown) {
        return {
          success: false,
          data: null,
          error: {
            name: 'CooldownError',
            message: `Automation in cooldown, remaining: ${String(cooldownCheck.remainingMs)}ms`,
            code: 'AUTOMATION_COOLDOWN',
          } as AppError,
        };
      }

      const executionId = crypto.randomUUID();
      const now = new Date().toISOString();
      const executionContext = {
        executionId,
        workspaceId: context.workspaceId,
        serverId: input.serverId,
        automationId: definition.id,
        triggerType: definition.trigger.type,
        triggerEvent: input.triggerEvent,
        correlationId: context.correlationId,
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
        executionContext,
        engineContext,
      );

      if (!conditionResult.satisfied) {
        return {
          success: false,
          data: null,
          error: {
            name: 'ConditionNotSatisfied',
            message: conditionResult.reason ?? 'conditions not satisfied',
            code: 'AUTOMATION_CONDITION_FAILED',
          } as AppError,
        };
      }

      const execution = await this.executor.execute(definition, executionContext);

      return { success: true, data: execution, error: null };
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      this.logger.error('automation execution failed', error, {
        correlationId: context.correlationId,
        automationId: input.automationId,
      });
      return {
        success: false,
        data: null,
        error: { name: error.name, message: error.message, code: 'AUTOMATION_EXEC_FAILED' } as AppError,
      };
    }
  }
}

export class TriggerAutomationByEventUseCase implements UseCase<{ event: DomainEvent; serverId: string }, AutomationExecution | null> {
  public readonly metadata = {
    name: 'TriggerAutomationByEvent',
    description: 'Trigger automation matching an event',
    category: 'Automation',
    requiresAuth: false,
    idempotent: false,
    timeoutMs: 30000,
  };

  constructor(
    private readonly repository: AutomationRepository,
    private readonly executionRepo: AutomationExecutionRepository,
    private readonly triggerEngine: TriggerEngine,
    private readonly workflowEngine: WorkflowEngine,
    private readonly executor: WorkflowExecutor,
    private readonly logger: Logger,
  ) {}

  async execute(
    input: { event: DomainEvent; serverId: string },
    context: UseCaseContext,
  ): Promise<Result<AutomationExecution | null, AppError>> {
    try {
      const automations = await this.repository.findByWorkspaceId(context.workspaceId);

      for (const automation of automations) {
        if (!automation.enabled) continue;
        if (automation.trigger.type !== TriggerType.Event) continue;

        const triggerResult = await this.triggerEngine.evaluateTrigger(
          automation,
          input.event,
          TriggerType.Event,
          {
            workspaceId: context.workspaceId,
            serverId: input.serverId,
            automationId: automation.id,
            triggerType: TriggerType.Event,
            triggerEvent: input.event,
            correlationId: context.correlationId,
            retryCount: 0,
            maxRetry: automation.maxRetry,
          },
        );

        if (triggerResult.matched) {
          const recentExecutions = await this.executionRepo.findByAutomationId(automation.id);
          const cooldownCheck = this.workflowEngine.shouldCooldown(automation, recentExecutions);
          if (cooldownCheck.cooldown) continue;

          const executionContext = {
            executionId: crypto.randomUUID(),
            workspaceId: context.workspaceId,
            serverId: input.serverId,
            automationId: automation.id,
            triggerType: TriggerType.Event,
            triggerEvent: input.event,
            correlationId: context.correlationId,
            startedAt: new Date().toISOString(),
            retryCount: 0,
            maxRetry: automation.maxRetry,
          };

          await this.executor.execute(automation, executionContext);
        }
      }

      return { success: true, data: null, error: null };
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      this.logger.error('event-triggered automation failed', error, {
        correlationId: context.correlationId,
      });
      return {
        success: false,
        data: null,
        error: { name: error.name, message: error.message, code: 'AUTOMATION_EVENT_FAILED' } as AppError,
      };
    }
  }
}

export class GetExecutionStatusUseCase implements UseCase<string, AutomationExecution | null> {
  public readonly metadata = {
    name: 'GetExecutionStatus',
    description: 'Retrieve automation execution status',
    category: 'Automation',
    requiresAuth: true,
    idempotent: true,
    timeoutMs: 3000,
  };

  constructor(
    private readonly executionRepo: AutomationExecutionRepository,
  ) {}

  async execute(
    executionId: string,
    _context: UseCaseContext,
  ): Promise<Result<AutomationExecution | null, AppError>> {
    try {
      const execution = await this.executionRepo.findById(executionId);
      return { success: true, data: execution, error: null };
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      return {
        success: false,
        data: null,
        error: { name: error.name, message: error.message, code: 'EXECUTION_GET_FAILED' } as AppError,
      };
    }
  }
}

export class CancelExecutionUseCase implements UseCase<string, void> {
  public readonly metadata = {
    name: 'CancelExecution',
    description: 'Cancel a running automation execution',
    category: 'Automation',
    requiresAuth: true,
    idempotent: true,
    timeoutMs: 5000,
  };

  constructor(
    private readonly executor: WorkflowExecutor,
    private readonly executionRepo: AutomationExecutionRepository,
  ) {}

  async execute(
    executionId: string,
    _context: UseCaseContext,
  ): Promise<Result<void, AppError>> {
    try {
      await this.executor.cancel(executionId);
      await this.executionRepo.updateStatus(executionId, 'cancelled', new Date().toISOString());
      return { success: true, data: undefined, error: null };
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      return {
        success: false,
        data: null,
        error: { name: error.name, message: error.message, code: 'EXECUTION_CANCEL_FAILED' } as AppError,
      };
    }
  }
}
