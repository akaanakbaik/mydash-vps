import { execSync } from 'child_process';
interface WhatsAppConfig {
  phoneNumber: string;
}
interface NotificationMessage {
  title: string;
  message: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
  metric?: string;
  value?: string;
  details?: string;
}
export class WhatsAppNotificationProvider {
  private config: WhatsAppConfig | null = null;
  configure(phoneNumber: string): void {
    this.config = { phoneNumber };
  }
  isConfigured(): boolean {
    return this.config !== null && this.config.phoneNumber.length > 0;
  }
  private buildMessage(n: NotificationMessage): string {
    const emoji = n.severity === 'critical' ? '🚨'
      : n.severity === 'error' ? '❌'
      : n.severity === 'warning' ? '⚠️'
      : '✅';
    let msg = `${emoji} *My Dash Notification*\n\n`;
    msg += `*${n.title}*\n`;
    msg += `${n.message}\n\n`;
    if (n.metric) msg += `📊 *${n.metric}*`;
    if (n.value) msg += `: ${n.value}`;
    if (n.metric) msg += '\n';
    if (n.details) msg += `\n${n.details}\n`;
    msg += `\n🕐 ${new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })} WIB`;
    return msg;
  }
  async send(notification: NotificationMessage): Promise<boolean> {
    if (!this.isConfigured()) return false;
    try {
      const text = this.buildMessage(notification);
      const encoded = encodeURIComponent(text);
      const phone = this.config!.phoneNumber.replace(/[^0-9]/g, '');
      execSync(
        `curl -s --max-time 5 "https://api.callmebot.com/whatsapp.php?phone=${phone}&text=${encoded}&apikey= "`,
        { encoding: 'utf-8', timeout: 8000 },
      );
      return true;
    } catch {
      return false;
    }
  }
  async sendAlert(title: string, message: string, severity: NotificationMessage['severity']): Promise<boolean> {
    return this.send({ title, message, severity });
  }
}
export const whatsappProvider = new WhatsAppNotificationProvider();
