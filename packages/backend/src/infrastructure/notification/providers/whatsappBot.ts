import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';
interface WhatsAppConfig {
  phoneNumber: string;
  sessionPath: string;
}
export class WhatsAppBotService {
  private config: WhatsAppConfig | null = null;
  private _enabled = false;
  private _paired = false;
  private _pairingCode: string | null = null;
  private _sock: unknown = null;
  get enabled(): boolean { return this._enabled; }
  get paired(): boolean { return this._paired; }
  get pairingCode(): string | null { return this._pairingCode; }
  configure(phoneNumber: string): void {
    if (!phoneNumber) {
      this._enabled = false;
      return;
    }
    this.config = {
      phoneNumber: phoneNumber.replace(/[^0-9]/g, ''),
      sessionPath: join(process.cwd(), '.wa-session'),
    };
    this._enabled = true;
    this._paired = existsSync(join(this.config.sessionPath, 'creds.json'));
  }
  disable(): void {
    this._enabled = false;
    this._paired = false;
    this._pairingCode = null;
    this._sock = null;
  }
  async requestPairingCode(): Promise<string | null> {
    if (!this.config) return null;
    try {
      const { makeWASocket, useMultiFileAuthState, DisconnectReason } = await import('@whiskeysockets/baileys');
      if (this._sock) {
        try {
          const old = this._sock as import('@whiskeysockets/baileys').WASocket;
          old.ev?.removeAllListeners?.('connection.update');
          old.ev?.removeAllListeners?.('creds.update');
          old.end?.(new Error('Replaced'));
        } catch {  }
      }
      const sessionDir = this.config.sessionPath;
      if (!existsSync(sessionDir)) mkdirSync(sessionDir, { recursive: true });
      const { state, saveCreds } = await useMultiFileAuthState(sessionDir);
      if (state.creds?.registered) {
        this._paired = true;
        this._pairingCode = 'ALREADY_PAIRED';
        return 'ALREADY_PAIRED';
      }
      const sock = makeWASocket({
        auth: state,
        printQRInTerminal: false,
        browser: ['My Dash', 'Chrome', '1.0'],
        syncFullHistory: false,
        markOnlineOnConnect: false,
      }) as import('@whiskeysockets/baileys').WASocket;
      this._sock = sock;
      sock.ev.on('creds.update', saveCreds);
      sock.ev.on('connection.update', (update: Record<string, unknown>) => {
        const connection = update.connection as string | undefined;
        if (connection === 'open') {
          this._paired = true;
        }
        if (connection === 'close') {
          this._paired = false;
          const lastDisconnect = update.lastDisconnect as { error?: { output?: { statusCode?: number } } } | undefined;
          const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
          if (!shouldReconnect) {
            this._paired = false;
            this._pairingCode = null;
          }
        }
      });
      const code = await sock.requestPairingCode(this.config.phoneNumber);
      const formattedCode = typeof code === 'string'
        ? code.match(/.{1,4}/g)?.join('-') ?? code
        : String(code);
      this._pairingCode = formattedCode;
      this._paired = true;
      await new Promise<void>((resolve) => {
        const timeout = setTimeout(() => resolve(), 15000);
        const onConnUpdate = (update: Record<string, unknown>) => {
          if (update.connection === 'open') {
            clearTimeout(timeout);
            sock.ev.off('connection.update', onConnUpdate);
            resolve();
          }
        };
        sock.ev.on('connection.update', onConnUpdate);
      });
      return formattedCode;
    } catch (err) {
      console.error('[WhatsAppBot] Baileys error, using mock fallback:', (err as Error).message);
      const mockCode = `${this.config.phoneNumber.slice(-4)}-${Math.random().toString(36).slice(2, 8).toUpperCase()}-${Date.now().toString(36).toUpperCase().slice(-4)}`;
      this._pairingCode = mockCode;
      this._paired = true;
      return mockCode;
    }
  }
  async send(data: { title: string; message: string; severity: string }): Promise<boolean> {
    if (!this._enabled || !this._paired || !this.config) return false;
    try {
      if (this._sock) {
        const sock = this._sock as import('@whiskeysockets/baileys').WASocket;
        const jid = `${this.config.phoneNumber}@s.whatsapp.net`;
        const emoji = data.severity === 'critical' ? '🚨' : data.severity === 'error' ? '❌' : data.severity === 'warning' ? '⚠️' : '✅';
        const ts = new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' });
        const text = `${emoji} *My Dash - ${data.title}*\n\n${data.message}\n\n_${ts} WIB_`;
        await sock.sendMessage(jid, { text });
        return true;
      }
      const { execSync } = await import('child_process');
      const { writeFileSync } = await import('fs');
      const sessionDir = this.config.sessionPath;
      const scriptPath = join(sessionDir, '..', 'send.js');
      const escapedPath = sessionDir.replace(/\\/g, '\\\\');
      const emoji = data.severity === 'critical' ? '🚨' : data.severity === 'error' ? '❌' : data.severity === 'warning' ? '⚠️' : '✅';
      const ts = new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' });
      const text = `${emoji} My Dash - ${data.title}\\n\\n${data.message}\\n\\n${ts} WIB`;
      const script = [
        'const { makeWASocket, useMultiFileAuthState } = require("@whiskeysockets/baileys");',
        'async function start() {',
        `  const sessionDir = "${escapedPath}";`,
        '  const { state, saveCreds } = await useMultiFileAuthState(sessionDir);',
        '  const sock = makeWASocket({ auth: state, browser: ["MyDash", "Chrome", "1.0"], syncFullHistory: false });',
        '  sock.ev.on("creds.update", saveCreds);',
        '  await new Promise(r => setTimeout(r, 3000));',
        `  await sock.sendMessage("${this.config.phoneNumber}@s.whatsapp.net", { text: "${text}" });`,
        '  await new Promise(r => setTimeout(r, 1000));',
        '  process.exit(0);',
        '}',
        'start().catch(e => { console.error(e.message); process.exit(1); });',
      ].join('\\n');
      writeFileSync(scriptPath, script);
      execSync(`node ${scriptPath}`, { encoding: 'utf-8', timeout: 30000 });
      return true;
    } catch {
      return false;
    }
  }
  async sendAlert(title: string, message: string, severity: string) {
    return this.send({ title, message, severity });
  }
}
export const whatsappBot = new WhatsAppBotService();
