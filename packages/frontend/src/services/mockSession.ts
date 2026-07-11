export interface SessionRecord {
  id: string;
  name: string;
  type: 'web' | 'api' | 'ssh' | 'cli';
  ip: string;
  location: string;
  device: string;
  browser: string;
  os: string;
  created: string;
  lastActive: string;
  expiresAt: string;
  isCurrent: boolean;
  isTrusted: boolean;
  status: 'active' | 'expired' | 'revoked';
}
export interface SessionSummary {
  totalSessions: number;
  activeSessions: number;
  expiredSessions: number;
  revokedSessions: number;
  webSessions: number;
  apiSessions: number;
  sshSessions: number;
  cliSessions: number;
  trustedDevices: number;
  currentSession: string;
}
export interface SessionData {
  summary: SessionSummary;
  sessions: SessionRecord[];
}
function minutesAgo(m: number) { return new Date(Date.now() - m * 60000).toISOString(); }
function hoursLater(h: number) { return new Date(Date.now() + h * 3600000).toISOString(); }
export function getMockSessionData(): SessionData {
  return {
    summary: {
      totalSessions: 8,
      activeSessions: 4,
      expiredSessions: 3,
      revokedSessions: 1,
      webSessions: 3,
      apiSessions: 2,
      sshSessions: 2,
      cliSessions: 1,
      trustedDevices: 2,
      currentSession: 's1',
    },
    sessions: [
      { id: 's1', name: 'Current Session', type: 'web', ip: '10.0.0.1', location: 'Jakarta, ID', device: 'MacBook Pro', browser: 'Chrome 124', os: 'macOS 15.0', created: minutesAgo(1440), lastActive: minutesAgo(2), expiresAt: hoursLater(12), isCurrent: true, isTrusted: true, status: 'active' },
      { id: 's2', name: 'Office Desktop', type: 'web', ip: '10.0.0.50', location: 'Bandung, ID', device: 'Desktop PC', browser: 'Firefox 126', os: 'Windows 11', created: minutesAgo(4320), lastActive: minutesAgo(480), expiresAt: hoursLater(360), isCurrent: false, isTrusted: true, status: 'active' },
      { id: 's3', name: 'Mobile Browser', type: 'web', ip: '10.0.0.100', location: 'Jakarta, ID', device: 'iPhone 16', browser: 'Safari 18', os: 'iOS 18', created: minutesAgo(2880), lastActive: minutesAgo(1440), expiresAt: hoursLater(240), isCurrent: false, isTrusted: false, status: 'active' },
      { id: 's4', name: 'API Token - Production', type: 'api', ip: '45.33.32.156', location: 'San Francisco, US', device: 'API Server', browser: 'N/A', os: 'Ubuntu 24.04', created: minutesAgo(43200), lastActive: minutesAgo(60), expiresAt: hoursLater(8760), isCurrent: false, isTrusted: true, status: 'active' },
      { id: 's5', name: 'SSH Session - Server 1', type: 'ssh', ip: '10.0.0.10', location: 'Jakarta, ID', device: 'Server Terminal', browser: 'N/A', os: 'Ubuntu 24.04', created: minutesAgo(60), lastActive: minutesAgo(30), expiresAt: hoursLater(12), isCurrent: false, isTrusted: false, status: 'active' },
      { id: 's6', name: 'Old Browser Session', type: 'web', ip: '203.0.113.50', location: 'Singapore, SG', device: 'Unknown', browser: 'Chrome 120', os: 'Windows 10', created: minutesAgo(10080), lastActive: minutesAgo(10080), expiresAt: minutesAgo(1), isCurrent: false, isTrusted: false, status: 'expired' },
      { id: 's7', name: 'CLI Local Session', type: 'cli', ip: '127.0.0.1', location: 'Local', device: 'Development Server', browser: 'N/A', os: 'Ubuntu 24.04', created: minutesAgo(43200), lastActive: minutesAgo(21600), expiresAt: minutesAgo(21600), isCurrent: false, isTrusted: false, status: 'expired' },
      { id: 's8', name: 'Compromised Token', type: 'api', ip: '185.220.101.42', location: 'Moscow, RU', device: 'Unknown', browser: 'Unknown', os: 'Unknown', created: minutesAgo(1440), lastActive: minutesAgo(720), expiresAt: hoursLater(720), isCurrent: false, isTrusted: false, status: 'revoked' },
    ],
  };
}
