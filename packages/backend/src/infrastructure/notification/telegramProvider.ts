import { execSync } from 'child_process';
interface TelegramConfig {
  botToken: string;
  chatId: string;
}
interface NotificationMessage {
  title: string;
  message: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
  metric?: string;
  value?: string;
  threshold?: string;
  timestamp?: string;
}
export class TelegramNotificationProvider {
  private config: TelegramConfig | null = null;
  configure(botToken: string, chatId: string): void {
    this.config = { botToken, chatId };
  }
  isConfigured(): boolean {
    return this.config !== null && this.config.botToken.length > 0 && this.config.chatId.length > 0;
  }
  private buildMessage(notification: NotificationMessage): string {
    const ts = notification.timestamp || new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' });
    const emoji = notification.severity === 'critical' ? '🚨'
      : notification.severity === 'error' ? '❌'
      : notification.severity === 'warning' ? '⚠️'
      : 'ℹ️';
    let msg = `┌─────────────────────────────────┐\n`;
    msg += `${emoji} *${notification.title}*\n`;
    msg += `└─────────────────────────────────┘\n\n`;
    msg += `📋 *Status:* ${notification.message}\n`;
    if (notification.metric) msg += `📊 *Metric:* ${notification.metric}\n`;
    if (notification.value) msg += `📈 *Value:* ${notification.value}\n`;
    if (notification.threshold) msg += `🎯 *Threshold:* ${notification.threshold}\n`;
    msg += `\n🕐 *Time:* ${ts} WIB\n`;
    msg += `🏠 *Server:* My Dash VPS\n`;
    msg += `\n━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    msg += `\n🔗 [Open Dashboard](https://mydash.local)`;
    return msg;
  }
  async send(notification: NotificationMessage): Promise<boolean> {
    if (!this.isConfigured()) return false;
    try {
      const cfg = this.config;
      if (!cfg) return false;
      const text = this.buildMessage(notification);
      const encodedText = encodeURIComponent(text);
      const url = `https://api.telegram.org/bot${cfg.botToken}/sendMessage?chat_id=${cfg.chatId}&text=${encodedText}&parse_mode=Markdown`;
      execSync(`curl -s --max-time 5 "${url}" > /dev/null 2>&1`, { encoding: 'utf-8', timeout: 8000 });
      return true;
    } catch {
      return false;
    }
  }
  async sendCpuAlert(cpuPercent: number, threshold: number): Promise<boolean> {
    return this.send({
      title: 'CPU Alert',
      message: `CPU usage has exceeded the threshold`,
      severity: cpuPercent > 90 ? 'critical' : 'warning',
      metric: 'CPU Usage',
      value: `${cpuPercent.toFixed(1)}%`,
      threshold: `${threshold}%`,
    });
  }
  async sendMemoryAlert(ramPercent: number, threshold: number): Promise<boolean> {
    return this.send({
      title: 'Memory Alert',
      message: `RAM usage has exceeded the threshold`,
      severity: ramPercent > 90 ? 'critical' : 'warning',
      metric: 'RAM Usage',
      value: `${ramPercent.toFixed(1)}%`,
      threshold: `${threshold}%`,
    });
  }
  async sendDiskAlert(diskPercent: number, threshold: number): Promise<boolean> {
    return this.send({
      title: 'Disk Alert',
      message: `Disk usage has exceeded the threshold`,
      severity: diskPercent > 90 ? 'critical' : 'warning',
      metric: 'Disk Usage',
      value: `${diskPercent.toFixed(1)}%`,
      threshold: `${threshold}%`,
    });
  }
  async sendBackupComplete(name: string, size: string): Promise<boolean> {
    return this.send({
      title: 'Backup Complete ✅',
      message: `Backup "${name}" completed successfully`,
      severity: 'info',
      metric: 'Backup Size',
      value: size,
    });
  }
  async sendSystemDown(): Promise<boolean> {
    return this.send({
      title: '⚠️ SYSTEM DOWN',
      message: 'The monitoring system has detected that the server is unreachable',
      severity: 'critical',
    });
  }
  async sendServiceAlert(serviceName: string, status: string): Promise<boolean> {
    return this.send({
      title: 'Service Alert',
      message: `Service "${serviceName}" is ${status}`,
      severity: status === 'failed' ? 'error' : 'warning',
      metric: 'Service',
      value: status,
    });
  }
}
export const telegramProvider = new TelegramNotificationProvider();
