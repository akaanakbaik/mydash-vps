import type { Result, AppError, HealthScore, DomainEvent } from '@mydash/shared';
import type { Command, CommandHandler, CommandMetadata } from './base.js';
import type { HealthCalculator } from '../../domain/healthScore/services.js';
import type { HealthScoreRepository } from '../../domain/healthScore/index.js';
import type { CacheManager } from '../../infrastructure/redis/cache.js';
import type { EventBus } from '../../eventBus/contracts.js';
import type { Logger } from '../../logging/index.js';
import { Severity, Priority, EventCategory } from '@mydash/shared';
export interface CalculateHealthCommand extends Command {
  serverId: string;
}
export const calculateHealthMetadata: CommandMetadata = {
  handlerType: 'CalculateHealth',
  description: 'Calculate and persist health score for a server',
  requiresAuth: false,
  idempotent: false,
  retryable: true,
  timeoutMs: 15000,
};
export class CalculateHealthCommandHandler implements CommandHandler<CalculateHealthCommand, HealthScore> {
  public readonly handlerType = 'CalculateHealth';
  public readonly metadata = calculateHealthMetadata;
  constructor(
    private readonly calculator: HealthCalculator,
    private readonly repository: HealthScoreRepository,
    private readonly cache: CacheManager,
    private readonly eventBus: EventBus,
    private readonly logger: Logger,
  ) {}
  async handle(command: CalculateHealthCommand): Promise<Result<HealthScore, AppError>> {
    try {
      const score = await this.calculator.calculate(command.serverId, command.workspaceId);
      await this.repository.save(score);
      await this.cache.set(`health:score:${command.serverId}`, score, 60);
      const envelope = {
        id: crypto.randomUUID(),
        workspaceId: command.workspaceId,
        serverId: command.serverId,
        sequenceNumber: 0,
        timestamp: new Date().toISOString(),
        eventType: 'health.score.calculated',
        payload: score,
        checksum: '',
        correlationId: command.correlationId,
        traceId: crypto.randomUUID(),
        version: 1,
      };
      await this.eventBus.publish({
        envelope,
        severity: Severity.Information,
        priority: Priority.Normal,
        category: EventCategory.System,
        source: 'health-score-engine',
      } as unknown as DomainEvent);
      return { success: true, data: score, error: null };
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      this.logger.error('health calculation command failed', error, { correlationId: command.correlationId });
      return {
        success: false,
        data: null,
        error: { name: error.name, message: error.message, code: 'HEALTH_CMD_FAILED' } as AppError,
      };
    }
  }
}
