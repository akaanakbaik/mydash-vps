export interface SecurityThreat {
  id: string;
  type: string;
  source: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  status: 'active' | 'resolved' | 'investigating';
  timestamp: string;
  details: string;
}
export interface SecurityEvent {
  id: string;
  event: string;
  user: string;
  ip: string;
  location: string;
  device: string;
  browser: string;
  timestamp: string;
  status: 'success' | 'failed' | 'blocked';
  severity: 'low' | 'medium' | 'high' | 'critical';
}
export interface SecurityRecommendation {
  id: string;
  title: string;
  description: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  category: string;
  resolved: boolean;
}
export interface SecurityData {
  summary: {
    totalThreats: number;
    activeThreats: number;
    resolvedThreats: number;
    securityScore: number;
    failedLogins: number;
    bruteForceAttempts: number;
    openPorts: number;
    lastScan: string;
    firewallActive: boolean;
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
    criticalAlerts: number;
    mediumAlerts: number;
    resolvedAlerts: number;
    unresolvedAlerts: number;
  };
  threats: SecurityThreat[];
  events: SecurityEvent[];
  recommendations: SecurityRecommendation[];
  firewall: {
    enabled: boolean;
    rulesCount: number;
    blockedIps: number;
    allowedPorts: string[];
  };
  passwordPolicy: {
    minLength: number;
    requireUppercase: boolean;
    requireNumbers: boolean;
    requireSymbols: boolean;
    expiryDays: number;
    preventReuse: number;
  };
  timeline: { timestamp: string; value: number; type: 'login' | 'threat' | 'blocked' }[];
  filterTypes: { id: string; label: string }[];
}
function minutesAgo(m: number) { return new Date(Date.now() - m * 60000).toISOString(); }
export function getMockSecurityData(): SecurityData {
  return {
    summary: {
      totalThreats: 47,
      activeThreats: 3,
      resolvedThreats: 44,
      securityScore: 82,
      failedLogins: 128,
      bruteForceAttempts: 34,
      openPorts: 6,
      lastScan: minutesAgo(30),
      firewallActive: true,
      riskLevel: 'medium',
      criticalAlerts: 2,
      mediumAlerts: 8,
      resolvedAlerts: 44,
      unresolvedAlerts: 3,
    },
    threats: [
      { id: 't1', type: 'Brute Force', source: '185.220.101.42', severity: 'critical', status: 'active', timestamp: minutesAgo(5), details: 'SSH brute force attack detected — 1,247 attempts in 5 minutes' },
      { id: 't2', type: 'Unauthorized Access', source: '10.0.0.105', severity: 'high', status: 'investigating', timestamp: minutesAgo(60), details: 'Suspicious API access from unknown internal IP' },
      { id: 't3', type: 'Port Scan', source: '203.0.113.50', severity: 'medium', status: 'active', timestamp: minutesAgo(120), details: 'Port scanning detected — 15 ports probed' },
      { id: 't4', type: 'Malware Detection', source: '/var/www/uploads', severity: 'critical', status: 'resolved', timestamp: minutesAgo(1440), details: 'Suspicious PHP file detected and quarantined' },
      { id: 't5', type: 'DDoS Attempt', source: 'Various', severity: 'high', status: 'resolved', timestamp: minutesAgo(2880), details: 'Layer 7 DDoS attack mitigated by rate limiting' },
    ],
    events: [
      { id: 'e1', event: 'Login Failed', user: 'admin', ip: '192.168.1.100', location: 'Jakarta, ID', device: 'Chrome on Windows', browser: 'Chrome 124', timestamp: minutesAgo(2), status: 'failed', severity: 'medium' },
      { id: 'e2', event: 'Login Failed', user: 'root', ip: '185.220.101.42', location: 'Moscow, RU', device: 'Unknown', browser: 'Unknown', timestamp: minutesAgo(5), status: 'blocked', severity: 'critical' },
      { id: 'e3', event: 'Password Changed', user: 'operator1', ip: '10.0.0.50', location: 'Bandung, ID', device: 'Firefox on Linux', browser: 'Firefox 126', timestamp: minutesAgo(30), status: 'success', severity: 'low' },
      { id: 'e4', event: '2FA Enabled', user: 'developer2', ip: '10.0.0.51', location: 'Surabaya, ID', device: 'Safari on macOS', browser: 'Safari 18', timestamp: minutesAgo(120), status: 'success', severity: 'low' },
      { id: 'e5', event: 'SSH Key Added', user: 'admin', ip: '10.0.0.1', location: 'Jakarta, ID', device: 'Terminal', browser: 'N/A', timestamp: minutesAgo(240), status: 'failed', severity: 'high' },
      { id: 'e6', event: 'Firewall Rule Changed', user: 'admin', ip: '10.0.0.1', location: 'Jakarta, ID', device: 'Chrome on macOS', browser: 'Chrome 124', timestamp: minutesAgo(480), status: 'success', severity: 'medium' },
      { id: 'e7', event: 'Suspicious API Call', user: 'api-token-3', ip: '45.33.32.156', location: 'San Francisco, US', device: 'API Client', browser: 'N/A', timestamp: minutesAgo(720), status: 'blocked', severity: 'high' },
      { id: 'e8', event: 'Login Success', user: 'admin', ip: '10.0.0.1', location: 'Jakarta, ID', device: 'Chrome on macOS', browser: 'Chrome 124', timestamp: minutesAgo(1440), status: 'success', severity: 'low' },
    ],
    recommendations: [
      { id: 'r1', title: 'Enable 2FA for All Users', description: 'Two-factor authentication is not enabled for 3 users', priority: 'critical', category: 'authentication', resolved: false },
      { id: 'r2', title: 'Update Password Policy', description: 'Minimum password length should be increased to 12 characters', priority: 'high', category: 'password', resolved: false },
      { id: 'r3', title: 'Close Unused Ports', description: 'Ports 6379, 8080, and 9000 are exposed but unused', priority: 'high', category: 'network', resolved: false },
      { id: 'r4', title: 'Review SSH Keys', description: '3 SSH keys have not been rotated in over 90 days', priority: 'medium', category: 'access', resolved: true },
      { id: 'r5', title: 'Enable Audit Logging', description: 'Audit logging is not enabled for file system changes', priority: 'medium', category: 'logging', resolved: false },
      { id: 'r6', title: 'Configure IP Whitelist', description: 'Admin panel should only be accessible from trusted IPs', priority: 'low', category: 'network', resolved: true },
    ],
    firewall: {
      enabled: true,
      rulesCount: 24,
      blockedIps: 156,
      allowedPorts: ['22', '80', '443', '8080', '9001'],
    },
    passwordPolicy: {
      minLength: 8,
      requireUppercase: true,
      requireNumbers: true,
      requireSymbols: false,
      expiryDays: 90,
      preventReuse: 5,
    },
    timeline: Array.from({ length: 24 }).map((_, i) => ({
      timestamp: minutesAgo(24 - i),
      value: Math.floor(Math.random() * 10),
      type: (['login', 'threat', 'blocked'] as const)[Math.floor(Math.random() * 3)],
    })),
    filterTypes: [
      { id: 'all', label: 'All Events' },
      { id: 'critical', label: 'Critical' },
      { id: 'high', label: 'High' },
      { id: 'medium', label: 'Medium' },
      { id: 'low', label: 'Low' },
    ],
  };
}
