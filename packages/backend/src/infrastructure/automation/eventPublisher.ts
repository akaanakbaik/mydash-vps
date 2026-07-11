import type { AutomationEventPublisher, AutomationEventPayload } from '../../domain/automation/services.js';
import type { EventBus } from '../../eventBus/contracts.js';
import type { DomainEvent } from '@mydash/shared';
import { Severity, Priority, EventCategory } from '@mydash/shared';
import type { Logger } from '../../logging/index.js';
export class AutomationEventPublisherImpl implements AutomationEventPublisher {
  constructor(
    private readonly eventBus: EventBus,
    private readonly logger: Logger,
  ) {}
  async publishWorkflowStarted(payload: AutomationEventPayload): Promise<void> {
    await this.publishEvent('automation.workflow.started', payload);
  }
  async publishWorkflowCompleted(payload: AutomationEventPayload): Promise<void> {
    await this.publishEvent('automation.workflow.completed', payload);
  }
  async publishWorkflowFailed(payload: AutomationEventPayload): Promise<void> {
    await this.publishEvent('automation.workflow.failed', payload);
  }
  async publishStepStarted(payload: AutomationEventPayload): Promise<void> {
    await this.publishEvent('automation.step.started', payload);
  }
  async publishStepCompleted(payload: AutomationEventPayload): Promise<void> {
    await this.publishEvent('automation.step.completed', payload);
  }
  async publishStepFailed(payload: AutomationEventPayload): Promise<void> {
    await this.publishEvent('automation.step.failed', payload);
  }
  async publishRollbackStarted(payload: AutomationEventPayload): Promise<void> {
    await this.publishEvent('automation.rollback.started', payload);
  }
  async publishRollbackCompleted(payload: AutomationEventPayload): Promise<void> {
    await this.publishEvent('automation.rollback.completed', payload);
  }
  private async publishEvent(eventType: string, payload: AutomationEventPayload): Promise<void> {
    try {
      const envelope = {
        id: crypto.randomUUID(),
        workspaceId: payload.workspaceId,
        serverId: payload.serverId,
        sequenceNumber: 0,
        timestamp: payload.timestamp,
        eventType,
        payload,
        checksum: '',
        correlationId: payload.correlationId,
        traceId: crypto.randomUUID(),
        version: 1,
      };
      const event = {
        envelope,
        severity: this.mapSeverity(payload.status),
        priority: Priority.Normal,
        category: EventCategory.Automation,
        source: 'automation-engine',
      } as unknown as DomainEvent;
      await this.eventBus.publish(event);
      this.logger.debug('automation event published', { eventType, executionId: payload.executionId });
    } catch (err) {
      this.logger.error('failed to publish automation event', err instanceof Error ? err : new Error(String(err)), {
        eventType: eventType,
      });
    }
  }
  private mapSeverity(status: string): Severity {
    switch (status) {
      case 'success':
        return Severity.Success;
      case 'failed':
        return Severity.Error;
      case 'running':
        return Severity.Information;
      case 'cancelled':
        return Severity.Warning;
      default:
        return Severity.Information;
    }
  }
}
