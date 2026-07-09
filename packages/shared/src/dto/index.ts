export interface WorkspaceDTO {
  name: string;
  displayName: string;
  timezone: string;
  language: string;
}

export interface ServerDTO {
  displayName: string;
  hostname: string;
  timezone: string;
}

export interface LoginDTO {
  password: string;
}

export interface NotificationRuleDTO {
  name: string;
  category: string;
  sourceMetric: string;
  operator: string;
  threshold: number;
  durationSeconds: number;
  cooldownSeconds: number;
  severity: string;
  providerTarget: string[];
  aiAnalysis: boolean;
}

export interface AutomationDTO {
  name: string;
  description: string;
  triggerType: string;
  eventCategory: string;
  actions: Record<string, unknown>[];
  cooldownSeconds: number;
  maxRetry: number;
}
