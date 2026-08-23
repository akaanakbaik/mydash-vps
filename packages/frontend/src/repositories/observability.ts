import { apiClient } from '../api/client.js';

export type ObservabilityRange = '1h' | '6h' | '24h' | '7d' | '30d';
export interface ObservabilityEvent { id: string; timestamp: string; kind: string; severity: string; source: string; title: string; message: string; status: string; metadata: Record<string, unknown>; }
export interface DiskDirectory { path: string; bytes: number; sizeMb: number; percentOfRoot: number | null; }
export interface ObservabilityDisk { status: string; scope: string; filesystem: string; mount: string; totalBytes: number; usedBytes: number; availableBytes: number; usedPercent: number | null; inodeUsage: number | null; readSpeedBps: number | null; writeSpeedBps: number | null; topDirectories: DiskDirectory[]; directoryScanStatus: string; sampledAt: string; }
export interface ObservabilityService { name: string; status: string; activeState: string; enabledState: string; lastSeen: string | null; sampleCount: number; runningSamplePercent: number | null; scope: string; }
export interface ServiceAvailability { name: string; expectedBuckets: number; observedBuckets: number; coveragePercent: number; runningPercent: number | null; lastSeen: string | null; status: string; }
export interface HealthFactor { domain: string; label: string; value: number | null; unit: string; threshold: number | null; weight: number; score: number | null; penalty: number | null; status: string; evidence: string; includedInOverall: boolean; }
export interface HealthFactors { overall: number | null; grade: string; confidence: number | null; calculatedAt: string | null; factors: HealthFactor[]; explanation: string; }
export interface PeriodComparison { metric: string; current: number | null; previous: number | null; delta: number | null; deltaPercent: number | null; currentSamples: number; previousSamples: number; confidence: number; status: string; }
export interface NetworkSample { timestamp: string | null; rxBytesPerSec: number | null; txBytesPerSec: number | null; totalBytesPerSec: number | null; rateAvailable: boolean; }
export interface NetworkInterface { name: string; rxBytes: number; txBytes: number; rxGiB: number; txGiB: number; }
export interface ObservabilityNetwork { status: string; activeInterface: string; ipv4: string | null; ipv6: string | null; rxSpeed: number | null; txSpeed: number | null; totalSpeed: number | null; averageSpeed: number | null; peakSpeed: number | null; rateUnit: string; rateAvailable: boolean; sampleCount: number; dominantDirection: string; packetLoss: number | null; latencyMs: number | null; packetLossAvailable: boolean; latencyAvailable: boolean; interfaces: NetworkInterface[]; samples: NetworkSample[]; }
export interface UptimePoint { timestamp: string | null; uptimeSeconds: number | null; bootTime: string | null; heartbeat: boolean; }
export interface Availability { status: string; rangeMs: number; expectedBuckets: number; observedBuckets: number; missingBuckets: number; coveragePercent: number; lastSeen: string | null; host: { hostname: string; uptimeSeconds: number | null; uptimeFormatted: string | null; bootTime: string | null }; serviceHistory: ServiceAvailability[]; uptimePoints: UptimePoint[]; gaps: { from: string | null; to: string | null; missingBuckets: number }[]; }
export interface ObservabilityPayload { status: string; range: ObservabilityRange; generatedAt: string; events: ObservabilityEvent[]; disk: ObservabilityDisk; services: ObservabilityService[]; healthFactors: HealthFactors; comparisons: PeriodComparison[]; network: ObservabilityNetwork; availability: Availability; }
export const observabilityRepository = {
  getOverview: (range: ObservabilityRange) => apiClient.get<ObservabilityPayload>('/observability', { params: { range } }),
};
