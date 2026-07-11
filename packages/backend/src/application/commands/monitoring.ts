import type { Result, AppError } from '@mydash/shared';
import type { Metric } from '@mydash/shared';
import type { Command, CommandHandler, CommandMetadata } from './base.js';
import type { MetricRepository } from '../../domain/monitoring/repository.js';
import type { MetricValidator } from '../../domain/monitoring/services.js';
import type { MetricNormalizer } from '../../domain/monitoring/services.js';
import type { Logger } from '../../logging/index.js';
export interface IngestMetricCommand extends Command {
  metric: Metric;
}
export const ingestMetricMetadata: CommandMetadata = {
  handlerType: 'IngestMetric',
  description: 'Validate, normalize, and persist a single metric',
  requiresAuth: false,
  idempotent: true,
  retryable: true,
  timeoutMs: 5000,
};
export class IngestMetricCommandHandler implements CommandHandler<IngestMetricCommand> {
  public readonly handlerType = 'IngestMetric';
  public readonly metadata = ingestMetricMetadata;
  constructor(
    private readonly repository: MetricRepository,
    private readonly validator: MetricValidator,
    private readonly normalizer: MetricNormalizer,
    private readonly logger: Logger,
  ) {}
  async handle(command: IngestMetricCommand): Promise<Result<void, AppError>> {
    try {
      const validation = this.validator.validate(command.metric);
      if (!validation.valid) {
        this.logger.warn('metric validation failed', {
          metricType: command.metric.header.metricType,
          errors: validation.errors.map((e) => e.message),
          correlationId: command.correlationId,
        });
        return {
          success: false,
          data: null,
          error: {
            name: 'ValidationError',
            message: validation.errors.map((e) => e.message).join('; '),
            code: 'MONITORING_VALIDATION_FAILED',
          } as AppError,
        };
      }
      const normalized = this.normalizer.normalize(command.metric);
      await this.repository.save(normalized);
      this.logger.info('metric ingested', {
        metricType: normalized.header.metricType,
        correlationId: command.correlationId,
      });
      return { success: true, data: undefined, error: null };
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      this.logger.error('metric ingestion failed', error, {
        correlationId: command.correlationId,
      });
      return {
        success: false,
        data: null,
        error: {
          name: error.name,
          message: error.message,
          code: 'MONITORING_INGEST_FAILED',
        } as AppError,
      };
    }
  }
}
