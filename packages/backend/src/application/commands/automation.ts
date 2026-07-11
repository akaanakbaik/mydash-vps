import type { Result, AppError } from '@mydash/shared';
import type { Command, CommandHandler, CommandMetadata } from './base.js';
import type { AutomationService } from '../contracts/automation.js';
import type { Logger } from '../../logging/index.js';
export interface ExecuteAutomationCommand extends Command {
  automationId: string;
  serverId: string;
  triggerEvent: unknown;
}
export const executeAutomationMetadata: CommandMetadata = {
  handlerType: 'ExecuteAutomation',
  description: 'Execute an automation workflow',
  requiresAuth: true,
  idempotent: false,
  retryable: false,
  timeoutMs: 120000,
};
export interface CancelAutomationCommand extends Command {
  executionId: string;
}
export const cancelAutomationMetadata: CommandMetadata = {
  handlerType: 'CancelAutomation',
  description: 'Cancel a running automation execution',
  requiresAuth: true,
  idempotent: true,
  retryable: false,
  timeoutMs: 5000,
};
export class ExecuteAutomationCommandHandler implements CommandHandler<ExecuteAutomationCommand, unknown> {
  public readonly handlerType = 'ExecuteAutomation';
  public readonly metadata = executeAutomationMetadata;
  constructor(
    private readonly automationService: AutomationService,
    private readonly logger: Logger,
  ) {}
  async handle(command: ExecuteAutomationCommand): Promise<Result<unknown, AppError>> {
    try {
      const result = await this.automationService.execute(
        command.automationId,
        command.triggerEvent,
      );
      if (!result.success) {
        return { success: false, data: null, error: result.error };
      }
      this.logger.info('automation executed', {
        automationId: command.automationId,
        executionId: (result.data as { id?: string } | null)?.id,
        correlationId: command.correlationId,
      });
      return { success: true, data: result.data, error: null };
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      this.logger.error('automation execution command failed', error, {
        correlationId: command.correlationId,
        automationId: command.automationId,
      });
      return {
        success: false,
        data: null,
        error: { name: error.name, message: error.message, code: 'AUTOMATION_EXEC_FAILED' } as AppError,
      };
    }
  }
}
export class CancelAutomationCommandHandler implements CommandHandler<CancelAutomationCommand> {
  public readonly handlerType = 'CancelAutomation';
  public readonly metadata = cancelAutomationMetadata;
  constructor(
    private readonly automationService: AutomationService,
    private readonly logger: Logger,
  ) {}
  async handle(command: CancelAutomationCommand): Promise<Result<void, AppError>> {
    try {
      const result = await this.automationService.cancelExecution(command.executionId);
      if (!result.success) {
        return { success: false, data: null, error: result.error };
      }
      this.logger.info('automation cancelled', {
        executionId: command.executionId,
        correlationId: command.correlationId,
      });
      return { success: true, data: undefined, error: null };
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      this.logger.error('automation cancellation failed', error, {
        correlationId: command.correlationId,
        executionId: command.executionId,
      });
      return {
        success: false,
        data: null,
        error: { name: error.name, message: error.message, code: 'AUTOMATION_CANCEL_FAILED' } as AppError,
      };
    }
  }
}
