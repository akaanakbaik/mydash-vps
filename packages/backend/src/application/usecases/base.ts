import type { Result } from '@mydash/shared';
import type { AppError } from '@mydash/shared';

export interface UseCase<TInput, TOutput> {
  metadata: UseCaseMetadata;
  execute(input: TInput, context: UseCaseContext): Promise<Result<TOutput, AppError>>;
}

export interface UseCaseContext {
  readonly correlationId: string;
  readonly workspaceId: string;
  readonly userId: string | null;
  readonly timestamp: Date;
}

export interface UseCaseMetadata {
  name: string;
  description: string;
  category: string;
  requiresAuth: boolean;
  idempotent: boolean;
  timeoutMs: number;
}

export function createUseCaseContext(params: {
  correlationId: string;
  workspaceId: string;
  userId?: string;
}): UseCaseContext {
  return {
    correlationId: params.correlationId,
    workspaceId: params.workspaceId,
    userId: params.userId ?? null,
    timestamp: new Date(),
  };
}
