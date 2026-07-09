export interface AIRequest {
  id: string;
  workspaceId: string;
  serverId: string;
  provider: string;
  model: string;
  promptTokens: number;
  maxTokens: number;
  timeoutSeconds: number;
  context: AIContext;
  createdAt: string;
}

export interface AIContext {
  eventType: string;
  metricValues: Record<string, number>;
  healthScore: number;
  activeAlerts: string[];
  recentAutomation: string[];
}

export interface AIResponse {
  id: string;
  requestId: string;
  provider: string;
  model: string;
  status: AIResponseStatus;
  summary: string | null;
  diagnosis: string | null;
  recommendation: string | null;
  confidence: number;
  tokensUsed: number;
  latencyMs: number;
  costEstimate: number;
  errorDetails: string | null;
  completedAt: string | null;
}

export enum AIResponseStatus {
  Pending = 'pending',
  Processing = 'processing',
  Success = 'success',
  Timeout = 'timeout',
  Failed = 'failed',
  Cancelled = 'cancelled',
}
