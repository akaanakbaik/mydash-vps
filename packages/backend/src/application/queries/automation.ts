import type { Result, AppError } from '@mydash/shared';
import type { AutomationDefinition, AutomationExecution, AutomationStats } from '@mydash/shared';
import type { Query, QueryHandler, QueryMetadata } from './base.js';
import type { AutomationRepository, AutomationExecutionRepository } from '../../domain/automation/index.js';
import type { CacheManager } from '../../infrastructure/redis/cache.js';
import type { Logger } from '../../logging/index.js';

export interface GetAutomationQuery extends Query {
  automationId: string;
}

export interface ListAutomationsQuery extends Query {
  workspaceId: string;
}

export interface GetExecutionQuery extends Query {
  executionId: string;
}

export interface ListExecutionsQuery extends Query {
  workspaceId: string;
  limit?: number;
  status?: string;
}

export interface GetAutomationStatsQuery extends Query {
  workspaceId: string;
}

export const getAutomationMetadata: QueryMetadata = {
  queryType: 'GetAutomation',
  description: 'Retrieve a single automation by ID',
  requiresAuth: true,
  cacheable: true,
  cacheTtlSeconds: 60,
  paginated: false,
};

export const listAutomationsMetadata: QueryMetadata = {
  queryType: 'ListAutomations',
  description: 'List all automations for a workspace',
  requiresAuth: true,
  cacheable: true,
  cacheTtlSeconds: 60,
  paginated: false,
};

export const getExecutionMetadata: QueryMetadata = {
  queryType: 'GetExecution',
  description: 'Retrieve a single automation execution by ID',
  requiresAuth: true,
  cacheable: false,
  cacheTtlSeconds: 0,
  paginated: false,
};

export const listExecutionsMetadata: QueryMetadata = {
  queryType: 'ListExecutions',
  description: 'List automation executions for a workspace',
  requiresAuth: true,
  cacheable: false,
  cacheTtlSeconds: 0,
  paginated: true,
};

export const getAutomationStatsMetadata: QueryMetadata = {
  queryType: 'GetAutomationStats',
  description: 'Get automation statistics for a workspace',
  requiresAuth: true,
  cacheable: true,
  cacheTtlSeconds: 30,
  paginated: false,
};

export class GetAutomationQueryHandler implements QueryHandler<GetAutomationQuery, AutomationDefinition | null> {
  public readonly queryType = 'GetAutomation';
  public readonly metadata = getAutomationMetadata;

  constructor(
    private readonly repository: AutomationRepository,
    private readonly cache: CacheManager,
  ) {}

  async execute(query: GetAutomationQuery): Promise<Result<AutomationDefinition | null, AppError>> {
    try {
      const cacheKey = `automation:${query.automationId}`;
      const cached = await this.cache.get(cacheKey);
      if (cached) return { success: true, data: cached as AutomationDefinition, error: null };

      const automation = await this.repository.findById(query.automationId);
      if (automation) {
        await this.cache.set(cacheKey, automation, 60);
      }
      return { success: true, data: automation, error: null };
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      return {
        success: false,
        data: null,
        error: { name: error.name, message: error.message, code: 'AUTOMATION_GET_FAILED' } as AppError,
      };
    }
  }
}

export class ListAutomationsQueryHandler implements QueryHandler<ListAutomationsQuery, AutomationDefinition[]> {
  public readonly queryType = 'ListAutomations';
  public readonly metadata = listAutomationsMetadata;

  constructor(
    private readonly repository: AutomationRepository,
  ) {}

  async execute(query: ListAutomationsQuery): Promise<Result<AutomationDefinition[], AppError>> {
    try {
      const automations = await this.repository.findByWorkspaceId(query.workspaceId);
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

export class GetExecutionQueryHandler implements QueryHandler<GetExecutionQuery, AutomationExecution | null> {
  public readonly queryType = 'GetExecution';
  public readonly metadata = getExecutionMetadata;

  constructor(
    private readonly repository: AutomationExecutionRepository,
    private readonly logger: Logger,
  ) {}

  async execute(query: GetExecutionQuery): Promise<Result<AutomationExecution | null, AppError>> {
    try {
      const execution = await this.repository.findById(query.executionId);
      return { success: true, data: execution, error: null };
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      this.logger.error('failed to get execution', error, { executionId: query.executionId });
      return {
        success: false,
        data: null,
        error: { name: error.name, message: error.message, code: 'EXECUTION_GET_FAILED' } as AppError,
      };
    }
  }
}

export class ListExecutionsQueryHandler implements QueryHandler<ListExecutionsQuery, AutomationExecution[]> {
  public readonly queryType = 'ListExecutions';
  public readonly metadata = listExecutionsMetadata;

  constructor(
    private readonly repository: AutomationExecutionRepository,
  ) {}

  async execute(query: ListExecutionsQuery): Promise<Result<AutomationExecution[], AppError>> {
    try {
      let executions: AutomationExecution[];

      if (query.status) {
        executions = await this.repository.findByWorkspaceAndStatus(query.workspaceId, query.status, query.limit);
      } else {
        executions = await this.repository.findByWorkspaceId(query.workspaceId, query.limit);
      }

      return { success: true, data: executions, error: null };
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      return {
        success: false,
        data: null,
        error: { name: error.name, message: error.message, code: 'EXECUTIONS_LIST_FAILED' } as AppError,
      };
    }
  }
}

export class GetAutomationStatsQueryHandler implements QueryHandler<GetAutomationStatsQuery, AutomationStats> {
  public readonly queryType = 'GetAutomationStats';
  public readonly metadata = getAutomationStatsMetadata;

  constructor(
    private readonly automationRepo: AutomationRepository,
    private readonly executionRepo: AutomationExecutionRepository,
  ) {}

  async execute(query: GetAutomationStatsQuery): Promise<Result<AutomationStats, AppError>> {
    try {
      const automations = await this.automationRepo.findByWorkspaceId(query.workspaceId);
      const executions = await this.executionRepo.findByWorkspaceId(query.workspaceId, 100);

      const totalAutomations = automations.length;
      const enabledAutomations = automations.filter((a) => a.enabled).length;
      const totalExecutions = executions.length;

      const successCount = executions.filter((e) => (e.status as string) === 'success').length;
      const failedCount = executions.filter((e) => (e.status as string) === 'failed').length;
      const successRate = totalExecutions > 0 ? (successCount / totalExecutions) * 100 : 0;
      const failureRate = totalExecutions > 0 ? (failedCount / totalExecutions) * 100 : 0;

      const averageExecutionMs = executions.length > 0
        ? Math.round(executions.reduce((sum, e) => sum + e.durationMs, 0) / executions.length)
        : 0;

      return {
        success: true,
        data: {
          totalAutomations,
          enabledAutomations,
          totalExecutions,
          successRate: Math.round(successRate * 100) / 100,
          failureRate: Math.round(failureRate * 100) / 100,
          averageExecutionMs,
          recentExecutions: executions.slice(0, 10),
        },
        error: null,
      };
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      return {
        success: false,
        data: null,
        error: { name: error.name, message: error.message, code: 'AUTOMATION_STATS_FAILED' } as AppError,
      };
    }
  }
}
