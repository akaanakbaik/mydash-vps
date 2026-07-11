import type { AutomationRepository, AutomationExecutionRepository } from '../../domain/automation/index.js';
import type { AutomationDefinition, AutomationExecution } from '@mydash/shared';
import type { DrizzleClient } from '../../persistence/connection.js';
import { makeTransactionalDb } from '../../persistence/repository/transactionContext.js';
import { automations, automationExecutions } from '../../persistence/schema/automation.js';
import { eq, desc, and } from 'drizzle-orm';
function cloneAsRecord(data: unknown): Record<string, unknown> {
  return JSON.parse(JSON.stringify(data)) as Record<string, unknown>;
}
export class AutomationRepositoryImpl implements AutomationRepository {
  constructor(private readonly db: DrizzleClient) {
    this.db = makeTransactionalDb(this.db);
  }
  async findById(id: string): Promise<AutomationDefinition | null> {
    const results = await this.db
      .select()
      .from(automations)
      .where(eq(automations.id, id))
      .limit(1);
    if (results.length === 0) return null;
    return this.mapToDefinition(results[0]);
  }
  async findByWorkspaceId(workspaceId: string): Promise<AutomationDefinition[]> {
    const results = await this.db
      .select()
      .from(automations)
      .where(eq(automations.workspaceId, workspaceId))
      .orderBy(desc(automations.createdAt));
    return results.map((r) => this.mapToDefinition(r));
  }
  async findAll(): Promise<AutomationDefinition[]> {
    const results = await this.db
      .select()
      .from(automations)
      .orderBy(desc(automations.createdAt));
    return results.map((r) => this.mapToDefinition(r));
  }
  async save(automation: AutomationDefinition): Promise<void> {
    await this.db.insert(automations).values({
      id: automation.id,
      workspaceId: automation.workspaceId,
      name: automation.name,
      description: automation.description,
      enabled: automation.enabled,
      triggerType: automation.trigger.type,
      eventCategory: automation.trigger.eventCategory,
      scheduleCron: automation.trigger.scheduleCron,
      conditions: cloneAsRecord(automation.conditions),
      actions: cloneAsRecord(automation.actions),
      cooldownSeconds: automation.cooldownSeconds,
      maxRetry: automation.maxRetry,
      requiresApproval: automation.requiresApproval,
      createdAt: new Date(automation.createdAt),
      updatedAt: new Date(automation.updatedAt),
    });
  }
  async delete(id: string): Promise<void> {
    await this.db.delete(automations).where(eq(automations.id, id));
  }
  private mapToDefinition(row: Record<string, unknown>): AutomationDefinition {
    return {
      id: String(row.id),
      workspaceId: String(row.workspaceId),
      name: String(row.name),
      description: typeof row.description === 'string' ? row.description : '',
      enabled: Boolean(row.enabled),
      trigger: {
        type: String(row.triggerType) as AutomationDefinition['trigger']['type'],
        eventCategory: typeof row.eventCategory === 'string' ? row.eventCategory : '',
        eventType: '',
        scheduleCron: typeof row.scheduleCron === 'string' ? row.scheduleCron : null,
        scheduleIntervalMs: null,
      },
      conditions: Array.isArray(row.conditions) ? row.conditions as AutomationDefinition['conditions'] : [],
      actions: Array.isArray(row.actions) ? row.actions as AutomationDefinition['actions'] : [],
      cooldownSeconds: Number(row.cooldownSeconds),
      maxRetry: Number(row.maxRetry),
      timeoutSeconds: 30,
      requiresApproval: Boolean(row.requiresApproval),
      createdAt: row.createdAt instanceof Date ? row.createdAt.toISOString() : String(row.createdAt),
      updatedAt: row.updatedAt instanceof Date ? row.updatedAt.toISOString() : String(row.updatedAt),
    };
  }
}
export class AutomationExecutionRepositoryImpl implements AutomationExecutionRepository {
  constructor(private readonly db: DrizzleClient) {
    this.db = makeTransactionalDb(this.db);
  }
  async save(execution: AutomationExecution): Promise<void> {
    await this.db.insert(automationExecutions).values({
      id: execution.id,
      workspaceId: execution.workspaceId,
      serverId: execution.serverId,
      automationId: execution.automationId,
      triggerEvent: execution.triggerEvent,
      status: execution.status,
      priority: execution.priority as unknown as string,
      retryCount: execution.retryCount,
      maxRetry: execution.maxRetry,
      startedAt: execution.startedAt,
      completedAt: execution.completedAt,
      durationMs: execution.durationMs,
      result: execution.result,
      errorDetails: execution.errorDetails,
      correlationId: execution.correlationId,
      createdAt: execution.createdAt,
    });
  }
  async findById(id: string): Promise<AutomationExecution | null> {
    const results = await this.db
      .select()
      .from(automationExecutions)
      .where(eq(automationExecutions.id, id))
      .limit(1);
    if (results.length === 0) return null;
    return this.mapToExecution(results[0]);
  }
  async findByAutomationId(automationId: string): Promise<AutomationExecution[]> {
    const results = await this.db
      .select()
      .from(automationExecutions)
      .where(eq(automationExecutions.automationId, automationId))
      .orderBy(desc(automationExecutions.createdAt))
      .limit(50);
    return results.map((r) => this.mapToExecution(r));
  }
  async findByWorkspaceId(workspaceId: string, limit = 20): Promise<AutomationExecution[]> {
    const results = await this.db
      .select()
      .from(automationExecutions)
      .where(eq(automationExecutions.workspaceId, workspaceId))
      .orderBy(desc(automationExecutions.createdAt))
      .limit(limit);
    return results.map((r) => this.mapToExecution(r));
  }
  async findLatestByAutomationId(automationId: string): Promise<AutomationExecution | null> {
    const results = await this.db
      .select()
      .from(automationExecutions)
      .where(eq(automationExecutions.automationId, automationId))
      .orderBy(desc(automationExecutions.createdAt))
      .limit(1);
    if (results.length === 0) return null;
    return this.mapToExecution(results[0]);
  }
  async findByWorkspaceAndStatus(
    workspaceId: string,
    status: string,
    limit = 20,
  ): Promise<AutomationExecution[]> {
    const results = await this.db
      .select()
      .from(automationExecutions)
      .where(
        and(eq(automationExecutions.workspaceId, workspaceId), eq(automationExecutions.status, status)),
      )
      .orderBy(desc(automationExecutions.createdAt))
      .limit(limit);
    return results.map((r) => this.mapToExecution(r));
  }
  async updateStatus(id: string, status: string, completedAt?: string): Promise<void> {
    const updates: Record<string, unknown> = { status };
    if (completedAt) {
      updates.completedAt = completedAt;
    }
    await this.db
      .update(automationExecutions)
      .set(updates)
      .where(eq(automationExecutions.id, id));
  }
  private mapToExecution(row: Record<string, unknown>): AutomationExecution {
    return {
      id: String(row.id),
      workspaceId: String(row.workspaceId),
      serverId: String(row.serverId),
      automationId: String(row.automationId),
      triggerEvent: row.triggerEvent,
      status: String(row.status) as unknown as AutomationExecution['status'],
      priority: String(row.priority) as unknown as AutomationExecution['priority'],
      retryCount: Number(row.retryCount),
      maxRetry: Number(row.maxRetry),
      startedAt: typeof row.startedAt === 'string' ? row.startedAt : null,
      completedAt: typeof row.completedAt === 'string' ? row.completedAt : null,
      durationMs: Number(row.durationMs),
      result: typeof row.result === 'string' ? row.result : null,
      errorDetails: typeof row.errorDetails === 'string' ? row.errorDetails : null,
      correlationId: String(row.correlationId),
      createdAt: String(row.createdAt),
    };
  }
}
