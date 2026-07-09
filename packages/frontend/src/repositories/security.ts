import { apiClient } from '../api/client.js';
import type { PaginationParams } from '../api/types.js';

export interface SecurityThreat {
  id: string; type: string; source: string; severity: string;
  status: string; timestamp: string; details: string;
}

export interface SecurityEvent {
  id: string; event: string; user: string; ip: string;
  location: string; timestamp: string; status: string; severity: string;
}

export interface SecurityRecommendation {
  id: string; title: string; description: string; priority: string;
  category: string; resolved: boolean;
}

export interface SecurityResponse {
  summary: {
    totalThreats: number; activeThreats: number; resolvedThreats: number;
    securityScore: number; failedLogins: number; bruteForceAttempts: number;
    openPorts: number; lastScan: string; firewallActive: boolean;
    riskLevel: string; criticalAlerts: number; unresolvedAlerts: number;
  };
  threats: SecurityThreat[];
  events: SecurityEvent[];
  recommendations: SecurityRecommendation[];
  firewall: { enabled: boolean; rulesCount: number; blockedIps: number; allowedPorts: string[] };
  passwordPolicy: { minLength: number; requireUppercase: boolean; requireNumbers: boolean; requireSymbols: boolean; expiryDays: number; preventReuse: number };
  timeline: { timestamp: string; value: number; type: string }[];
  filterTypes: { id: string; label: string }[];
}

export const securityRepository = {
  getAll: (params?: PaginationParams) =>
    apiClient.get<SecurityResponse>('/security', { params: params as Record<string, string | number | boolean | undefined> }),
  getEvents: (params?: PaginationParams) =>
    apiClient.get<SecurityEvent[]>('/security/events', { params: params as Record<string, string | number | boolean | undefined> }),
};
