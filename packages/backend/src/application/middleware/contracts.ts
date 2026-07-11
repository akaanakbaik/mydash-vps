import type { UseCaseContext } from '../usecases/base.js';
export interface Middleware {
  name: string;
  priority: number;
  execute(context: MiddlewareContext, next: () => Promise<void>): Promise<void>;
}
export interface MiddlewareContext {
  correlationId: string;
  workspaceId: string;
  useCaseName: string;
  input: unknown;
  output: unknown;
  error: Error | null;
  durationMs: number;
  metadata: Record<string, unknown>;
}
export interface MiddlewareChain {
  execute(context: UseCaseContext, input: unknown, handler: (input: unknown) => Promise<unknown>): Promise<unknown>;
}
