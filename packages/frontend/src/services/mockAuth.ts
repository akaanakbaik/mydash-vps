export interface LoginAttempt {
  id: string;
  username: string;
  timestamp: string;
  ip: string;
  location: string;
  device: string;
  status: 'success' | 'failed' | 'blocked';
  reason?: string;
}
export interface AuthData {
  isAuthenticated: boolean;
  rememberMe: boolean;
  loginAttempts: LoginAttempt[];
  recentLogins: LoginAttempt[];
  failedCount: number;
}
function minutesAgo(m: number) { return new Date(Date.now() - m * 60000).toISOString(); }
export function getMockAuthData(): AuthData {
  return {
    isAuthenticated: false,
    rememberMe: false,
    loginAttempts: [
      { id: 'la1', username: 'admin', timestamp: minutesAgo(2), ip: '10.0.0.1', location: 'Jakarta, ID', device: 'Chrome on macOS', status: 'success' },
      { id: 'la2', username: 'admin', timestamp: minutesAgo(5), ip: '185.220.101.42', location: 'Moscow, RU', device: 'Unknown', status: 'blocked', reason: 'Suspicious IP' },
      { id: 'la3', username: 'operator1', timestamp: minutesAgo(30), ip: '10.0.0.50', location: 'Bandung, ID', device: 'Firefox on Linux', status: 'failed', reason: 'Invalid password' },
      { id: 'la4', username: 'root', timestamp: minutesAgo(60), ip: '45.33.32.156', location: 'San Francisco, US', device: 'Terminal', status: 'failed', reason: 'Invalid credentials' },
      { id: 'la5', username: 'developer2', timestamp: minutesAgo(120), ip: '10.0.0.51', location: 'Surabaya, ID', device: 'Safari on macOS', status: 'success' },
      { id: 'la6', username: 'admin', timestamp: minutesAgo(240), ip: '10.0.0.1', location: 'Jakarta, ID', device: 'Chrome on macOS', status: 'success' },
      { id: 'la7', username: 'viewer1', timestamp: minutesAgo(360), ip: '10.0.0.100', location: 'Jakarta, ID', device: 'Chrome on Windows', status: 'success' },
      { id: 'la8', username: 'operator1', timestamp: minutesAgo(480), ip: '10.0.0.50', location: 'Bandung, ID', device: 'Firefox on Linux', status: 'success' },
    ],
    recentLogins: [
      { id: 'la1', username: 'admin', timestamp: minutesAgo(2), ip: '10.0.0.1', location: 'Jakarta, ID', device: 'Chrome on macOS', status: 'success' },
      { id: 'la6', username: 'admin', timestamp: minutesAgo(240), ip: '10.0.0.1', location: 'Jakarta, ID', device: 'Chrome on macOS', status: 'success' },
      { id: 'la5', username: 'developer2', timestamp: minutesAgo(120), ip: '10.0.0.51', location: 'Surabaya, ID', device: 'Safari on macOS', status: 'success' },
    ],
    failedCount: 3,
  };
}
