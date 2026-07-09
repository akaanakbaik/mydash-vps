import type { Severity } from '../enums/severity.js';
import type { Priority } from '../enums/priority.js';
import type { EventCategory } from '../enums/category.js';
import type { RuleOperator } from './common.js';

export interface Rule {
  id: string;
  workspaceId: string;
  name: string;
  category: EventCategory;
  status: RuleStatus;
  priority: Priority;
  sourceMetric: string;
  operator: RuleOperator;
  threshold: number;
  durationSeconds: number;
  cooldownSeconds: number;
  maxRetry: number;
  severity: Severity;
  notificationTarget: string[];
  automationTarget: string[];
  aiAnalysis: boolean;
  description: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  version: number;
}

export enum RuleStatus {
  Active = 'active',
  Inactive = 'inactive',
  Cooldown = 'cooldown',
  Escalated = 'escalated',
}

export interface CompositeRule {
  id: string;
  workspaceId: string;
  name: string;
  rules: Rule[];
  operator: CompositeOperator;
  escalationRules: Rule[] | null;
  severity: Severity;
  priority: Priority;
  createdAt: string;
  updatedAt: string;
}

export enum CompositeOperator {
  AND = 'and',
  OR = 'or',
  NOT = 'not',
}

export interface RuleEvaluationResult {
  ruleId: string;
  matched: boolean;
  currentValue: number;
  threshold: number;
  durationMet: boolean;
  cooldownActive: boolean;
  severity: Severity;
  timestamp: string;
}
