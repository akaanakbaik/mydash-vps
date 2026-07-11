import type { Result } from '@mydash/shared';
import type { AppError } from '@mydash/shared';
export interface Command {
  readonly commandId: string;
  readonly correlationId: string;
  readonly workspaceId: string;
  readonly timestamp: Date;
}
export interface CommandHandler<TCommand extends Command, TResult = void> {
  handlerType: string;
  metadata: CommandMetadata;
  handle(command: TCommand): Promise<Result<TResult, AppError>>;
}
export interface CommandBus {
  dispatch<TResult>(command: Command): Promise<Result<TResult, AppError>>;
  register<TCommand extends Command, TResult>(handler: CommandHandler<TCommand, TResult>): void;
}
export interface CommandMetadata {
  handlerType: string;
  description: string;
  requiresAuth: boolean;
  idempotent: boolean;
  retryable: boolean;
  timeoutMs: number;
}
