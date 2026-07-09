import type { Severity } from '../enums/severity.js';
import type { Priority } from '../enums/priority.js';
import type { DeliveryStatus } from '../enums/status.js';
import type { NotificationCategory } from '../enums/category.js';
import type { RuleOperator } from './common.js';
export { RuleOperator } from './common.js';

export interface NotificationRule {
  id: string;
  workspaceId: string;
  name: string;
  category: NotificationCategory;
  enabled: boolean;
  severity: Severity;
  priority: Priority;
  sourceMetric: string;
  operator: RuleOperator;
  threshold: number;
  durationSeconds: number;
  cooldownSeconds: number;
  maxRetry: number;
  providerTarget: NotificationProvider[];
  aiAnalysis: boolean;
  autoResolve: boolean;
  quietPeriodEnabled: boolean;
  quietPeriodStart: string;
  quietPeriodEnd: string;
  createdAt: string;
  updatedAt: string;
}

export enum NotificationProvider {
  Dashboard = 'dashboard',
  WhatsApp = 'whatsapp',
  Telegram = 'telegram',
}

export interface NotificationTemplate {
  id: string;
  workspaceId: string;
  name: string;
  category: NotificationCategory;
  severity: Severity;
  languageCode: string;
  headerTemplate: string;
  bodyTemplate: string;
  footerTemplate: string;
  version: number;
  createdAt: string;
}

export interface NotificationDelivery {
  id: string;
  workspaceId: string;
  serverId: string;
  notificationId: string;
  provider: NotificationProvider;
  status: DeliveryStatus;
  priority: Priority;
  severity: Severity;
  retryCount: number;
  maxRetry: number;
  deliveryStartedAt: string | null;
  deliveryCompletedAt: string | null;
  providerMessageId: string | null;
  errorCode: string | null;
  errorMessage: string | null;
  aiSummary: string | null;
  correlationId: string;
  createdAt: string;
}

export interface NotificationHistory {
  id: string;
  workspaceId: string;
  serverId: string;
  ruleId: string;
  templateId: string;
  deliveryId: string;
  provider: NotificationProvider;
  severity: Severity;
  category: NotificationCategory;
  messageContent: string;
  aiAnalysisUsed: boolean;
  aiSummary: string | null;
  deliveredAt: string;
  readAt: string | null;
}
