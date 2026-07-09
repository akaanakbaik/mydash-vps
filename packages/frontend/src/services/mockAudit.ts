// Mock Audit data provider — replace with real Audit Engine later.

export interface AuditRecord {
  id: string;
  user: string;
  action: string;
  resource: string;
  resourceId: string;
  ip: string;
  location: string;
  device: string;
  browser: string;
  sessionId: string;
  correlationId: string;
  timestamp: string;
  status: 'success' | 'failed';
  details: string;
  changes?: { field: string; oldValue: string; newValue: string }[];
}

export interface AuditSummary {
  totalEvents: number;
  successEvents: number;
  failedEvents: number;
  uniqueUsers: number;
  uniqueActions: number;
  uniqueResources: number;
  lastEvent: string;
}

export interface AuditData {
  summary: AuditSummary;
  records: AuditRecord[];
  timeline: { timestamp: string; success: number; failed: number }[];
  filterActions: { id: string; label: string }[];
  filterResources: { id: string; label: string }[];
  filterUsers: { id: string; label: string }[];
}

function minutesAgo(m: number) { return new Date(Date.now() - m * 60000).toISOString(); }

export function getMockAuditData(): AuditData {
  const users = ['admin', 'operator1', 'developer2', 'viewer1', 'root'];
  const actions = ['create', 'read', 'update', 'delete', 'login', 'logout', 'export', 'import'];
  const resources = ['server', 'backup', 'docker', 'tunnel', 'config', 'user', 'role', 'notification', 'automation'];

  const records: AuditRecord[] = Array.from({ length: 30 }).map((_, i) => {
    const user = users[Math.floor(Math.random() * users.length)];
    const action = actions[Math.floor(Math.random() * actions.length)];
    const resource = resources[Math.floor(Math.random() * resources.length)];
    const isFailed = Math.random() > 0.85;
    const devices = ['Chrome on Windows', 'Firefox on Linux', 'Safari on macOS', 'Terminal', 'API Client'];
    const browsers = ['Chrome 124', 'Firefox 126', 'Safari 18', 'N/A'];
    const locations = ['Jakarta, ID', 'Bandung, ID', 'Surabaya, ID', 'San Francisco, US', 'Singapore, SG'];
    const ips = ['10.0.0.1', '10.0.0.50', '10.0.0.51', '45.33.32.156', '185.220.101.42'];
    return {
      id: `audit-${String(i + 1)}`,
      user,
      action,
      resource,
      resourceId: `${resource}-${String(Math.floor(Math.random() * 100))}`,
      ip: ips[Math.floor(Math.random() * ips.length)],
      location: locations[Math.floor(Math.random() * locations.length)],
      device: devices[Math.floor(Math.random() * devices.length)],
      browser: browsers[Math.floor(Math.random() * browsers.length)],
      sessionId: `sess-${Math.random().toString(36).slice(2, 10)}`,
      correlationId: `corr-${Math.random().toString(36).slice(2, 10)}`,
      timestamp: minutesAgo(i * 60 + Math.floor(Math.random() * 60)),
      status: isFailed ? 'failed' : 'success',
      details: `${action.charAt(0).toUpperCase() + action.slice(1)} ${resource} ${isFailed ? 'failed' : 'completed'}`,
      changes: action === 'update' ? [
        { field: 'status', oldValue: 'inactive', newValue: 'active' },
        { field: 'config', oldValue: 'v1.0', newValue: 'v2.0' },
      ] : undefined,
    };
  });

  return {
    summary: {
      totalEvents: records.length,
      successEvents: records.filter((r) => r.status === 'success').length,
      failedEvents: records.filter((r) => r.status === 'failed').length,
      uniqueUsers: new Set(records.map((r) => r.user)).size,
      uniqueActions: new Set(records.map((r) => r.action)).size,
      uniqueResources: new Set(records.map((r) => r.resource)).size,
      lastEvent: records[0]?.timestamp ?? '',
    },
    records,
    timeline: Array.from({ length: 24 }).map((_, i) => ({
      timestamp: minutesAgo(24 - i),
      success: Math.floor(Math.random() * 8) + 2,
      failed: Math.floor(Math.random() * 3),
    })),
    filterActions: [
      { id: 'all', label: 'All Actions' },
      ...actions.map((a) => ({ id: a, label: a.charAt(0).toUpperCase() + a.slice(1) })),
    ],
    filterResources: [
      { id: 'all', label: 'All Resources' },
      ...resources.map((r) => ({ id: r, label: r.charAt(0).toUpperCase() + r.slice(1) })),
    ],
    filterUsers: [
      { id: 'all', label: 'All Users' },
      ...users.map((u) => ({ id: u, label: u })),
    ],
  };
}
