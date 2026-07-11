export interface Plugin { id: string; name: string; description: string; version: string; author: string; status: 'installed' | 'available' | 'update_available' | 'disabled' | 'incompatible'; category: string; installedAt: string | null; size: number; downloads: number; rating: number; compatible: boolean; dependencies: string[]; permissions: string[]; }
export interface PluginCategory { id: string; label: string; count: number; }
export interface PluginData { plugins: Plugin[]; categories: PluginCategory[]; }
export function getMockPluginData(): PluginData { return {
  plugins: [
    { id: 'p1', name: 'Health Score', description: 'Advanced health scoring with weighted evaluation', version: '2.1.0', author: 'My Dash Team', status: 'installed', category: 'monitoring', installedAt: minutesAgo(43200), size: 256, downloads: 1280, rating: 4.8, compatible: true, dependencies: [], permissions: ['read:metrics'] },
    { id: 'p2', name: 'Telegram Notifier', description: 'Send notifications to Telegram channels', version: '1.5.2', author: 'Community', status: 'installed', category: 'notification', installedAt: minutesAgo(21600), size: 128, downloads: 3420, rating: 4.6, compatible: true, dependencies: ['p1'], permissions: ['send:notification'] },
    { id: 'p3', name: 'WhatsApp Provider', description: 'WhatsApp Business API notification support', version: '1.2.0', author: 'Community', status: 'installed', category: 'notification', installedAt: minutesAgo(10080), size: 192, downloads: 856, rating: 4.3, compatible: true, dependencies: [], permissions: ['send:notification', 'read:contacts'] },
    { id: 'p4', name: 'Grafana Integration', description: 'Embed Grafana dashboards in My Dash', version: '0.9.0', author: 'Community', status: 'update_available', category: 'integration', installedAt: minutesAgo(1440), size: 512, downloads: 420, rating: 3.8, compatible: true, dependencies: [], permissions: ['read:dashboard'] },
    { id: 'p5', name: 'Prometheus Exporter', description: 'Export metrics to Prometheus', version: '1.0.0', author: 'My Dash Team', status: 'available', category: 'integration', installedAt: null, size: 384, downloads: 210, rating: 4.1, compatible: true, dependencies: ['p1'], permissions: ['read:metrics', 'read:health'] },
    { id: 'p6', name: 'Legacy API Bridge', description: 'Connect to legacy monitoring systems', version: '0.5.0', author: 'Community', status: 'incompatible', category: 'integration', installedAt: null, size: 640, downloads: 85, rating: 2.5, compatible: false, dependencies: [], permissions: ['read:all'] },
    { id: 'p7', name: 'Custom Scripts', description: 'Run custom scripts from the dashboard', version: '1.1.0', author: 'Community', status: 'disabled', category: 'automation', installedAt: minutesAgo(4320), size: 64, downloads: 1250, rating: 3.9, compatible: true, dependencies: [], permissions: ['execute:scripts'] },
    { id: 'p8', name: 'AI Insights', description: 'AI-powered analysis and recommendations', version: '2.0.0', author: 'My Dash Team', status: 'available', category: 'ai', installedAt: null, size: 1024, downloads: 640, rating: 4.7, compatible: true, dependencies: ['p1'], permissions: ['read:all', 'ai:analyze'] },
    { id: 'p9', name: 'Backup Manager', description: 'Automated backup scheduling and management', version: '1.3.0', author: 'My Dash Team', status: 'available', category: 'system', installedAt: null, size: 320, downloads: 890, rating: 4.5, compatible: true, dependencies: [], permissions: ['read:backup', 'write:backup'] },
  ],
  categories: [
    { id: 'all', label: 'All Plugins', count: 9 },
    { id: 'monitoring', label: 'Monitoring', count: 1 },
    { id: 'notification', label: 'Notification', count: 2 },
    { id: 'integration', label: 'Integration', count: 3 },
    { id: 'automation', label: 'Automation', count: 1 },
    { id: 'ai', label: 'AI', count: 1 },
    { id: 'system', label: 'System', count: 1 },
  ],
}; }
function minutesAgo(m: number) { return new Date(Date.now() - m * 60000).toISOString(); }
