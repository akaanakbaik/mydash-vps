// Mock notification data provider — replace with real Notification Engine later.

export interface NotificationSummary {
  totalSent: number;
  delivered: number;
  failed: number;
  pending: number;
  rateLimited: number;
  successRate: number;
}

export interface NotificationRule {
  id: string;
  name: string;
  condition: string;
  provider: string;
  enabled: boolean;
  priority: 'low' | 'medium' | 'high' | 'critical';
  lastTriggered: string | null;
  triggerCount: number;
}

export interface NotificationProviderInfo {
  name: string;
  type: 'dashboard' | 'telegram' | 'whatsapp';
  enabled: boolean;
  status: 'connected' | 'disconnected' | 'error' | 'unknown';
  latency: number;
  lastUsed: string;
  errorMessage?: string;
}

export interface DeliveryStats {
  period: string;
  total: number;
  success: number;
  failed: number;
  avgLatency: number;
  p95Latency: number;
}

export interface NotificationHistoryRow {
  id: number;
  timestamp: string;
  title: string;
  message: string;
  provider: string;
  status: 'delivered' | 'failed' | 'pending' | 'rate_limited' | 'deduplicated';
  category: string;
  severity: 'info' | 'success' | 'warning' | 'error';
  retryCount: number;
  latency: number;
}

export interface QueueInfo {
  pending: number;
  processing: number;
  throughput: number;
  avgWaitTime: number;
  maxQueueSize: number;
  backpressure: boolean;
}

export interface RetryInfo {
  activeRetries: number;
  maxRetries: number;
  successRate: number;
  avgRetryDelay: number;
  nextRetryBatch: string;
  deadLetterCount: number;
}

export interface RateLimitInfo {
  currentRate: number;
  limit: number;
  remaining: number;
  resetAt: string;
  throttled: number;
}

export interface DeduplicationInfo {
  enabled: boolean;
  window: number;
  deduplicated: number;
  recentHashes: number;
}

export interface NotificationTemplate {
  id: string;
  name: string;
  provider: string;
  preview: string;
  lastUsed: string;
  useCount: number;
}

export interface NotificationTimelinePoint {
  timestamp: string;
  sent: number;
  delivered: number;
  failed: number;
}

export interface NotificationActivity {
  id: string;
  type: 'sent' | 'delivered' | 'failed' | 'rate_limited' | 'deduplicated' | 'retry' | 'provider_error';
  message: string;
  timestamp: string;
  severity: 'info' | 'success' | 'warning' | 'error';
  provider: string;
}

export interface NotificationData {
  summary: NotificationSummary;
  rules: NotificationRule[];
  providers: NotificationProviderInfo[];
  deliveryStats: DeliveryStats[];
  history: NotificationHistoryRow[];
  queue: QueueInfo;
  retry: RetryInfo;
  rateLimit: RateLimitInfo;
  deduplication: DeduplicationInfo;
  templates: NotificationTemplate[];
  timeline: NotificationTimelinePoint[];
  activity: NotificationActivity[];
  filterCategories: { id: string; label: string }[];
}

function minutesAgo(m: number): string {
  return new Date(Date.now() - m * 60000).toISOString();
}

export function getMockNotificationData(): NotificationData {
  return {
    summary: {
      totalSent: 1284,
      delivered: 1242,
      failed: 26,
      pending: 16,
      rateLimited: 12,
      successRate: 96.7,
    },
    rules: [
      { id: 'r1', name: 'CPU Threshold Warning', condition: 'CPU > 80% for 5m', provider: 'Telegram', enabled: true, priority: 'high', lastTriggered: minutesAgo(30), triggerCount: 42 },
      { id: 'r2', name: 'Disk Space Alert', condition: 'Disk usage > 90%', provider: 'Telegram', enabled: true, priority: 'critical', lastTriggered: minutesAgo(120), triggerCount: 18 },
      { id: 'r3', name: 'Tunnel Disconnect', condition: 'Tunnel status = disconnected', provider: 'WhatsApp', enabled: true, priority: 'critical', lastTriggered: minutesAgo(240), triggerCount: 7 },
      { id: 'r4', name: 'Memory Pressure', condition: 'Available RAM < 20%', provider: 'Dashboard', enabled: true, priority: 'medium', lastTriggered: minutesAgo(480), triggerCount: 23 },
      { id: 'r5', name: 'Daily Summary', condition: 'Every 24h at 08:00', provider: 'Telegram', enabled: false, priority: 'low', lastTriggered: null, triggerCount: 156 },
      { id: 'r6', name: 'Docker Restart Alert', condition: 'Container restart > 3/h', provider: 'Dashboard', enabled: true, priority: 'medium', lastTriggered: minutesAgo(1440), triggerCount: 5 },
    ],
    providers: [
      { name: 'Dashboard', type: 'dashboard', enabled: true, status: 'connected', latency: 0, lastUsed: minutesAgo(0.5) },
      { name: 'Telegram', type: 'telegram', enabled: true, status: 'connected', latency: 245, lastUsed: minutesAgo(1) },
      { name: 'WhatsApp', type: 'whatsapp', enabled: true, status: 'connected', latency: 320, lastUsed: minutesAgo(5) },
    ],
    deliveryStats: [
      { period: 'Last Hour', total: 48, success: 46, failed: 2, avgLatency: 180, p95Latency: 420 },
      { period: 'Last 24h', total: 284, success: 276, failed: 8, avgLatency: 195, p95Latency: 480 },
      { period: 'Last 7d', total: 1284, success: 1242, failed: 26, avgLatency: 210, p95Latency: 520 },
      { period: 'Last 30d', total: 5210, success: 5088, failed: 122, avgLatency: 205, p95Latency: 510 },
    ],
    history: [
      { id: 1, timestamp: minutesAgo(2), title: 'CPU Threshold Warning', message: 'CPU usage reached 85% for over 5 minutes', provider: 'Telegram', status: 'delivered', category: 'System', severity: 'warning', retryCount: 0, latency: 210 },
      { id: 2, timestamp: minutesAgo(5), title: 'Tunnel Reconnected', message: 'Cloudflare tunnel re-established connection', provider: 'WhatsApp', status: 'delivered', category: 'Network', severity: 'success', retryCount: 1, latency: 850 },
      { id: 3, timestamp: minutesAgo(10), title: 'Disk Usage Warning', message: 'Root partition at 85% capacity', provider: 'Dashboard', status: 'delivered', category: 'Storage', severity: 'warning', retryCount: 0, latency: 0 },
      { id: 4, timestamp: minutesAgo(15), title: 'High Memory Usage', message: 'Memory usage at 78%, swap activity increasing', provider: 'Telegram', status: 'failed', category: 'System', severity: 'error', retryCount: 3, latency: 0 },
      { id: 5, timestamp: minutesAgo(20), title: 'Docker Container Stopped', message: 'Container redis-cache stopped unexpectedly', provider: 'Dashboard', status: 'delivered', category: 'Docker', severity: 'warning', retryCount: 0, latency: 0 },
      { id: 6, timestamp: minutesAgo(30), title: 'Backup Completed', message: 'Weekly backup completed successfully (2.4 GB)', provider: 'Telegram', status: 'delivered', category: 'System', severity: 'success', retryCount: 0, latency: 180 },
      { id: 7, timestamp: minutesAgo(45), title: 'Rate Limit Warning', message: 'Approaching rate limit for Telegram provider', provider: 'Dashboard', status: 'delivered', category: 'System', severity: 'info', retryCount: 0, latency: 0 },
      { id: 8, timestamp: minutesAgo(60), title: 'CPU Spike Detected', message: 'CPU spiked to 97% during database maintenance', provider: 'WhatsApp', status: 'rate_limited', category: 'System', severity: 'warning', retryCount: 0, latency: 0 },
      { id: 9, timestamp: minutesAgo(120), title: 'Service Restarted', message: 'nginx service auto-restarted after failure', provider: 'Telegram', status: 'delivered', category: 'Service', severity: 'warning', retryCount: 2, latency: 310 },
      { id: 10, timestamp: minutesAgo(240), title: 'Disk Space Critical', message: 'Root partition at 92% — immediate action required', provider: 'WhatsApp', status: 'pending', category: 'Storage', severity: 'error', retryCount: 0, latency: 0 },
    ],
    queue: {
      pending: 16,
      processing: 3,
      throughput: 12.5,
      avgWaitTime: 4.2,
      maxQueueSize: 100,
      backpressure: false,
    },
    retry: {
      activeRetries: 5,
      maxRetries: 3,
      successRate: 78.5,
      avgRetryDelay: 30,
      nextRetryBatch: minutesAgo(-2),
      deadLetterCount: 8,
    },
    rateLimit: {
      currentRate: 18,
      limit: 30,
      remaining: 12,
      resetAt: minutesAgo(-58),
      throttled: 3,
    },
    deduplication: {
      enabled: true,
      window: 60,
      deduplicated: 45,
      recentHashes: 128,
    },
    templates: [
      { id: 't1', name: 'CPU Alert Template', provider: 'Telegram', preview: '⚠ CPU Alert: {{metric}} reached {{value}}%', lastUsed: minutesAgo(30), useCount: 42 },
      { id: 't2', name: 'Disk Warning', provider: 'Telegram', preview: '🟡 Disk {{mount}}: {{used}}/{{total}} ({{percent}}%)', lastUsed: minutesAgo(120), useCount: 18 },
      { id: 't3', name: 'WhatsApp Critical', provider: 'WhatsApp', preview: '🔴 CRITICAL: {{title}}\nServer: {{hostname}}\nDetails: {{message}}', lastUsed: minutesAgo(240), useCount: 7 },
      { id: 't4', name: 'Dashboard Notification', provider: 'Dashboard', preview: '{{icon}} {{title}} — {{message}}', lastUsed: minutesAgo(10), useCount: 156 },
    ],
    timeline: Array.from({ length: 24 }).map((_, i) => {
      const sent = Math.round(10 + Math.sin(i * 0.5) * 5 + 3);
      const failed = Math.round(Math.random() * 2);
      return {
        timestamp: minutesAgo(24 - i),
        sent,
        delivered: sent - failed,
        failed,
      };
    }),
    activity: [
      { id: 'a1', type: 'sent', message: 'CPU warning sent to Telegram', timestamp: minutesAgo(2), severity: 'info', provider: 'Telegram' },
      { id: 'a2', type: 'delivered', message: 'Tunnel alert delivered via WhatsApp', timestamp: minutesAgo(5), severity: 'success', provider: 'WhatsApp' },
      { id: 'a3', type: 'failed', message: 'High memory alert failed to send (Telegram timeout)', timestamp: minutesAgo(15), severity: 'error', provider: 'Telegram' },
      { id: 'a4', type: 'retry', message: 'Retrying failed Telegram notification (attempt 2/3)', timestamp: minutesAgo(14), severity: 'warning', provider: 'Telegram' },
      { id: 'a5', type: 'rate_limited', message: 'WhatsApp provider rate limited, throttling enabled', timestamp: minutesAgo(20), severity: 'warning', provider: 'WhatsApp' },
      { id: 'a6', type: 'deduplicated', message: 'Duplicate CPU alert suppressed (same hash within 60s window)', timestamp: minutesAgo(25), severity: 'info', provider: 'Dashboard' },
      { id: 'a7', type: 'provider_error', message: 'Telegram API returned 429 Too Many Requests', timestamp: minutesAgo(30), severity: 'error', provider: 'Telegram' },
      { id: 'a8', type: 'sent', message: 'Backup completion notification sent to all providers', timestamp: minutesAgo(45), severity: 'success', provider: 'Dashboard' },
    ],
    filterCategories: [
      { id: 'all', label: 'All' },
      { id: 'system', label: 'System' },
      { id: 'network', label: 'Network' },
      { id: 'storage', label: 'Storage' },
      { id: 'docker', label: 'Docker' },
      { id: 'service', label: 'Service' },
    ],
  };
}
