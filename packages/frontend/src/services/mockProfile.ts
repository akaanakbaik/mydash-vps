// Mock Profile data provider — replace with real Profile Engine later.

export interface ProfileData {
  id: string;
  username: string;
  email: string;
  fullName: string;
  avatarUrl: string;
  role: string;
  department: string;
  location: string;
  bio: string;
  joinDate: string;
  lastActive: string;
  twoFactorEnabled: boolean;
  emailVerified: boolean;
  phoneNumber: string;
  apiKeys: { id: string; name: string; key: string; created: string; lastUsed: string }[];
  devices: { id: string; name: string; type: string; os: string; browser: string; lastActive: string; isCurrent: boolean }[];
  recentActivity: { id: string; action: string; timestamp: string; ip: string; location: string }[];
  securityInfo: {
    passwordLastChanged: string;
    mfaMethod: 'none' | 'app' | 'sms';
    trustedDevices: number;
    activeSessions: number;
  };
  accountInfo: {
    storageUsed: number;
    storageLimit: number;
    projectsCount: number;
    apiCalls: number;
    apiLimit: number;
  };
}

function minutesAgo(m: number) { return new Date(Date.now() - m * 60000).toISOString(); }

export function getMockProfileData(): ProfileData {
  return {
    id: 'user-1',
    username: 'admin',
    email: 'admin@mydash.local',
    fullName: 'Administrator',
    avatarUrl: '',
    role: 'Owner',
    department: 'IT Operations',
    location: 'Jakarta, Indonesia',
    bio: 'System administrator responsible for maintaining the My Dash VPS infrastructure.',
    joinDate: minutesAgo(525600),
    lastActive: minutesAgo(2),
    twoFactorEnabled: true,
    emailVerified: true,
    phoneNumber: '+62 812-3456-7890',
    apiKeys: [
      { id: 'ak1', name: 'Production API Key', key: 'md_sk_prod_••••••••a1b2', created: minutesAgo(43200), lastUsed: minutesAgo(60) },
      { id: 'ak2', name: 'Development API Key', key: 'md_sk_dev_••••••••c3d4', created: minutesAgo(21600), lastUsed: minutesAgo(1440) },
    ],
    devices: [
      { id: 'd1', name: 'Work MacBook Pro', type: 'laptop', os: 'macOS 15.0', browser: 'Chrome 124', lastActive: minutesAgo(2), isCurrent: true },
      { id: 'd2', name: 'Office Desktop', type: 'desktop', os: 'Windows 11', browser: 'Firefox 126', lastActive: minutesAgo(480), isCurrent: false },
      { id: 'd3', name: 'Personal Phone', type: 'mobile', os: 'iOS 18', browser: 'Safari', lastActive: minutesAgo(1440), isCurrent: false },
      { id: 'd4', name: 'Development Server', type: 'server', os: 'Ubuntu 24.04', browser: 'CLI', lastActive: minutesAgo(120), isCurrent: false },
    ],
    recentActivity: [
      { id: 'ra1', action: 'Login successful', timestamp: minutesAgo(2), ip: '10.0.0.1', location: 'Jakarta, ID' },
      { id: 'ra2', action: 'Password changed', timestamp: minutesAgo(7200), ip: '10.0.0.1', location: 'Jakarta, ID' },
      { id: 'ra3', action: '2FA enabled', timestamp: minutesAgo(21600), ip: '10.0.0.1', location: 'Jakarta, ID' },
      { id: 'ra4', action: 'API key created', timestamp: minutesAgo(43200), ip: '10.0.0.1', location: 'Jakarta, ID' },
      { id: 'ra5', action: 'Profile updated', timestamp: minutesAgo(100800), ip: '10.0.0.1', location: 'Jakarta, ID' },
    ],
    securityInfo: {
      passwordLastChanged: minutesAgo(7200),
      mfaMethod: 'app',
      trustedDevices: 2,
      activeSessions: 3,
    },
    accountInfo: {
      storageUsed: 2560,
      storageLimit: 10240,
      projectsCount: 5,
      apiCalls: 12800,
      apiLimit: 50000,
    },
  };
}
