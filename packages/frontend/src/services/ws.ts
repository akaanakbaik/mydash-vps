type MessageHandler = (data: unknown) => void;
class WsClient {
  private ws: WebSocket | null = null;
  private handlers = new Map<string, Set<MessageHandler>>();
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private url: string;
  private reconnectAttempts = 0;
  constructor() {
    const wsProtocol = location.protocol === 'https:' ? 'wss:' : 'ws:';
    this.url = `${wsProtocol}//${location.host}/ws`;
  }
  connect(): void {
    if (this.ws?.readyState === WebSocket.OPEN) return;
    this.ws = new WebSocket(this.url);
    this.ws.onopen = () => {
      this.reconnectAttempts = 0;
    };
    this.ws.onmessage = (event: MessageEvent<string>) => {
      const msg = JSON.parse(event.data) as { type: string; channel?: string; payload?: unknown };
      const hs = this.handlers.get(msg.type);
      if (hs) {
        for (const h of hs) { h(msg); }
      }
    };
    this.ws.onclose = () => {
      this.scheduleReconnect();
    };
    this.ws.onerror = () => {
      this.ws?.close();
    };
  }
  subscribe(type: string, handler: MessageHandler): () => void {
    const existing = this.handlers.get(type) ?? new Set();
    existing.add(handler);
    this.handlers.set(type, existing);
    return () => {
      const hs = this.handlers.get(type);
      if (hs) {
        hs.delete(handler);
        if (hs.size === 0) { this.handlers.delete(type); }
      }
    };
  }
  send(type: string, payload?: unknown): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type, payload }));
    }
  }
  disconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    this.ws?.close();
    this.ws = null;
  }
  private scheduleReconnect(): void {
    if (this.reconnectAttempts > 10) return;
    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
    this.reconnectAttempts++;
    this.reconnectTimer = setTimeout(() => { this.connect(); }, delay);
  }
}
export const wsClient = new WsClient();
