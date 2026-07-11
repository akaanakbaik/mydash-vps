import { collectSystemMetrics } from '../../systemMetrics/service.js';
import { telegramBot } from '../providers/telegramBot.js';
import { whatsappBot } from '../providers/whatsappBot.js';
import { execSync } from 'child_process';
export interface AlertDefinition {
  id: string;
  name: string;
  description: string;
  category: 'system' | 'security' | 'backup' | 'docker' | 'network' | 'certificate' | 'plugin' | 'daily';
  enabled: boolean;
  severity: 'info' | 'warning' | 'error' | 'critical';
  interval: number; 
  lastCheck: number;
}
export const PRESET_ALERTS: AlertDefinition[] = [
  { id: 'cpu-high', name: 'High CPU Usage', description: 'Alert when CPU usage exceeds threshold', category: 'system', enabled: true, severity: 'warning', interval: 30, lastCheck: 0 },
  { id: 'cpu-critical', name: 'Critical CPU Usage', description: 'Alert when CPU usage is critically high', category: 'system', enabled: true, severity: 'critical', interval: 15, lastCheck: 0 },
  { id: 'ram-high', name: 'High Memory Usage', description: 'Alert when RAM usage exceeds threshold', category: 'system', enabled: true, severity: 'warning', interval: 30, lastCheck: 0 },
  { id: 'ram-critical', name: 'Critical Memory Usage', description: 'Alert when RAM usage is critically high', category: 'system', enabled: true, severity: 'critical', interval: 15, lastCheck: 0 },
  { id: 'disk-high', name: 'High Disk Usage', description: 'Alert when disk usage exceeds threshold', category: 'system', enabled: true, severity: 'warning', interval: 60, lastCheck: 0 },
  { id: 'disk-critical', name: 'Critical Disk Usage', description: 'Alert when disk usage is critically high', category: 'system', enabled: true, severity: 'critical', interval: 30, lastCheck: 0 },
  { id: 'high-load', name: 'High System Load', description: 'Alert when load average exceeds CPU cores', category: 'system', enabled: true, severity: 'warning', interval: 30, lastCheck: 0 },
  { id: 'system-down', name: 'System Down', description: 'Alert when server is unreachable', category: 'system', enabled: true, severity: 'critical', interval: 10, lastCheck: 0 },
  { id: 'system-recovered', name: 'System Recovered', description: 'Alert when server comes back online', category: 'system', enabled: true, severity: 'info', interval: 60, lastCheck: 0 },
  { id: 'service-down', name: 'Service Down', description: 'Alert when a critical service stops', category: 'system', enabled: true, severity: 'error', interval: 30, lastCheck: 0 },
  { id: 'service-recovered', name: 'Service Recovered', description: 'Alert when a service is back online', category: 'system', enabled: true, severity: 'info', interval: 60, lastCheck: 0 },
  { id: 'ssh-brute-force', name: 'SSH Brute Force', description: 'Alert on multiple failed SSH attempts', category: 'security', enabled: true, severity: 'critical', interval: 30, lastCheck: 0 },
  { id: 'ssh-login', name: 'SSH Login Notification', description: 'Notify on successful SSH login', category: 'security', enabled: true, severity: 'info', interval: 60, lastCheck: 0 },
  { id: 'port-scan', name: 'Port Scan Detected', description: 'Alert when port scanning activity is detected', category: 'security', enabled: true, severity: 'critical', interval: 30, lastCheck: 0 },
  { id: 'failed-login', name: 'Failed Login Attempts', description: 'Alert on repeated failed web logins', category: 'security', enabled: true, severity: 'warning', interval: 30, lastCheck: 0 },
  { id: 'network-anomaly', name: 'Network Anomaly', description: 'Alert on unusual network traffic patterns', category: 'network', enabled: true, severity: 'warning', interval: 30, lastCheck: 0 },
  { id: 'network-down', name: 'Network Interface Down', description: 'Alert when a network interface goes down', category: 'network', enabled: true, severity: 'error', interval: 30, lastCheck: 0 },
  { id: 'high-bandwidth', name: 'High Bandwidth Usage', description: 'Alert when bandwidth exceeds threshold', category: 'network', enabled: true, severity: 'warning', interval: 30, lastCheck: 0 },
  { id: 'docker-down', name: 'Container Stopped', description: 'Alert when a Docker container stops', category: 'docker', enabled: true, severity: 'warning', interval: 30, lastCheck: 0 },
  { id: 'docker-restart', name: 'Container Restart Loop', description: 'Alert on repeated container restarts', category: 'docker', enabled: true, severity: 'error', interval: 60, lastCheck: 0 },
  { id: 'backup-complete', name: 'Backup Complete', description: 'Notify when backup completes', category: 'backup', enabled: true, severity: 'info', interval: 300, lastCheck: 0 },
  { id: 'backup-failed', name: 'Backup Failed', description: 'Alert when backup fails', category: 'backup', enabled: true, severity: 'error', interval: 60, lastCheck: 0 },
  { id: 'ssl-expiry-7', name: 'SSL Expiring (7 days)', description: 'Alert when SSL cert expires within 7 days', category: 'certificate', enabled: true, severity: 'warning', interval: 3600, lastCheck: 0 },
  { id: 'ssl-expiry-3', name: 'SSL Expiring (3 days)', description: 'Alert when SSL cert expires within 3 days', category: 'certificate', enabled: true, severity: 'critical', interval: 3600, lastCheck: 0 },
  { id: 'ssl-expired', name: 'SSL Certificate Expired', description: 'Alert when SSL cert has expired', category: 'certificate', enabled: true, severity: 'critical', interval: 3600, lastCheck: 0 },
  { id: 'plugin-installed', name: 'Plugin Installed', description: 'Notify when a plugin is installed', category: 'plugin', enabled: true, severity: 'info', interval: 60, lastCheck: 0 },
  { id: 'plugin-error', name: 'Plugin Error', description: 'Alert when a plugin encounters an error', category: 'plugin', enabled: true, severity: 'error', interval: 30, lastCheck: 0 },
  { id: 'update-available', name: 'Update Available', description: 'Notify when updates are available', category: 'plugin', enabled: true, severity: 'info', interval: 3600, lastCheck: 0 },
  { id: 'daily-report', name: 'Daily System Report', description: 'Send daily system summary report', category: 'daily', enabled: true, severity: 'info', interval: 86400, lastCheck: 0 },
];
export const ALERT_THRESHOLDS: Record<string, { warning: number; critical: number }> = {
  cpu: { warning: 70, critical: 90 },
  ram: { warning: 70, critical: 90 },
  disk: { warning: 80, critical: 95 },
  load: { warning: 1.0, critical: 2.0 },
  bandwidth: { warning: 50, critical: 100 },
  sshAttempts: { warning: 5, critical: 20 },
  certExpiry: { warning: 7, critical: 3 },
};
const alertState: Record<string, { sent: boolean; lastValue: number }> = {};
function shouldSend(alertId: string, value: number, severity: string): boolean {
  const state = alertState[alertId] || { sent: false, lastValue: 0 };
  if (severity === 'critical' && value > (alertState[alertId]?.lastValue || 0) * 0.8) {
    if (!state.sent) { alertState[alertId] = { sent: true, lastValue: value }; return true; }
    return false;
  }
  if (!state.sent) { alertState[alertId] = { sent: true, lastValue: value }; return true; }
  if (Math.abs(value - state.lastValue) > 10) { alertState[alertId] = { sent: true, lastValue: value }; return true; }
  return false;
}
function resetAlert(alertId: string): void {
  if (alertState[alertId]) alertState[alertId].sent = false;
}
export async function runAlertChecks(): Promise<Array<{ alertId: string; message: string; severity: string }>> {
  const now = Date.now();
  const results: Array<{ alertId: string; message: string; severity: string }> = [];
  const s = collectSystemMetrics();
  for (const alert of PRESET_ALERTS) {
    if (!alert.enabled) continue;
    if (now - alert.lastCheck < alert.interval * 1000) continue;
    alert.lastCheck = now;
    switch (alert.id) {
      case 'cpu-high': {
        const th = ALERT_THRESHOLDS.cpu.warning;
        if (s.cpuUsagePercent > th && shouldSend(alert.id, s.cpuUsagePercent, 'warning'))
          results.push({ alertId: alert.id, message: `CPU ${s.cpuUsagePercent}% > ${th}%`, severity: 'warning' });
        else if (s.cpuUsagePercent <= th) resetAlert(alert.id);
        break;
      }
      case 'cpu-critical': {
        const th = ALERT_THRESHOLDS.cpu.critical;
        if (s.cpuUsagePercent > th && shouldSend(alert.id, s.cpuUsagePercent, 'critical'))
          results.push({ alertId: alert.id, message: `CPU CRITICAL ${s.cpuUsagePercent}% > ${th}%`, severity: 'critical' });
        else if (s.cpuUsagePercent <= th) resetAlert(alert.id);
        break;
      }
      case 'ram-high': {
        const th = ALERT_THRESHOLDS.ram.warning;
        if (s.ramUsagePercent > th && shouldSend(alert.id, s.ramUsagePercent, 'warning'))
          results.push({ alertId: alert.id, message: `RAM ${s.ramUsagePercent}% > ${th}%`, severity: 'warning' });
        else if (s.ramUsagePercent <= th) resetAlert(alert.id);
        break;
      }
      case 'ram-critical': {
        const th = ALERT_THRESHOLDS.ram.critical;
        if (s.ramUsagePercent > th && shouldSend(alert.id, s.ramUsagePercent, 'critical'))
          results.push({ alertId: alert.id, message: `RAM CRITICAL ${s.ramUsagePercent}% > ${th}%`, severity: 'critical' });
        else if (s.ramUsagePercent <= th) resetAlert(alert.id);
        break;
      }
      case 'disk-high': {
        const th = ALERT_THRESHOLDS.disk.warning;
        if (s.diskUsagePercent > th && shouldSend(alert.id, s.diskUsagePercent, 'warning'))
          results.push({ alertId: alert.id, message: `Disk ${s.diskUsagePercent}% > ${th}%`, severity: 'warning' });
        else if (s.diskUsagePercent <= th) resetAlert(alert.id);
        break;
      }
      case 'disk-critical': {
        const th = ALERT_THRESHOLDS.disk.critical;
        if (s.diskUsagePercent > th && shouldSend(alert.id, s.diskUsagePercent, 'critical'))
          results.push({ alertId: alert.id, message: `Disk CRITICAL ${s.diskUsagePercent}% > ${th}%`, severity: 'critical' });
        else if (s.diskUsagePercent <= th) resetAlert(alert.id);
        break;
      }
      case 'high-load': {
        const th = ALERT_THRESHOLDS.load.warning;
        if (s.loadAverage1m > th * s.cpuCores && shouldSend(alert.id, s.loadAverage1m, 'warning'))
          results.push({ alertId: alert.id, message: `Load ${s.loadAverage1m} > ${th} × ${s.cpuCores} cores`, severity: 'warning' });
        else if (s.loadAverage1m <= th) resetAlert(alert.id);
        break;
      }
      case 'system-down': {
        break;
      }
      case 'service-down': {
        try {
          const services = execSync('systemctl --failed --no-legend 2>/dev/null | head -5 || echo ""', { encoding: 'utf-8', timeout: 3000 });
          if (services.trim()) {
            const failedServices = services.trim().split('\n').map(l => l.split(/\s+/)[0]).filter(Boolean);
            for (const svc of failedServices) {
              if (shouldSend(`${alert.id}-${svc}`, 1, 'error'))
                results.push({ alertId: alert.id, message: `Service ${svc} is down`, severity: 'error' });
            }
          }
        } catch {  }
        break;
      }
      case 'docker-down': {
        try {
          const dockerPs = execSync('docker ps -a --format "{{.Names}}|{{.State}}" 2>/dev/null | head -20 || true', { encoding: 'utf-8', timeout: 3000 });
          const lines = dockerPs.trim().split('\n').filter(Boolean);
          for (const line of lines) {
            const [name, state] = line.split('|');
            if (state && state !== 'running' && shouldSend(`${alert.id}-${name}`, 1, 'warning'))
              results.push({ alertId: alert.id, message: `Container ${name} is ${state}`, severity: 'warning' });
          }
        } catch {  }
        break;
      }
      case 'daily-report': {
        results.push({ alertId: alert.id, message: `Daily Report: CPU ${s.cpuUsagePercent}% | RAM ${s.ramUsagePercent}% | Disk ${s.diskUsagePercent}% | Uptime ${s.uptimeFormatted}`, severity: 'info' });
        break;
      }
      case 'network-anomaly': {
        if (s.network.rxSpeed > ALERT_THRESHOLDS.bandwidth.warning && shouldSend(alert.id, s.network.rxSpeed, 'warning'))
          results.push({ alertId: alert.id, message: `High traffic: ${s.network.rxSpeed} MB/s on ${s.network.interface}`, severity: 'warning' });
        else if (s.network.rxSpeed <= ALERT_THRESHOLDS.bandwidth.warning) resetAlert(alert.id);
        break;
      }
      case 'ssh-login': {
        try {
          const lastLog = execSync("last -1 -n 5 2>/dev/null | grep -v 'wtmp' | head -3 || true", { encoding: 'utf-8', timeout: 3000 });
          if (lastLog.trim()) {
            const lines = lastLog.trim().split('\n');
            for (const line of lines) {
              const parts = line.split(/\s+/);
              if (parts[0] && parts[2] && shouldSend(`${alert.id}-${parts[2]}`, 1, 'info'))
                results.push({ alertId: alert.id, message: `SSH login: ${parts[0]} from ${parts[2]}`, severity: 'info' });
            }
          }
        } catch {  }
        break;
      }
      default:
        break;
    }
  }
  for (const r of results) {
    const alertDef = PRESET_ALERTS.find(a => a.id === r.alertId);
    const sev = alertDef?.severity || 'info';
    if (telegramBot.enabled) await telegramBot.send({ title: alertDef?.name || 'Alert', message: r.message, severity: sev as 'info' | 'warning' | 'error' | 'critical' });
    if (whatsappBot.enabled) await whatsappBot.send({ title: alertDef?.name || 'Alert', message: r.message, severity: sev });
  }
  return results;
}
export function getAlertStatus(): { alerts: AlertDefinition[]; thresholds: typeof ALERT_THRESHOLDS } {
  return { alerts: PRESET_ALERTS, thresholds: ALERT_THRESHOLDS };
}
