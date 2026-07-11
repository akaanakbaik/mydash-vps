export interface AnalyticsSummaryData {
  totalMetrics: number;
  metricsCollected: number;
  metricsFailed: number;
  storageUsed: number;
  storageTotal: number;
  oldestTimestamp: string;
  newestTimestamp: string;
}
export interface Aggregation {
  label: string;
  count: number;
  avg: number;
  min: number;
  max: number;
  period: string;
}
export interface TrendPoint {
  timestamp: string;
  value: number;
  movingAvg: number;
}
export interface Anomaly {
  id: string;
  metric: string;
  value: number;
  expected: number;
  deviation: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: string;
  description: string;
}
export interface Statistic {
  label: string;
  value: number;
  unit: string;
  description: string;
}
export interface PercentileData {
  p50: number;
  p75: number;
  p90: number;
  p95: number;
  p99: number;
  label: string;
}
export interface PredictionPoint {
  timestamp: string;
  predicted: number;
  lower: number;
  upper: number;
  confidence: number;
}
export interface ResourceEfficiency {
  resource: string;
  score: number;
  trend: 'up' | 'down' | 'stable';
  recommendation: string;
}
export interface AnalyticsRow {
  id: number;
  metric: string;
  category: string;
  avg: number;
  min: number;
  max: number;
  p95: number;
  count: number;
  trend: 'up' | 'down' | 'stable';
}
export interface AnalyticsData {
  summary: AnalyticsSummaryData;
  aggregations: Aggregation[];
  trend: TrendPoint[];
  anomalies: Anomaly[];
  statistics: Statistic[];
  percentiles: PercentileData[];
  predictions: PredictionPoint[];
  efficiency: ResourceEfficiency[];
  tableData: AnalyticsRow[];
  timeRange: string;
  categories: { id: string; label: string }[];
}
const now = new Date();
const ago = (m: number) => new Date(now.getTime() - m * 60000).toISOString();
const fromNow = (m: number) => new Date(now.getTime() + m * 60000).toISOString();
export function getMockAnalyticsData(): AnalyticsData {
  return {
    summary: {
      totalMetrics: 1284,
      metricsCollected: 1258,
      metricsFailed: 26,
      storageUsed: 256,
      storageTotal: 1024,
      oldestTimestamp: ago(10080),
      newestTimestamp: ago(0.5),
    },
    aggregations: [
      { label: 'CPU Usage', count: 10080, avg: 42.3, min: 8.1, max: 97.2, period: '1m' },
      { label: 'Memory Usage', count: 10080, avg: 62.5, min: 45.2, max: 88.7, period: '1m' },
      { label: 'Disk I/O', count: 10080, avg: 45.8, min: 0.5, max: 98.2, period: '1m' },
      { label: 'Network Inbound', count: 10080, avg: 35.2, min: 2.1, max: 92.4, period: '1m' },
      { label: 'Network Outbound', count: 10080, avg: 12.8, min: 0.8, max: 68.3, period: '1m' },
    ],
    trend: Array.from({ length: 168 }).map((_, i) => ({
      timestamp: ago(168 - i),
      value: 40 + Math.round(Math.sin(i * 0.1) * 15 + Math.sin(i * 0.03) * 20),
      movingAvg: 42 + Math.round(Math.sin((i - 10) * 0.03) * 12),
    })),
    anomalies: [
      { id: 'a1', metric: 'CPU Usage', value: 97.2, expected: 42.3, deviation: 2.3, severity: 'critical', timestamp: ago(120), description: 'CPU spiked to 97.2% during backup operation' },
      { id: 'a2', metric: 'Memory Usage', value: 88.7, expected: 62.5, deviation: 1.42, severity: 'high', timestamp: ago(240), description: 'Memory pressure detected during peak hours' },
      { id: 'a3', metric: 'Disk I/O', value: 92.1, expected: 45.8, deviation: 2.01, severity: 'high', timestamp: ago(480), description: 'Disk I/O spike during database vacuum' },
      { id: 'a4', metric: 'Network Latency', value: 185, expected: 3.2, deviation: 57.8, severity: 'critical', timestamp: ago(600), description: 'Network latency spike due to upstream provider issue' },
      { id: 'a5', metric: 'Packet Loss', value: 5.2, expected: 0.01, deviation: 520, severity: 'medium', timestamp: ago(1440), description: 'Elevated packet loss during tunnel reconnection' },
    ],
    statistics: [
      { label: 'Avg CPU', value: 42.3, unit: '%', description: 'Average CPU usage over the selected period' },
      { label: 'Avg Memory', value: 62.5, unit: '%', description: 'Average memory utilization' },
      { label: 'Avg Disk', value: 45.8, unit: '%', description: 'Average disk I/O utilization' },
      { label: 'Avg Latency', value: 3.2, unit: 'ms', description: 'Average network latency' },
      { label: 'Uptime', value: 99.97, unit: '%', description: 'Overall system uptime' },
    ],
    percentiles: [
      { label: 'CPU Usage', p50: 41.2, p75: 58.3, p90: 72.1, p95: 83.5, p99: 94.8 },
      { label: 'Memory Usage', p50: 61.8, p75: 72.4, p90: 81.2, p95: 86.1, p99: 88.7 },
      { label: 'Disk I/O', p50: 44.1, p75: 62.8, p90: 78.3, p95: 88.2, p99: 95.1 },
      { label: 'Network Inbound', p50: 32.4, p75: 48.7, p90: 65.2, p95: 78.9, p99: 90.2 },
      { label: 'Network Outbound', p50: 11.2, p75: 18.6, p90: 28.4, p95: 42.1, p99: 62.8 },
    ],
    predictions: Array.from({ length: 48 }).map((_, i) => {
      const base = 42 + Math.sin(i * 0.15) * 8;
      return {
        timestamp: fromNow(i * 60),
        predicted: Math.round(base * 10) / 10,
        lower: Math.round((base - 8) * 10) / 10,
        upper: Math.round((base + 8) * 10) / 10,
        confidence: Math.max(60, 95 - i * 0.5),
      };
    }),
    efficiency: [
      { resource: 'CPU', score: 78, trend: 'up', recommendation: 'Right-size instances based on usage patterns' },
      { resource: 'Memory', score: 65, trend: 'down', recommendation: 'Consider increasing available memory or optimizing cache' },
      { resource: 'Disk', score: 82, trend: 'stable', recommendation: 'Enable compression for infrequently accessed data' },
      { resource: 'Network', score: 88, trend: 'up', recommendation: 'Optimize bandwidth allocation for peak hours' },
    ],
    tableData: [
      { id: 1, metric: 'CPU Usage', category: 'System', avg: 42.3, min: 8.1, max: 97.2, p95: 83.5, count: 10080, trend: 'stable' },
      { id: 2, metric: 'Memory Usage', category: 'System', avg: 62.5, min: 45.2, max: 88.7, p95: 86.1, count: 10080, trend: 'up' },
      { id: 3, metric: 'Disk I/O Read', category: 'Storage', avg: 45.8, min: 0.5, max: 98.2, p95: 88.2, count: 10080, trend: 'down' },
      { id: 4, metric: 'Disk I/O Write', category: 'Storage', avg: 32.1, min: 0.3, max: 85.6, p95: 72.4, count: 10080, trend: 'stable' },
      { id: 5, metric: 'Network Inbound', category: 'Network', avg: 35.2, min: 2.1, max: 92.4, p95: 78.9, count: 10080, trend: 'up' },
      { id: 6, metric: 'Network Outbound', category: 'Network', avg: 12.8, min: 0.8, max: 68.3, p95: 42.1, count: 10080, trend: 'stable' },
      { id: 7, metric: 'Network Latency', category: 'Network', avg: 3.2, min: 1.1, max: 185, p95: 8.7, count: 10080, trend: 'down' },
      { id: 8, metric: 'Container CPU', category: 'Docker', avg: 18.4, min: 2.3, max: 65.8, p95: 48.2, count: 5040, trend: 'stable' },
      { id: 9, metric: 'Container Memory', category: 'Docker', avg: 35.2, min: 8.1, max: 72.4, p95: 65.1, count: 5040, trend: 'up' },
      { id: 10, metric: 'Tunnel Latency', category: 'Tunnel', avg: 5.1, min: 2.3, max: 185, p95: 12.4, count: 10080, trend: 'stable' },
    ],
    timeRange: '7d',
    categories: [
      { id: 'all', label: 'All Metrics' },
      { id: 'system', label: 'System' },
      { id: 'storage', label: 'Storage' },
      { id: 'network', label: 'Network' },
      { id: 'docker', label: 'Docker' },
      { id: 'tunnel', label: 'Tunnel' },
    ],
  };
}
