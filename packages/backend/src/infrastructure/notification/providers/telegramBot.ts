import { Bot } from 'grammy';
export class TelegramBotService {
  private bot: Bot | null = null;
  private chatId: string = '';
  private _enabled = false;
  get enabled(): boolean { return this._enabled; }
  configure(token: string, chatId: string): void {
    if (!token || !chatId) {
      this._enabled = false;
      this.bot = null;
      return;
    }
    try {
      this.bot = new Bot(token);
      this.chatId = chatId;
      this._enabled = true;
    } catch {
      this._enabled = false;
      this.bot = null;
    }
  }
  disable(): void {
    this._enabled = false;
    this.bot = null;
  }
  private buildMessage(data: {
    title: string; message: string; severity: 'info' | 'warning' | 'error' | 'critical';
    metric?: string; value?: string; threshold?: string; details?: string;
  }): string {
    const emoji = data.severity === 'critical' ? '🚨' : data.severity === 'error' ? '❌' : data.severity === 'warning' ? '⚠️' : '✅';
    const ts = new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' });
    let msg = `<b>${emoji} My Dash - ${data.title}</b>\n\n`;
    msg += `<b>📋 Status:</b> ${data.message}\n`;
    if (data.metric) msg += `<b>📊 ${data.metric}:</b> ${data.value || '—'}\n`;
    if (data.threshold) msg += `<b>🎯 Threshold:</b> ${data.threshold}\n`;
    if (data.details) msg += `\n${data.details}\n`;
    msg += `\n🕐 <i>${ts} WIB</i>`;
    msg += `\n🏠 <i>My Dash VPS</i>`;
    return msg;
  }
  async send(data: Parameters<typeof this.buildMessage>[0]): Promise<boolean> {
    if (!this._enabled || !this.bot) return false;
    try {
      const text = this.buildMessage(data);
      await this.bot.api.sendMessage(this.chatId, text, { parse_mode: 'HTML' });
      return true;
    } catch {
      return false;
    }
  }
  async sendCpuAlert(pct: number, threshold: number) {
    return this.send({ title: 'CPU Alert', message: `CPU usage ${pct.toFixed(1)}% exceeds ${threshold}% threshold`, severity: pct > 90 ? 'critical' : 'warning', metric: 'CPU Usage', value: `${pct.toFixed(1)}%`, threshold: `${threshold}%` });
  }
  async sendMemoryAlert(pct: number, threshold: number) {
    return this.send({ title: 'Memory Alert', message: `RAM usage ${pct.toFixed(1)}% exceeds ${threshold}% threshold`, severity: pct > 90 ? 'critical' : 'warning', metric: 'RAM Usage', value: `${pct.toFixed(1)}%`, threshold: `${threshold}%` });
  }
  async sendDiskAlert(pct: number, threshold: number) {
    return this.send({ title: 'Disk Alert', message: `Disk usage ${pct.toFixed(1)}% exceeds ${threshold}% threshold`, severity: pct > 90 ? 'critical' : 'warning', metric: 'Disk Usage', value: `${pct.toFixed(1)}%`, threshold: `${threshold}%` });
  }
  async sendSystemDown() {
    return this.send({ title: '⚠️ SERVER DOWN', message: 'Monitoring system cannot reach the server', severity: 'critical' });
  }
  async sendSystemUp() {
    return this.send({ title: '✅ SERVER RECOVERED', message: 'Server is back online and responding', severity: 'info' });
  }
  async sendHighLoad(load: number, cores: number) {
    return this.send({ title: 'High System Load', message: `Load average ${load} exceeds ${cores} CPU cores`, severity: 'warning', metric: 'Load Average', value: String(load), threshold: `${cores} cores` });
  }
  async sendServiceDown(service: string) {
    return this.send({ title: '❌ Service Down', message: `Service "${service}" has stopped`, severity: 'error', metric: 'Service', value: service });
  }
  async sendServiceRecovered(service: string) {
    return this.send({ title: '✅ Service Recovered', message: `Service "${service}" is running again`, severity: 'info', metric: 'Service', value: service });
  }
  async sendBackupComplete(name: string, size: string) {
    return this.send({ title: '✅ Backup Complete', message: `Backup "${name}" finished successfully`, severity: 'info', metric: 'Backup Size', value: size });
  }
  async sendBackupFailed(name: string, reason: string) {
    return this.send({ title: '❌ Backup Failed', message: `Backup "${name}" failed: ${reason}`, severity: 'error', metric: 'Backup', value: name, details: reason });
  }
  async sendDockerContainerDown(container: string) {
    return this.send({ title: '🐳 Docker Alert', message: `Container "${container}" has stopped`, severity: 'warning', metric: 'Container', value: container });
  }
  async sendSSHFailed(ip: string, attempts: number) {
    return this.send({ title: '🔐 SSH Brute Force', message: `${attempts} failed SSH attempts from ${ip}`, severity: 'critical', metric: 'Attempts', value: String(attempts), details: `IP: ${ip}` });
  }
  async sendSSHLogin(ip: string, user: string) {
    return this.send({ title: '🔑 SSH Login', message: `User ${user} logged in from ${ip}`, severity: 'info', metric: 'User', value: user, details: `IP: ${ip}` });
  }
  async sendCertificateExpiry(days: number, domain: string) {
    return this.send({ title: '📜 SSL Certificate', message: `Certificate for ${domain} expires in ${days} days`, severity: days <= 3 ? 'critical' : days <= 7 ? 'warning' : 'info', metric: 'Domain', value: domain, details: `Expires in ${days} days` });
  }
  async sendDailyReport(data: { cpu: number; ram: number; disk: number; uptime: string; services: number; alerts: number }) {
    return this.send({ title: '📊 Daily Report', message: `System summary for ${new Date().toLocaleDateString('id-ID')}`, severity: 'info',
      metric: 'CPU/RAM/Disk', value: `${data.cpu}% / ${data.ram}% / ${data.disk}%`,
      details: `Uptime: ${data.uptime}\nServices: ${data.services}\nAlerts: ${data.alerts}` });
  }
  async sendNetworkAnomaly(interfaceName: string, bandwidth: number) {
    return this.send({ title: '🌐 Network Anomaly', message: `Unusual traffic on ${interfaceName}`, severity: 'warning', metric: 'Bandwidth', value: `${bandwidth} MB/s`, details: `Interface: ${interfaceName}` });
  }
  async sendPortScan(ip: string, ports: number[]) {
    return this.send({ title: '🔍 Port Scan Detected', message: `Port scan from ${ip} on ${ports.length} ports`, severity: 'critical', metric: 'IP', value: ip, details: `Ports: ${ports.slice(0, 10).join(', ')}${ports.length > 10 ? '...' : ''}` });
  }
  async sendPluginInstalled(name: string, version: string) {
    return this.send({ title: '🔌 Plugin Installed', message: `Plugin "${name}" v${version} installed`, severity: 'info', metric: 'Plugin', value: name });
  }
  async sendPluginError(name: string, error: string) {
    return this.send({ title: '🔌 Plugin Error', message: `Plugin "${name}" encountered an error`, severity: 'error', metric: 'Plugin', value: name, details: error });
  }
  async sendUpdateAvailable(name: string, currentVer: string, newVer: string) {
    return this.send({ title: '📦 Update Available', message: `"${name}" can be updated from ${currentVer} to ${newVer}`, severity: 'info', metric: 'Update', value: `${currentVer} → ${newVer}` });
  }
}
export const telegramBot = new TelegramBotService();
