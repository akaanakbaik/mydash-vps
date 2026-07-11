import type { AIResponse } from '@mydash/shared';
export interface AIProvider {
  analyze(context: AnalysisContext): Promise<AIResponse>;
  healthCheck(): Promise<boolean>;
}
export interface AnalysisContext {
  eventType: string;
  metricValues: Record<string, number>;
  healthScore: number;
  activeAlerts: string[];
  recentAutomation: string[];
}
