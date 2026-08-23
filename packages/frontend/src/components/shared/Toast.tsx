import { useCallback, useEffect, useRef, useState, createContext, useContext, type ReactNode } from 'react';
import { X, CheckCircle, AlertTriangle, AlertCircle, Info } from 'lucide-react';
import { cn } from '../../utils/cn.js';
import { getRealtimeManager, type RealtimeEvent } from '../../realtime/index.js';
type ToastType = 'success' | 'error' | 'warning' | 'info';
interface ToastAction {
  label: string;
  onClick: () => void;
}
interface ToastRecord {
  id: string;
  type: ToastType;
  title: string;
  message: string;
  action?: ToastAction;
  duration: number;
  createdAt: number;
  expiresAt: number;
  remainingMs: number;
  paused: boolean;
}
interface ToastOptions {
  title?: string;
  action?: ToastAction;
  duration?: number;
  dedupeKey?: string;
}
interface ToastContextValue {
  addToast: (type: ToastType, message: string, options?: ToastOptions) => void;
}
const ToastContext = createContext<ToastContextValue | null>(null);
const MAX_TOASTS = 4;
const DEFAULT_DURATION = 5000;
const titles: Record<ToastType, string> = { success: 'Success', error: 'Error', warning: 'Warning', info: 'Information' };
const icons: Record<ToastType, typeof CheckCircle> = { success: CheckCircle, error: AlertCircle, warning: AlertTriangle, info: Info };
const colors: Record<ToastType, string> = {
  success: 'border-[hsl(var(--color-success))]/60 text-[hsl(var(--color-success))]',
  error: 'border-[hsl(var(--color-danger))]/60 text-[hsl(var(--color-danger))]',
  warning: 'border-[hsl(var(--color-warning))]/60 text-[hsl(var(--color-warning))]',
  info: 'border-[hsl(var(--color-primary))]/60 text-[hsl(var(--color-primary))]',
};
function createId() {
  return typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function' ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}
function eventMessage(event: RealtimeEvent): string {
  const payload = event.payload;
  if (payload && typeof payload === 'object') {
    const record = payload as Record<string, unknown>;
    const message = record.message ?? record.error ?? record.title;
    if (typeof message === 'string' && message.trim()) return message;
  }
  return `${event.type.replaceAll('.', ' ')} received from ${event.channel}`;
}
function eventToast(event: RealtimeEvent): { type: ToastType; title: string } {
  if (event.type.endsWith('.failed') || event.type === 'security.alert' || event.type === 'server.offline') return { type: 'error', title: 'Infrastructure alert' };
  if (event.type === 'server.degraded' || event.type === 'tunnel.disconnected') return { type: 'warning', title: 'Infrastructure warning' };
  if (event.type.endsWith('.sent') || event.type === 'backup.completed' || event.type === 'automation.completed') return { type: 'success', title: 'Operation completed' };
  return { type: 'info', title: 'Infrastructure update' };
}
export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastRecord[]>([]);
  const timers = useRef(new Map<string, ReturnType<typeof setTimeout>>());
  const dismiss = useCallback((id: string) => {
    const timer = timers.current.get(id);
    if (timer) clearTimeout(timer);
    timers.current.delete(id);
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);
  const schedule = useCallback((id: string, delay: number) => {
    const previous = timers.current.get(id);
    if (previous) clearTimeout(previous);
    const timer = setTimeout(() => dismiss(id), Math.max(300, delay));
    timers.current.set(id, timer);
  }, [dismiss]);
  const addToast = useCallback((type: ToastType, message: string, options?: ToastOptions) => {
    const now = Date.now();
    const duration = Math.max(2200, Math.min(12000, options?.duration ?? (type === 'error' ? 8000 : DEFAULT_DURATION)));
    const key = options?.dedupeKey ?? `${type}:${message}`;
    setToasts((current) => {
      const duplicate = current.find((toast) => `${toast.type}:${toast.message}` === key);
      if (duplicate) {
        const refreshed = { ...duplicate, createdAt: now, expiresAt: now + duration, duration, remainingMs: duration, paused: false };
        schedule(duplicate.id, duration);
        return [refreshed, ...current.filter((toast) => toast.id !== duplicate.id)];
      }
      const next: ToastRecord = { id: createId(), type, title: options?.title ?? titles[type], message, action: options?.action, duration, createdAt: now, expiresAt: now + duration, remainingMs: duration, paused: false };
      schedule(next.id, duration);
      return [next, ...current].slice(0, MAX_TOASTS);
    });
  }, [schedule]);
  const pause = useCallback((id: string) => {
    const now = Date.now();
    const timer = timers.current.get(id);
    if (timer) clearTimeout(timer);
    timers.current.delete(id);
    setToasts((current) => current.map((toast) => toast.id === id ? { ...toast, remainingMs: Math.max(500, toast.expiresAt - now), paused: true } : toast));
  }, []);
  const resume = useCallback((id: string) => {
    setToasts((current) => current.map((toast) => {
      if (toast.id !== id) return toast;
      const expiresAt = Date.now() + toast.remainingMs;
      schedule(id, toast.remainingMs);
      return { ...toast, expiresAt, paused: false };
    }));
  }, [schedule]);
  useEffect(() => () => { timers.current.forEach((timer) => clearTimeout(timer)); timers.current.clear(); }, []);
  useEffect(() => {
    const manager = getRealtimeManager();
    const eventTypes = ['notification.created', 'notification.sent', 'notification.failed', 'security.alert', 'server.offline', 'server.degraded', 'tunnel.disconnected', 'backup.failed', 'backup.completed', 'automation.failed', 'automation.completed'];
    const disposers = eventTypes.map((eventType) => manager.subscribeToType(eventType, (event) => {
      const style = eventToast(event);
      addToast(style.type, eventMessage(event), { title: style.title, dedupeKey: `realtime:${event.id}`, duration: style.type === 'error' ? 9000 : 5000 });
    }));
    return () => disposers.forEach((dispose) => dispose());
  }, [addToast]);
  return (
    <ToastContext value={{ addToast }}>
      {children}
      <div className="pointer-events-none fixed inset-x-4 top-4 z-[100] flex flex-col items-stretch gap-2 sm:left-auto sm:right-4 sm:w-[min(calc(100vw-2rem),24rem)]" aria-live="polite" aria-relevant="additions text">
        {toasts.map((toast) => {
          const Icon = icons[toast.type];
          const progress = toast.paused ? toast.remainingMs / toast.duration * 100 : 100;
          return (
            <div key={toast.id} role={toast.type === 'error' ? 'alert' : 'status'} data-toast-type={toast.type} className={cn('pointer-events-auto overflow-hidden rounded-2xl border bg-[hsl(var(--color-surface))]/95 p-3 shadow-2xl backdrop-blur-xl', colors[toast.type])} onMouseEnter={() => pause(toast.id)} onMouseLeave={() => resume(toast.id)}>
              <div className="flex items-start gap-3">
                <Icon className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-[hsl(var(--color-text))]">{toast.title}</p>
                  <p className="mt-1 break-words text-xs leading-5 text-[hsl(var(--color-muted))]">{toast.message}</p>
                  {toast.action && <button type="button" onClick={() => { toast.action?.onClick(); dismiss(toast.id); }} className="mt-2 min-h-9 rounded-lg px-2.5 text-xs font-semibold text-[hsl(var(--color-primary))] transition-colors hover:bg-[hsl(var(--color-primary))]/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--color-primary))]">{toast.action.label}</button>}
                </div>
                <button type="button" onClick={() => dismiss(toast.id)} className="flex min-h-9 min-w-9 shrink-0 items-center justify-center rounded-lg text-[hsl(var(--color-muted))] transition-colors hover:bg-[hsl(var(--color-border))] hover:text-[hsl(var(--color-text))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--color-primary))]" aria-label="Dismiss notification"><X className="h-4 w-4" aria-hidden="true" /></button>
              </div>
              <div className="mt-3 h-0.5 overflow-hidden rounded-full bg-[hsl(var(--color-border))]"><div className="h-full bg-current transition-[width] duration-150" style={{ width: `${Math.max(0, Math.min(100, progress))}%` }} /></div>
            </div>
          );
        })}
      </div>
    </ToastContext>
  );
}
