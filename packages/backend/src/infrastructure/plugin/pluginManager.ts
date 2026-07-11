import { execSync } from 'child_process';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
const PLUGIN_REPO = 'https://github.com/akaanakbaik/mydash-plugins.git'
const PLUGIN_DIR = join(process.cwd(), 'plugins');
const PLUGIN_INDEX = join(PLUGIN_DIR, 'plugin-index.json');
export interface PluginManifest {
  id: string;
  name: string;
  version: string;
  description: string;
  author: string;
  category: 'monitoring' | 'automation' | 'security' | 'notification' | 'analytics' | 'utility';
  icon: string;
  config: Record<string, { label: string; type: 'text' | 'number' | 'toggle' | 'select'; default: string | number | boolean; options?: string[] }>;
  permissions: string[];
  minAppVersion: string;
  installed: boolean;
  enabled: boolean;
  installPath?: string;
}
const DEFAULT_PLUGINS: PluginManifest[] = [
  { id: 'cpu-monitor', name: 'CPU Monitor Pro', version: '1.0.0', description: 'Advanced CPU monitoring with per-core graphs and thermal tracking', author: 'MyDash', category: 'monitoring', icon: 'Cpu', config: { interval: { label: 'Check Interval (s)', type: 'number', default: 5 }, alertThreshold: { label: 'Alert Threshold %', type: 'number', default: 80 }, enableThermal: { label: 'Thermal Monitoring', type: 'toggle', default: true } }, permissions: ['system:read'], minAppVersion: '1.0.0', installed: false, enabled: false },
  { id: 'ram-analyzer', name: 'RAM Analyzer', version: '1.0.0', description: 'Detailed memory analysis with per-process breakdown', author: 'MyDash', category: 'monitoring', icon: 'Memory', config: { interval: { label: 'Check Interval (s)', type: 'number', default: 10 }, topProcesses: { label: 'Top Processes', type: 'number', default: 10 } }, permissions: ['system:read'], minAppVersion: '1.0.0', installed: false, enabled: false },
  { id: 'disk-cleaner', name: 'Disk Cleaner', version: '1.0.0', description: 'Automated disk cleanup and space optimization', author: 'MyDash', category: 'automation', icon: 'HardDrive', config: { autoClean: { label: 'Auto Clean', type: 'toggle', default: false }, maxLogAge: { label: 'Max Log Age (days)', type: 'number', default: 30 }, excludeDirs: { label: 'Exclude Dirs', type: 'text', default: '/etc,/boot' } }, permissions: ['system:write', 'files:delete'], minAppVersion: '1.0.0', installed: false, enabled: false },
  { id: 'port-scanner', name: 'Port Scanner', version: '1.0.0', description: 'Network port scanning and security analysis', author: 'MyDash', category: 'security', icon: 'Shield', config: { scanInterval: { label: 'Scan Interval (min)', type: 'number', default: 60 }, ports: { label: 'Ports to scan', type: 'text', default: '22,80,443,3306,5432' }, alertOnNew: { label: 'Alert on new ports', type: 'toggle', default: true } }, permissions: ['network:scan'], minAppVersion: '1.0.0', installed: false, enabled: false },
  { id: 'backup-scheduler', name: 'Backup Scheduler', version: '1.0.0', description: 'Advanced backup scheduling with cloud sync', author: 'MyDash', category: 'automation', icon: 'HardDrive', config: { schedule: { label: 'Cron Schedule', type: 'text', default: '0 3 * * *' }, retention: { label: 'Retention (days)', type: 'number', default: 7 }, cloudProvider: { label: 'Cloud Provider', type: 'select', default: 'none', options: ['none', 's3', 'gdrive', 'dropbox'] } }, permissions: ['files:read', 'files:write'], minAppVersion: '1.0.0', installed: false, enabled: false },
  { id: 'ssl-watchdog', name: 'SSL Watchdog', version: '1.0.0', description: 'SSL certificate expiry monitoring and renewal', author: 'MyDash', category: 'security', icon: 'Lock', config: { domains: { label: 'Domains', type: 'text', default: '' }, alertDays: { label: 'Alert before (days)', type: 'number', default: 14 }, autoRenew: { label: 'Auto Renew', type: 'toggle', default: false } }, permissions: ['system:read', 'cert:manage'], minAppVersion: '1.0.0', installed: false, enabled: false },
  { id: 'network-analyzer', name: 'Network Analyzer', version: '1.0.0', description: 'Real-time network traffic analysis and bandwidth monitoring', author: 'MyDash', category: 'monitoring', icon: 'Activity', config: { interval: { label: 'Sample Interval (s)', type: 'number', default: 2 }, topPorts: { label: 'Top Ports', type: 'number', default: 10 }, alertBandwidth: { label: 'Alert Bandwidth (MB/s)', type: 'number', default: 100 } }, permissions: ['network:read'], minAppVersion: '1.0.0', installed: false, enabled: false },
  { id: 'docker-manager', name: 'Docker Manager', version: '1.0.0', description: 'Advanced Docker container management with stats', author: 'MyDash', category: 'utility', icon: 'Package', config: { autoRestart: { label: 'Auto Restart Failed', type: 'toggle', default: false }, pruneInterval: { label: 'Prune Interval (h)', type: 'number', default: 24 }, monitorStats: { label: 'Monitor Stats', type: 'toggle', default: true } }, permissions: ['docker:manage'], minAppVersion: '1.0.0', installed: false, enabled: false },
  { id: 'log-analyzer', name: 'Log Analyzer', version: '1.0.0', description: 'Intelligent log analysis with pattern detection', author: 'MyDash', category: 'analytics', icon: 'FileText', config: { patterns: { label: 'Alert Patterns', type: 'text', default: 'error,failed,crash,timeout' }, maxLines: { label: 'Max Lines', type: 'number', default: 1000 }, enableML: { label: 'ML Detection', type: 'toggle', default: false } }, permissions: ['system:read'], minAppVersion: '1.0.0', installed: false, enabled: false },
  { id: 'telegram-bot', name: 'Telegram Notifier', version: '1.0.0', description: 'Enhanced Telegram notifications with custom templates', author: 'MyDash', category: 'notification', icon: 'Bell', config: { template: { label: 'Message Template', type: 'text', default: '[{severity}] {title}: {message}' }, includeMetrics: { label: 'Include Metrics', type: 'toggle', default: true }, silentHours: { label: 'Silent Hours (HH:MM-HH:MM)', type: 'text', default: '00:00-06:00' } }, permissions: ['notification:send'], minAppVersion: '1.0.0', installed: false, enabled: false },
  { id: 'uptime-monitor', name: 'Uptime Monitor', version: '1.0.0', description: 'External uptime monitoring with HTTP/HTTPS checks', author: 'MyDash', category: 'monitoring', icon: 'Activity', config: { endpoints: { label: 'Endpoints', type: 'text', default: 'https://localhost:80,https://localhost:443' } }, permissions: ['network:read'], minAppVersion: '1.0.0', installed: false, enabled: false },
  { id: 'firewall-manager', name: 'Firewall Manager', version: '1.0.0', description: 'UFW/iptables firewall rule management', author: 'MyDash', category: 'security', icon: 'Shield', config: { defaultPolicy: { label: 'Default Policy', type: 'select', default: 'deny', options: ['allow', 'deny'] }, autoBlock: { label: 'Auto Block SSH', type: 'toggle', default: true }, maxAttempts: { label: 'Max SSH Attempts', type: 'number', default: 5 } }, permissions: ['firewall:manage'], minAppVersion: '1.0.0', installed: false, enabled: false },
  { id: 'cron-manager', name: 'Cron Manager', version: '1.0.0', description: 'Visual cron job management and scheduling', author: 'MyDash', category: 'utility', icon: 'Clock', config: { backupCrons: { label: 'Backup Before Edit', type: 'toggle', default: true }, validateSyntax: { label: 'Validate Syntax', type: 'toggle', default: true } }, permissions: ['system:write'], minAppVersion: '1.0.0', installed: false, enabled: false },
  { id: 'performance-tuner', name: 'Performance Tuner', version: '1.0.0', description: 'Auto-tuning system parameters for optimal performance', author: 'MyDash', category: 'automation', icon: 'Activity', config: { autoTune: { label: 'Auto Tune', type: 'toggle', default: false }, kernelParams: { label: 'Kernel Params', type: 'toggle', default: false }, swappiness: { label: 'VM Swappiness', type: 'number', default: 10 } }, permissions: ['system:write'], minAppVersion: '1.0.0', installed: false, enabled: false },
  { id: 'database-backup', name: 'Database Auto Backup', version: '1.1.0', description: 'Automatic scheduled backup for MySQL, PostgreSQL, and MongoDB databases with compression, encryption, and cloud storage sync (S3, GDrive, Dropbox). Supports incremental backups and point-in-time recovery.', author: 'MyDash', category: 'automation', icon: 'HardDrive', config: { dbType: { label: 'Database Type', type: 'select', default: 'postgres', options: ['mysql', 'postgres', 'mongodb'] }, schedule: { label: 'Backup Schedule (cron)', type: 'text', default: '0 2 * * *' }, retention: { label: 'Retention (days)', type: 'number', default: 30 }, encrypt: { label: 'Encrypt Backups', type: 'toggle', default: true }, cloudSync: { label: 'Sync to Cloud', type: 'select', default: 'none', options: ['none', 's3', 'gdrive', 'dropbox'] } }, permissions: ['database:read', 'database:write', 'files:write'], minAppVersion: '1.0.0', installed: false, enabled: false },
  { id: 'ai-log-analyzer', name: 'AI Log Intelligence', version: '2.0.0', description: 'Advanced log analysis powered by machine learning. Automatically detects anomalies, predicts potential failures, classifies errors by severity, and generates actionable insights. Supports journalctl, syslog, nginx, apache, docker, and application logs with real-time pattern recognition.', author: 'MyDash Labs', category: 'analytics', icon: 'FileText', config: { mlEnabled: { label: 'ML Anomaly Detection', type: 'toggle', default: true }, scanInterval: { label: 'Scan Interval (min)', type: 'number', default: 5 }, alertOnAnomaly: { label: 'Alert on Anomaly', type: 'toggle', default: true }, maxHistoryDays: { label: 'History Days', type: 'number', default: 7 }, excludePatterns: { label: 'Exclude Patterns', type: 'text', default: '' } }, permissions: ['system:read', 'ai:analyze'], minAppVersion: '1.1.0', installed: false, enabled: false },
  { id: 'web-server-manager', name: 'Web Server Manager', version: '1.0.0', description: 'Comprehensive web server management for Nginx and Apache. Manage virtual hosts, SSL certificates, reverse proxy rules, load balancing, caching policies, and access controls. Includes configuration validator, performance stats, and one-click Let\'s Encrypt SSL provisioning.', author: 'MyDash', category: 'utility', icon: 'Globe', config: { serverType: { label: 'Server Type', type: 'select', default: 'nginx', options: ['nginx', 'apache'] }, autoSSL: { label: 'Auto SSL (Let\'s Encrypt)', type: 'toggle', default: true }, enableCache: { label: 'Enable Cache', type: 'toggle', default: true }, cacheTTL: { label: 'Cache TTL (min)', type: 'number', default: 60 } }, permissions: ['system:write', 'cert:manage'], minAppVersion: '1.0.0', installed: false, enabled: false },
  { id: 'realtime-monitor', name: 'Real-Time System Monitor', version: '2.1.0', description: 'Real-time system monitoring dashboard with WebSocket-powered live updates. Tracks CPU per-core usage, memory with swap, disk I/O, network throughput, process list, and temperature sensors. Includes customizable thresholds, historical graphs, and desktop push notifications.', author: 'MyDash Pro', category: 'monitoring', icon: 'Activity', config: { refreshRate: { label: 'Refresh Rate (ms)', type: 'number', default: 1000 }, chartHistory: { label: 'Chart History (min)', type: 'number', default: 15 }, showProcesses: { label: 'Show Processes', type: 'toggle', default: true }, alertOnHighCPU: { label: 'Alert High CPU', type: 'toggle', default: true }, cpuThreshold: { label: 'CPU Alert (%)', type: 'number', default: 90 } }, permissions: ['system:read', 'notifications:send'], minAppVersion: '1.2.0', installed: false, enabled: false },
  { id: 'ssh-key-manager', name: 'SSH Key Manager', version: '1.0.0', description: 'Manage SSH authorized keys across all servers. Add, remove, and rotate SSH keys with audit logging. Supports key generation, fingerprint verification, bulk deployment, and expiry policies. Integrates with GitHub and GitLab for automatic key synchronization.', author: 'MyDash Security', category: 'security', icon: 'Key', config: { autoSyncGitHub: { label: 'Sync GitHub Keys', type: 'toggle', default: true }, githubUser: { label: 'GitHub Username', type: 'text', default: '' }, keyExpiryDays: { label: 'Key Expiry (days)', type: 'number', default: 90 }, notifyOnAdd: { label: 'Notify on Add', type: 'toggle', default: true } }, permissions: ['ssh:manage', 'system:read'], minAppVersion: '1.0.0', installed: false, enabled: false },
  { id: 'docker-compose-manager', name: 'Docker Compose Manager', version: '1.2.0', description: 'Visual Docker Compose management — deploy, update, and manage multi-container applications with ease. Features include compose file editor, stack deployment, service scaling, health checks, log streaming, and one-click updates from Docker Hub or private registries.', author: 'MyDash DevOps', category: 'utility', icon: 'Package', config: { autoPull: { label: 'Auto Pull Images', type: 'toggle', default: true }, healthCheck: { label: 'Health Check Interval (s)', type: 'number', default: 30 }, rollbackOnFailure: { label: 'Rollback on Failure', type: 'toggle', default: true }, pruneAfterDeploy: { label: 'Prune Old Images', type: 'toggle', default: true } }, permissions: ['docker:manage', 'system:read'], minAppVersion: '1.1.0', installed: false, enabled: false },
  { id: 'bandwidth-monitor', name: 'Bandwidth Traffic Monitor', version: '1.0.0', description: 'Network bandwidth monitoring with per-interface traffic accounting, top talkers, protocol breakdown, and bandwidth usage alerts. Supports historical graphs, daily/weekly/monthly reports, and quota management with auto-throttling when limits are reached.', author: 'MyDash Networking', category: 'monitoring', icon: 'Activity', config: { interfaces: { label: 'Monitor Interfaces', type: 'text', default: 'eth0,ens3' }, alertThreshold: { label: 'Alert Threshold (MB/s)', type: 'number', default: 50 }, logTraffic: { label: 'Log Top Talkers', type: 'toggle', default: true }, reportSchedule: { label: 'Report Schedule', type: 'select', default: 'daily', options: ['daily', 'weekly', 'monthly'] } }, permissions: ['network:read', 'system:read'], minAppVersion: '1.0.0', installed: false, enabled: false },
  { id: 'auto-patch-manager', name: 'Auto Patch Manager', version: '1.0.0', description: 'Automated security patching and system update manager. Schedules updates during maintenance windows, creates system snapshots before patching, tests updates in isolation, and rolls back automatically if issues detected. Supports apt, yum, and alpine package managers.', author: 'MyDash Security', category: 'automation', icon: 'Shield', config: { autoUpdate: { label: 'Auto Install Security Updates', type: 'toggle', default: true }, schedule: { label: 'Update Schedule (cron)', type: 'text', default: '0 4 * * 0' }, createSnapshot: { label: 'Create Pre-Update Snapshot', type: 'toggle', default: true }, notifyOnUpdate: { label: 'Notify on Updates', type: 'toggle', default: true }, maxRetries: { label: 'Max Retry Attempts', type: 'number', default: 3 } }, permissions: ['system:write', 'system:read'], minAppVersion: '1.0.0', installed: false, enabled: false },
  { id: 'docker-registry-cleaner', name: 'Docker Registry Cleaner', version: '1.0.0', description: 'Advanced Docker registry and local image cleanup tool. Removes unused/dangling images, prunes build cache, analyzes disk usage by image/repository, and enforces retention policies. Helps reclaim disk space and optimize Docker storage usage.', author: 'MyDash DevOps', category: 'utility', icon: 'Trash2', config: { autoClean: { label: 'Auto Clean Interval (h)', type: 'number', default: 24 }, keepImages: { label: 'Recent Images to Keep', type: 'number', default: 5 }, pruneVolumes: { label: 'Prune Anonymous Volumes', type: 'toggle', default: false }, dryRun: { label: 'Dry Run Mode', type: 'toggle', default: true } }, permissions: ['docker:manage', 'system:read'], minAppVersion: '1.0.0', installed: false, enabled: false },
  { id: 'notification-webhook', name: 'Webhook Notifier Pro', version: '1.0.0', description: 'Advanced webhook notification engine — send alerts to Slack, Discord, Microsoft Teams, PagerDuty, or any custom HTTP endpoint. Supports retry logic, rate limiting, payload templating with Handlebars, HMAC signing, and multi-channel routing with priority queuing.', author: 'MyDash', category: 'notification', icon: 'Bell', config: { webhookUrl: { label: 'Webhook URL', type: 'text', default: '' }, method: { label: 'HTTP Method', type: 'select', default: 'POST', options: ['GET', 'POST', 'PUT'] }, retryCount: { label: 'Max Retries', type: 'number', default: 3 }, hmacSecret: { label: 'HMAC Secret (optional)', type: 'text', default: '' }, template: { label: 'Payload Template (JSON)', type: 'text', default: '{"text":"{{message}}"}' } }, permissions: ['notification:send'], minAppVersion: '1.0.0', installed: false, enabled: false },
  { id: 'ssl-cert-generator', name: 'SSL Certificate Generator', version: '1.0.0', description: 'Generate and manage SSL/TLS certificates for all your domains. Supports Let\'s Encrypt ACME v2, self-signed certificates for internal services, wildcard certificates, multi-domain SAN certificates, and automatic renewal with pre-expiry alerts. Integrates with Nginx, Apache, and Caddy.', author: 'MyDash Security', category: 'security', icon: 'Lock', config: { autoRenew: { label: 'Auto Renew Before Expiry (days)', type: 'number', default: 14 }, provider: { label: 'Certificate Provider', type: 'select', default: 'letsencrypt', options: ['letsencrypt', 'selfsigned', 'custom'] }, email: { label: 'Admin Email', type: 'text', default: 'admin@example.com' }, preferredChain: { label: 'Preferred Chain', type: 'select', default: 'default', options: ['default', 'letsencrypt', 'isrgrootx1'] } }, permissions: ['cert:manage', 'system:write'], minAppVersion: '1.0.0', installed: false, enabled: false },
  { id: 'process-manager', name: 'Process Supervisor', version: '1.0.0', description: 'Advanced process monitoring and management with auto-restart, health checks, resource limits, and graceful shutdown. Supports systemd service integration, cgroup resource control, OOM score adjustment, and custom restart policies with exponential backoff.', author: 'MyDash', category: 'utility', icon: 'Terminal', config: { watchInterval: { label: 'Watch Interval (s)', type: 'number', default: 10 }, maxRestarts: { label: 'Max Restarts per Minute', type: 'number', default: 5 }, cpuLimit: { label: 'CPU Limit (%)', type: 'number', default: 100 }, memLimit: { label: 'Memory Limit (MB)', type: 'number', default: 1024 }, notifyOnCrash: { label: 'Notify on Crash', type: 'toggle', default: true } }, permissions: ['system:write', 'system:read'], minAppVersion: '1.0.0', installed: false, enabled: false },
  { id: 'weather-monitor', name: 'Data Center Weather', version: '1.0.0', description: 'Monitor environmental conditions for your server room or data center. Integrates with IPMI/iLO/iDRAC for temperature, humidity, and power consumption readings. Provides alerts for overheating risks, supports SNMP sensors, and displays historical environmental trends with seasonal analysis.', author: 'MyDash IoT', category: 'monitoring', icon: 'Thermometer', config: { tempThreshold: { label: 'Temperature Alert (°C)', type: 'number', default: 35 }, humidityThreshold: { label: 'Humidity Alert (%)', type: 'number', default: 80 }, pollInterval: { label: 'Sensor Poll (s)', type: 'number', default: 60 }, sensorType: { label: 'Sensor Interface', type: 'select', default: 'ipmi', options: ['ipmi', 'snmp', 'modbus'] } }, permissions: ['system:read'], minAppVersion: '1.0.0', installed: false, enabled: false },
  { id: 'cost-tracker', name: 'Cloud Cost Tracker', version: '1.0.0', description: 'Track and optimize cloud infrastructure costs across AWS, GCP, Azure, and DigitalOcean. Provides cost breakdowns by service, resource tagging analysis, usage anomaly detection, budget alerts, and optimization recommendations including rightsizing and reserved instance planning.', author: 'MyDash Finance', category: 'analytics', icon: 'DollarSign', config: { monthlyBudget: { label: 'Monthly Budget ($)', type: 'number', default: 100 }, alertThreshold: { label: 'Alert at (%)', type: 'number', default: 80 }, provider: { label: 'Cloud Provider', type: 'select', default: 'aws', options: ['aws', 'gcp', 'azure', 'do'] }, currency: { label: 'Currency', type: 'select', default: 'USD', options: ['USD', 'EUR', 'IDR', 'JPY'] } }, permissions: ['system:read'], minAppVersion: '1.1.0', installed: false, enabled: false },
  { id: 'email-reporter', name: 'Email Report Center', version: '1.0.0', description: 'Scheduled email reporting engine that generates and sends comprehensive system reports. Supports customizable templates (HTML/Markdown), multiple report types (daily summary, weekly analytics, monthly audit), PDF attachment generation, and scheduled delivery with SMTP, SendGrid, or Mailgun integration.', author: 'MyDash', category: 'notification', icon: 'Mail', config: { smtpHost: { label: 'SMTP Host', type: 'text', default: '' }, smtpPort: { label: 'SMTP Port', type: 'number', default: 587 }, fromEmail: { label: 'From Email', type: 'text', default: 'noreply@mydash.local' }, toEmail: { label: 'To Email', type: 'text', default: '' }, reportType: { label: 'Report Type', type: 'select', default: 'daily', options: ['daily', 'weekly', 'monthly'] }, includeCharts: { label: 'Include Charts', type: 'toggle', default: true } }, permissions: ['notification:send', 'system:read'], minAppVersion: '1.0.0', installed: false, enabled: false },
];
export class PluginManager {
  private plugins: PluginManifest[] = [];
  private initialized = false;
  async init(): Promise<void> {
    if (this.initialized) return;
    if (existsSync(PLUGIN_INDEX)) {
      try {
        this.plugins = JSON.parse(readFileSync(PLUGIN_INDEX, 'utf-8'));
        this.initialized = true;
        return;
      } catch {  }
    }
    try {
      execSync(`rm -rf /tmp/mydash-plugins && git clone --depth 1 ${PLUGIN_REPO} /tmp/mydash-plugins 2>/dev/null || true`, { encoding: 'utf-8', timeout: 15000 });
      const pluginFile = '/tmp/mydash-plugins/plugin-index.json';
      if (existsSync(pluginFile)) {
        this.plugins = JSON.parse(readFileSync(pluginFile, 'utf-8'));
        mkdirSync(PLUGIN_DIR, { recursive: true });
        writeFileSync(PLUGIN_INDEX, JSON.stringify(this.plugins, null, 2));
        this.initialized = true;
        return;
      }
    } catch {  }
    this.plugins = DEFAULT_PLUGINS;
    mkdirSync(PLUGIN_DIR, { recursive: true });
    writeFileSync(PLUGIN_INDEX, JSON.stringify(this.plugins, null, 2));
    this.initialized = true;
  }
  async refreshFromRepo(): Promise<void> {
    this.initialized = false;
    await this.init();
  }
  getPlugins(): PluginManifest[] {
    return this.plugins;
  }
  installPlugin(id: string): boolean {
    const plugin = this.plugins.find(p => p.id === id);
    if (!plugin || plugin.installed) return false;
    plugin.installed = true;
    plugin.enabled = true;
    plugin.installPath = join(PLUGIN_DIR, id);
    mkdirSync(plugin.installPath, { recursive: true });
    this.save();
    return true;
  }
  uninstallPlugin(id: string): boolean {
    const plugin = this.plugins.find(p => p.id === id);
    if (!plugin || !plugin.installed) return false;
    plugin.installed = false;
    plugin.enabled = false;
    plugin.installPath = undefined;
    this.save();
    return true;
  }
  togglePlugin(id: string, enabled: boolean): boolean {
    const plugin = this.plugins.find(p => p.id === id);
    if (!plugin || !plugin.installed) return false;
    plugin.enabled = enabled;
    this.save();
    return true;
  }
  updatePluginConfig(id: string, config: Record<string, unknown>): boolean {
    const plugin = this.plugins.find(p => p.id === id);
    if (!plugin) return false;
    Object.assign(plugin.config, config);
    this.save();
    return true;
  }
  private save(): void {
    try {
      writeFileSync(PLUGIN_INDEX, JSON.stringify(this.plugins, null, 2));
    } catch {  }
  }
}
export const pluginManager = new PluginManager();
