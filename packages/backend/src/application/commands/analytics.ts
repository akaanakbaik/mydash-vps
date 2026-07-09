import type { Result, AppError } from '@mydash/shared';
import type { Command, CommandHandler, CommandMetadata } from './base.js';
import type { AnalyticsPipeline } from '../../domain/analytics/services.js';
import type { AnalyticsSummary } from '../../domain/analytics/entities.js';
import type { Logger } from '../../logging/index.js';

export interface RunAnalyticsCommand extends Command {
  serverId: string;
  windowMs: number;
}

export const runAnalyticsMetadata: CommandMetadata = {
  handlerType: 'RunAnalytics',
  description: 'Execute analytics pipeline: aggregate, analyze trends, detect anomalies',
  requiresAuth: false,
  idempotent: false,
  retryable: true,
  timeoutMs: 30000,
};

export class RunAnalyticsCommandHandler implements CommandHandler<RunAnalyticsCommand, AnalyticsSummary> {
  public readonly handlerType = 'RunAnalytics';
  public readonly metadata = runAnalyticsMetadata;

  constructor(
    private readonly pipeline: AnalyticsPipeline,
    private readonly logger: Logger,
  ) {}

  async handle(command: RunAnalyticsCommand): Promise<Result<AnalyticsSummary, AppError>> {
    try {
      const summary = await this.pipeline.process(command.serverId, command.workspaceId, command.windowMs);
      this.logger.info('analytics command completed', {
        serverId: command.serverId,
        windowMs: command.windowMs,
        aggregationCount: summary.aggregatedMetrics.length,
      });
      return { success: true, data: summary, error: null };
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      this.logger.error('analytics pipeline failed', error, {
        correlationId: command.correlationId,
        serverId: command.serverId,
      });
      return {
        success: false,
        data: null,
        error: { name: error.name, message: error.message, code: 'ANALYTICS_FAILED' } as AppError,
      };
    }
  }
}
