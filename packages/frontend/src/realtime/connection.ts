import type { ConnectionState, ConnectionStatus, RealtimeEvent } from './types.js';
type ConnectionHandler = (event: RealtimeEvent) => void;
type StatusChangeHandler = (status: ConnectionStatus, previous: ConnectionStatus) => void;
type StateChangeHandler = (state: ConnectionState) => void;
const RECONNECT_BASE_DELAY = 1000;
const RECONNECT_MAX_DELAY = 30000;
const MAX_RECONNECT_ATTEMPTS = 20;
const HEARTBEAT_INTERVAL = 30000;
const HEARTBEAT_TIMEOUT = 10000;
const RING_BUFFER_SIZE = 512;
export class ConnectionManager {
  private ws: WebSocket | null = null;
  private url: string;
  private token: string;
  private status: ConnectionStatus = 'disconnected';
  private previousStatus: ConnectionStatus = 'disconnected';
  private reconnectAttempt = 0;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private heartbeatTimer: ReturnType<typeof setInterval> | null = null;
  private heartbeatTimeoutTimer: ReturnType<typeof setTimeout> | null = null;
  private lastPong = Date.now();
  private startedAt = 0;
  private latency = 0;
  private intentionalClose = false;
  private eventHandlers: Set<ConnectionHandler> = new Set();
  private statusHandlers: Set<StatusChangeHandler> = new Set();
  private stateHandlers: Set<StateChangeHandler> = new Set();
  private ringBuffer: RealtimeEvent[] = [];
  constructor(token?: string) {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    this.url = `${protocol}//${window.location.host}/ws`;
    this.token = token ?? '';
  }
  connect(): void {
    if (this.status === 'connected' || this.status === 'connecting') return;
    this.intentionalClose = false;
    this.setStatus('connecting');
    this.startedAt = Date.now();
    try {
      this.ws = new WebSocket(`${this.url}?token=${this.token}`);
      this.ws.onopen = () => {
        this.setStatus('connected');
        this.reconnectAttempt = 0;
        this.startHeartbeat();
      };
      this.ws.onmessage = (event: MessageEvent) => {
        try {
          const parsed = JSON.parse(event.data as string) as { type?: string };
          if (parsed.type === 'pong') {
            const now = Date.now();
            this.latency = now - this.lastPong;
            this.lastPong = now;
            this.clearHeartbeatTimeout();
          } else if (parsed.type === 'connected') {
          } else {
            const data = parsed as unknown as RealtimeEvent;
            this.dispatchToHandlers(data);
            this.addToRingBuffer(data);
          }
        } catch {
        }
      };
      this.ws.onclose = () => {
        this.stopHeartbeat();
        if (!this.intentionalClose) {
          this.setStatus('reconnecting');
          this.scheduleReconnect();
        } else {
          this.setStatus('disconnected');
        }
      };
      this.ws.onerror = () => {
      };
    } catch {
      this.setStatus('reconnecting');
      this.scheduleReconnect();
    }
  }
  disconnect(): void {
    this.intentionalClose = true;
    this.stopHeartbeat();
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.ws) {
      this.ws.onclose = null;
      this.ws.close();
      this.ws = null;
    }
    this.setStatus('disconnected');
    this.ringBuffer = [];
  }
  send(type: string, payload?: Record<string, unknown>): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type, ...payload }));
    }
  }
  private startHeartbeat(): void {
    this.stopHeartbeat();
    this.heartbeatTimer = setInterval(() => {
      this.lastPong = Date.now();
      this.send('ping');
      this.heartbeatTimeoutTimer = setTimeout(() => {
        if (this.ws) {
          this.ws.close();
        }
      }, HEARTBEAT_TIMEOUT);
    }, HEARTBEAT_INTERVAL);
  }
  private stopHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
    this.clearHeartbeatTimeout();
  }
  private clearHeartbeatTimeout(): void {
    if (this.heartbeatTimeoutTimer) {
      clearTimeout(this.heartbeatTimeoutTimer);
      this.heartbeatTimeoutTimer = null;
    }
  }
  private scheduleReconnect(): void {
    if (this.reconnectAttempt >= MAX_RECONNECT_ATTEMPTS) {
      this.setStatus('offline');
      return;
    }
    const delay = Math.min(
      RECONNECT_BASE_DELAY * Math.pow(2, this.reconnectAttempt),
      RECONNECT_MAX_DELAY,
    );
    this.reconnectAttempt++;
    this.reconnectTimer = setTimeout(() => {
      this.connect();
    }, delay);
  }
  private setStatus(newStatus: ConnectionStatus): void {
    this.previousStatus = this.status;
    this.status = newStatus;
    if (newStatus !== this.previousStatus) {
      this.notifyStatusHandlers();
      this.notifyStateHandlers();
    }
  }
  getStatus(): ConnectionStatus {
    return this.status;
  }
  getState(): ConnectionState {
    return {
      status: this.status,
      latency: this.latency,
      lastPong: this.lastPong,
      reconnectAttempt: this.reconnectAttempt,
      nextReconnectDelay: Math.min(RECONNECT_BASE_DELAY * Math.pow(2, this.reconnectAttempt), RECONNECT_MAX_DELAY),
      uptime: this.startedAt > 0 ? Date.now() - this.startedAt : 0,
    };
  }
  subscribeToEvents(handler: ConnectionHandler): () => void {
    this.eventHandlers.add(handler);
    return () => { this.eventHandlers.delete(handler); };
  }
  onConnectionState(handler: StateChangeHandler): () => void {
    this.stateHandlers.add(handler);
    return () => { this.stateHandlers.delete(handler); };
  }
  onStatusChange(handler: StatusChangeHandler): () => void {
    this.statusHandlers.add(handler);
    return () => { this.statusHandlers.delete(handler); };
  }
  private dispatchToHandlers(event: RealtimeEvent): void {
    for (const handler of this.eventHandlers) {
      try { handler(event); } catch {  }
    }
  }
  private notifyStatusHandlers(): void {
    for (const handler of this.statusHandlers) {
      try { handler(this.status, this.previousStatus); } catch {  }
    }
  }
  private notifyStateHandlers(): void {
    const state = this.getState();
    for (const handler of this.stateHandlers) {
      try { handler(state); } catch {  }
    }
  }
  private addToRingBuffer(event: RealtimeEvent): void {
    this.ringBuffer.push(event);
    if (this.ringBuffer.length > RING_BUFFER_SIZE) {
      this.ringBuffer.shift();
    }
  }
  getRingBuffer(): RealtimeEvent[] {
    return [...this.ringBuffer];
  }
}
