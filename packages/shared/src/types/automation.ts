import type { AutomationStatus } from '../enums/status.js';
import type { Priority } from '../enums/priority.js';
import type { CompositeOperator } from './rule.js';

export interface AutomationDefinition {
  id: string;
  workspaceId: string;
  name: string;
  description: string;
  enabled: boolean;
  trigger: AutomationTrigger;
  conditions: AutomationCondition[];
  actions: AutomationAction[];
  cooldownSeconds: number;
  maxRetry: number;
  timeoutSeconds: number;
  requiresApproval: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AutomationTrigger {
  type: TriggerType;
  eventCategory: string;
  eventType: string;
  scheduleCron: string | null;
  scheduleIntervalMs: number | null;
}

export enum TriggerType {
  Event = 'event',
  Schedule = 'schedule',
  Manual = 'manual',
  Webhook = 'webhook',
}

export interface AutomationCondition {
  field: string;
  operator: ConditionOperator;
  value: unknown;
}

export enum ConditionOperator {
  Equals = 'equals',
  NotEquals = 'notEquals',
  GreaterThan = 'greaterThan',
  GreaterThanOrEqual = 'greaterThanOrEqual',
  LessThan = 'lessThan',
  LessThanOrEqual = 'lessThanOrEqual',
  Contains = 'contains',
  NotContains = 'notContains',
  StartsWith = 'startsWith',
  EndsWith = 'endsWith',
  IsTrue = 'isTrue',
  IsFalse = 'isFalse',
  IsPresent = 'isPresent',
  IsAbsent = 'isAbsent',
  InRange = 'inRange',
  Matches = 'matches',
}

export interface CompositeCondition {
  operator: CompositeOperator;
  conditions: AutomationCondition[];
  subConditions: CompositeCondition[];
}

export interface AutomationAction {
  type: ActionType;
  config: Record<string, unknown>;
  timeoutSeconds: number;
  rollbackAction: AutomationAction | null;
}

export enum ActionType {
  RestartService = 'restartService',
  RestartDocker = 'restartDocker',
  CleanCache = 'cleanCache',
  RunScript = 'runScript',
  SendWebhook = 'sendWebhook',
  SendNotification = 'sendNotification',
  StartTunnel = 'startTunnel',
  StopTunnel = 'stopTunnel',
  TriggerBackup = 'triggerBackup',
  GitHubSync = 'githubSync',
  Delay = 'delay',
  Wait = 'wait',
  Custom = 'custom',
}

export interface AutomationExecution {
  id: string;
  workspaceId: string;
  serverId: string;
  automationId: string;
  triggerEvent: unknown;
  status: AutomationStatus;
  priority: Priority;
  retryCount: number;
  maxRetry: number;
  startedAt: string | null;
  completedAt: string | null;
  durationMs: number;
  result: string | null;
  errorDetails: string | null;
  correlationId: string;
  createdAt: string;
}

export interface ExecutionContext {
  executionId: string;
  workspaceId: string;
  serverId: string;
  automationId: string;
  triggerType: TriggerType;
  triggerEvent: unknown;
  correlationId: string;
  startedAt: string;
  retryCount: number;
  maxRetry: number;
}

export interface ExecutionStep {
  id: string;
  executionId: string;
  stepIndex: number;
  actionType: ActionType;
  status: AutomationStatus;
  startedAt: string | null;
  completedAt: string | null;
  durationMs: number;
  result: string | null;
  errorDetails: string | null;
  rollbackStatus: AutomationStatus | null;
}

export interface AutomationExecutionDetail {
  execution: AutomationExecution;
  steps: ExecutionStep[];
}

export interface AutomationStats {
  totalAutomations: number;
  enabledAutomations: number;
  totalExecutions: number;
  successRate: number;
  failureRate: number;
  averageExecutionMs: number;
  recentExecutions: AutomationExecution[];
}

export interface WebhookPayload {
  automationId: string;
  workspaceId: string;
  serverId: string;
  secret: string;
  body: Record<string, unknown>;
  headers: Record<string, string>;
  timestamp: string;
}
