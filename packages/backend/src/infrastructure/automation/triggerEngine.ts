import type { TriggerEngine, ValidateTriggerResult } from '../../domain/automation/services.js';
import type { AutomationDefinition, ExecutionContext } from '../../domain/automation/valueObjects.js';
import type { DomainEvent } from '@mydash/shared';
import { TriggerType } from '@mydash/shared';
export class TriggerEngineImpl implements TriggerEngine {
  evaluateTrigger(
    definition: AutomationDefinition,
    event: DomainEvent | null,
    triggerType: TriggerType,
    _context: Omit<ExecutionContext, 'startedAt' | 'executionId'>,
  ): Promise<ValidateTriggerResult> {
    const defTrigger = definition.trigger;
    if (defTrigger.type !== triggerType) {
      return Promise.resolve({ matched: false, confidence: 100, reason: 'trigger type mismatch' });
    }
    switch (triggerType) {
      case TriggerType.Event:
        return Promise.resolve(this.evaluateEventTrigger(defTrigger, event));
      case TriggerType.Schedule:
        return Promise.resolve(this.evaluateScheduleTrigger(defTrigger));
      case TriggerType.Manual:
        return Promise.resolve({ matched: true, confidence: 100, reason: null });
      case TriggerType.Webhook:
        return Promise.resolve(this.evaluateWebhookTrigger(defTrigger, event));
      default:
        return Promise.resolve({ matched: false, confidence: 0, reason: 'unknown trigger type' });
    }
  }
  private evaluateEventTrigger(
    defTrigger: AutomationDefinition['trigger'],
    event: DomainEvent | null,
  ): ValidateTriggerResult {
    if (!event) {
      return { matched: false, confidence: 100, reason: 'no event provided' };
    }
    const eventType = event.envelope.eventType;
    const eventCategory = event.category as string | undefined || '';
    const categoryMatch = !defTrigger.eventCategory || eventCategory === defTrigger.eventCategory;
    const eventTypeMatch = !defTrigger.eventType || eventType === defTrigger.eventType;
    if (categoryMatch && eventTypeMatch) {
      return { matched: true, confidence: 90, reason: 'event matched trigger criteria' };
    }
    return { matched: false, confidence: 90, reason: 'event did not match trigger criteria' };
  }
  private evaluateScheduleTrigger(
    _defTrigger: AutomationDefinition['trigger'],
  ): ValidateTriggerResult {
    return { matched: true, confidence: 95, reason: 'scheduled trigger activated' };
  }
  private evaluateWebhookTrigger(
    _defTrigger: AutomationDefinition['trigger'],
    _event: DomainEvent | null,
  ): ValidateTriggerResult {
    return { matched: true, confidence: 95, reason: 'webhook trigger activated' };
  }
}
