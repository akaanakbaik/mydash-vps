import type { WorkflowScheduler, WorkflowEngine, WorkflowExecutor } from '../../domain/automation/services.js';
import type { AutomationDefinition } from '../../domain/automation/valueObjects.js';
import { TriggerType } from '@mydash/shared';
import type { AutomationRepository, AutomationExecutionRepository } from '../../domain/automation/index.js';
import type { SchedulerEngine } from '../../runtime/scheduler/scheduler.js';
import type { Logger } from '../../logging/index.js';

export class WorkflowSchedulerImpl implements WorkflowScheduler {
  private readonly scheduledIds = new Set<string>();

  constructor(
    private readonly scheduler: SchedulerEngine,
    private readonly automationRepo: AutomationRepository,
    private readonly executionRepo: AutomationExecutionRepository,
    private readonly workflowEngine: WorkflowEngine,
    private readonly executor: WorkflowExecutor,
    private readonly logger: Logger,
  ) {}

  registerScheduledAutomation(definition: AutomationDefinition): Promise<void> {
    if (!definition.enabled) {
      this.logger.warn('cannot register disabled automation', { automationId: definition.id });
      return Promise.resolve();
    }

    if (this.scheduledIds.has(definition.id)) {
      this.logger.warn('automation already scheduled', { automationId: definition.id });
      return Promise.resolve();
    }

    const trigger = definition.trigger;
    if (trigger.type !== TriggerType.Schedule) {
      this.logger.warn('automation is not scheduled type', { automationId: definition.id, triggerType: trigger.type });
      return Promise.resolve();
    }

    const intervalMs = trigger.scheduleIntervalMs ?? 60000;

    this.scheduler.register({
      name: `automation:${definition.id}`,
      handler: () => this.executeScheduledAutomation(definition),
      intervalMs,
    });

    this.scheduledIds.add(definition.id);
    this.logger.info('scheduled automation registered', {
      automationId: definition.id,
      name: definition.name,
      intervalMs,
    });

    return Promise.resolve();
  }

  unregisterScheduledAutomation(definition: AutomationDefinition): Promise<void> {
    this.scheduler.unregister(`automation:${definition.id}`);
    this.scheduledIds.delete(definition.id);
    this.logger.info('scheduled automation unregistered', { automationId: definition.id });
    return Promise.resolve();
  }

  async start(): Promise<void> {
    this.logger.info('workflow scheduler started');
    const automations = await this.automationRepo.findAll();

    for (const automation of automations) {
      if (automation.enabled && automation.trigger.type === TriggerType.Schedule) {
        await this.registerScheduledAutomation(automation);
      }
    }
  }

  stop(): Promise<void> {
    for (const id of this.scheduledIds) {
      this.scheduler.unregister(`automation:${id}`);
    }
    this.scheduledIds.clear();
    this.logger.info('workflow scheduler stopped');
    return Promise.resolve();
  }

  private async executeScheduledAutomation(definition: AutomationDefinition): Promise<void> {
    const workspaceId = definition.workspaceId;
    const correlationId = crypto.randomUUID();
    const executionId = crypto.randomUUID();
    const now = new Date().toISOString();

    const context = {
      executionId,
      workspaceId,
      serverId: 'system',
      automationId: definition.id,
      triggerType: TriggerType.Schedule,
      triggerEvent: { type: 'schedule', scheduledAt: now },
      correlationId,
      startedAt: now,
      retryCount: 0,
      maxRetry: definition.maxRetry,
    };

    try {
      const recentExecutions = await this.executionRepo.findByAutomationId(definition.id);
      const cooldownCheck = this.workflowEngine.shouldCooldown(definition, recentExecutions);

      if (cooldownCheck.cooldown) {
        this.logger.debug('automation in cooldown, skipping', {
          automationId: definition.id,
          remainingMs: cooldownCheck.remainingMs,
        });
        return;
      }

      await this.executor.execute(definition, context);
    } catch (err) {
      this.logger.error('scheduled automation execution failed', err instanceof Error ? err : new Error(String(err)), {
        automationId: definition.id,
      });
    }
  }
}
