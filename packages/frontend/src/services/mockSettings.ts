// Mock Settings data provider — replace with real Settings Engine later.

export interface SettingCategory {
  id: string;
  label: string;
  icon: string;
}

export interface SettingOption {
  id: string;
  label: string;
  type: 'toggle' | 'text' | 'select' | 'textarea' | 'number';
  value: string | boolean | number;
  defaultValue: string | boolean | number;
  description: string;
  category: string;
  options?: { label: string; value: string }[];
}

export interface SettingsData {
  categories: SettingCategory[];
  settings: SettingOption[];
  activeCategory: string;
}

export function getMockSettingsData(): SettingsData {
  return {
    categories: [
      { id: 'general', label: 'General', icon: 'Settings' },
      { id: 'appearance', label: 'Appearance', icon: 'Palette' },
      { id: 'notification', label: 'Notification', icon: 'Bell' },
      { id: 'monitoring', label: 'Monitoring', icon: 'Activity' },
      { id: 'analytics', label: 'Analytics', icon: 'BarChart3' },
      { id: 'automation', label: 'Automation', icon: 'Bot' },
      { id: 'backup', label: 'Backup', icon: 'HardDrive' },
      { id: 'docker', label: 'Docker', icon: 'Package' },
      { id: 'tunnel', label: 'Tunnel', icon: 'Terminal' },
      { id: 'security', label: 'Security', icon: 'Lock' },
      { id: 'account', label: 'Account', icon: 'User' },
      { id: 'session', label: 'Session', icon: 'Clock' },
      { id: 'advanced', label: 'Advanced', icon: 'Cpu' },
      { id: 'about', label: 'About', icon: 'Info' },
    ],
    settings: [
      { id: 'app-name', label: 'Application Name', type: 'text', value: 'My Dash', defaultValue: 'My Dash', description: 'The name displayed in the dashboard header', category: 'general' },
      { id: 'app-url', label: 'Application URL', type: 'text', value: 'https://mydash.local', defaultValue: 'https://mydash.local', description: 'Base URL for the dashboard', category: 'general' },
      { id: 'timezone', label: 'Timezone', type: 'select', value: 'Asia/Jakarta', defaultValue: 'UTC', description: 'Default timezone for all displays', category: 'general', options: [{ label: 'UTC', value: 'UTC' }, { label: 'Asia/Jakarta', value: 'Asia/Jakarta' }, { label: 'America/New_York', value: 'America/New_York' }, { label: 'Europe/London', value: 'Europe/London' }, { label: 'Asia/Tokyo', value: 'Asia/Tokyo' }] },
      { id: 'language', label: 'Language', type: 'select', value: 'en', defaultValue: 'en', description: 'Dashboard interface language', category: 'general', options: [{ label: 'English', value: 'en' }, { label: 'Bahasa Indonesia', value: 'id' }] },
      { id: 'theme', label: 'Dark Mode', type: 'toggle', value: true, defaultValue: true, description: 'Use dark theme by default', category: 'appearance' },
      { id: 'compact-mode', label: 'Compact Mode', type: 'toggle', value: false, defaultValue: false, description: 'Reduce spacing for denser information display', category: 'appearance' },
      { id: 'sidebar-collapsed', label: 'Collapse Sidebar', type: 'toggle', value: false, defaultValue: false, description: 'Start with sidebar collapsed', category: 'appearance' },
      { id: 'notif-enabled', label: 'Enable Notifications', type: 'toggle', value: true, defaultValue: true, description: 'Enable in-app notifications', category: 'notification' },
      { id: 'notif-sound', label: 'Notification Sound', type: 'toggle', value: true, defaultValue: true, description: 'Play sound on new notifications', category: 'notification' },
      { id: 'notif-desktop', label: 'Desktop Notifications', type: 'toggle', value: false, defaultValue: false, description: 'Send notifications to desktop', category: 'notification' },
      { id: 'monitor-interval', label: 'Monitoring Interval', type: 'select', value: '30', defaultValue: '60', description: 'How often to refresh monitoring data', category: 'monitoring', options: [{ label: '10 seconds', value: '10' }, { label: '30 seconds', value: '30' }, { label: '1 minute', value: '60' }, { label: '5 minutes', value: '300' }] },
      { id: 'monitor-retention', label: 'Data Retention', type: 'select', value: '30', defaultValue: '7', description: 'How long to keep monitoring data', category: 'monitoring', options: [{ label: '7 days', value: '7' }, { label: '14 days', value: '14' }, { label: '30 days', value: '30' }, { label: '90 days', value: '90' }] },
      { id: 'analytics-enabled', label: 'Enable Analytics', type: 'toggle', value: true, defaultValue: true, description: 'Collect usage analytics', category: 'analytics' },
      { id: 'auto-backup', label: 'Auto Backup', type: 'toggle', value: true, defaultValue: true, description: 'Enable automatic scheduled backups', category: 'backup' },
      { id: 'backup-retention', label: 'Backup Retention (days)', type: 'number', value: 30, defaultValue: 30, description: 'Number of days to keep backups', category: 'backup' },
      { id: 'docker-prune', label: 'Auto Prune Images', type: 'toggle', value: false, defaultValue: false, description: 'Automatically remove unused Docker images', category: 'docker' },
      { id: 'tunnel-auto-reconnect', label: 'Auto Reconnect', type: 'toggle', value: true, defaultValue: true, description: 'Automatically reconnect tunnels on failure', category: 'tunnel' },
      { id: 'auto-scan', label: 'Auto Security Scan', type: 'toggle', value: true, defaultValue: true, description: 'Run automated security scans daily', category: 'security' },
      { id: 'max-login-attempts', label: 'Max Login Attempts', type: 'number', value: 5, defaultValue: 5, description: 'Maximum login attempts before lockout', category: 'security' },
      { id: 'session-timeout', label: 'Session Timeout (minutes)', type: 'number', value: 60, defaultValue: 60, description: 'Session idle timeout in minutes', category: 'session' },
      { id: 'debug-mode', label: 'Debug Mode', type: 'toggle', value: false, defaultValue: false, description: 'Enable debug logging and developer tools', category: 'advanced' },
      { id: 'telemetry', label: 'Telemetry', type: 'toggle', value: true, defaultValue: true, description: 'Send anonymous usage data to improve the product', category: 'advanced' },
      { id: 'app-version', label: 'Application Version', type: 'text', value: '1.0.0-beta', defaultValue: '1.0.0-beta', description: 'Current installed version', category: 'about' },
      { id: 'node-version', label: 'Node.js Version', type: 'text', value: '22.14.0', defaultValue: '', description: 'Runtime version', category: 'about' },
    ],
    activeCategory: 'general',
  };
}
