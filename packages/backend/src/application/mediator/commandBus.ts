import type { Result } from '@mydash/shared';
import { AppError } from '@mydash/shared';
import type { Command, CommandHandler, CommandBus } from '../commands/base.js';
import type { Logger } from '../../logging/index.js';
export class InMemoryCommandBus implements CommandBus {
  private readonly handlers = new Map<string, CommandHandler<Command, unknown>>();
  private readonly logger: Logger;
  constructor(logger: Logger) {
    this.logger = logger;
  }
  async dispatch<TResult>(command: Command): Promise<Result<TResult, AppError>> {
    const handlerType = command.constructor.name;
    const handler = this.handlers.get(handlerType);
    if (!handler) {
      const err = new AppError({
        code: 'NO_HANDLER',
        message: `No handler registered for command: ${handlerType}`,
        statusCode: 500,
        severity: 'error',
        correlationId: command.correlationId,
      });
      return { success: false, data: null, error: err };
    }
    try {
      const result = await handler.handle(command);
      return result as Result<TResult, AppError>;
    } catch (error) {
      const err = error instanceof AppError
        ? error
        : new AppError({
            code: 'COMMAND_FAILED',
            message: error instanceof Error ? error.message : String(error),
            statusCode: 500,
            severity: 'error',
            correlationId: command.correlationId,
          });
      return { success: false, data: null, error: err };
    }
  }
  register<TCommand extends Command, TResult>(handler: CommandHandler<TCommand, TResult>): void {
    this.handlers.set(handler.handlerType, handler);
    this.logger.info(`Registered command: ${handler.handlerType}`);
  }
}
