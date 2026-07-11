import { useRealtimeConnection } from '../useRealtime.js';
import { cn } from '../../utils/cn.js';
export function ConnectionBadge({ className }: { className?: string }) {
  const { status, latency } = useRealtimeConnection();
  const config: Record<string, { color: string; dot: string; label: string }> = {
    connected: { color: 'text-[hsl(var(--color-success))]', dot: 'bg-[hsl(var(--color-success))]', label: 'Connected' },
    connecting: { color: 'text-[hsl(var(--color-primary))]', dot: 'bg-[hsl(var(--color-primary))]', label: 'Connecting' },
    reconnecting: { color: 'text-[hsl(var(--color-warning))]', dot: 'bg-[hsl(var(--color-warning))]', label: 'Reconnecting' },
    disconnected: { color: 'text-[hsl(var(--color-muted))]', dot: 'bg-[hsl(var(--color-muted))]', label: 'Disconnected' },
    degraded: { color: 'text-[hsl(var(--color-warning))]', dot: 'bg-[hsl(var(--color-warning))]', label: 'Degraded' },
    offline: { color: 'text-[hsl(var(--color-danger))]', dot: 'bg-[hsl(var(--color-danger))]', label: 'Offline' },
  };
  const c = config[status] ?? config.disconnected;
  return (
    <span
      className={cn('inline-flex items-center gap-1.5 text-xs font-medium', c.color, className)}
      role="status"
      aria-live="polite"
      aria-label={`Connection: ${c.label}${status === 'connected' ? `, latency: ${String(latency)}ms` : ''}`}
    >
      <span className={cn('h-2 w-2 rounded-full', c.dot, status === 'connecting' && 'animate-pulse')} aria-hidden="true" />
      {c.label}
      {status === 'connected' && latency >= 0 && (
        <span className="text-[10px] opacity-70">({latency}ms)</span>
      )}
    </span>
  );
}
interface LiveIndicatorProps {
  isLive?: boolean;
  label?: string;
  className?: string;
}
export function LiveIndicator({ isLive = true, label, className }: LiveIndicatorProps) {
  return (
    <span
      className={cn('inline-flex items-center gap-1.5 text-xs font-medium', isLive ? 'text-[hsl(var(--color-success))]' : 'text-[hsl(var(--color-muted))]', className)}
      role="status"
      aria-live="off"
      aria-label={isLive ? 'Live updates active' : 'Live updates paused'}
    >
      <span className={cn('h-1.5 w-1.5 rounded-full', isLive ? 'bg-[hsl(var(--color-success))] animate-pulse' : 'bg-[hsl(var(--color-muted))]')} aria-hidden="true" />
      {label ?? (isLive ? 'Live' : 'Paused')}
    </span>
  );
}
interface SyncBadgeProps {
  lastSync?: string;
  isSyncing?: boolean;
  pendingCount?: number;
  className?: string;
}
export function SyncBadge({ lastSync, isSyncing, pendingCount, className }: SyncBadgeProps) {
  return (
    <span
      className={cn('inline-flex items-center gap-1.5 text-xs text-[hsl(var(--color-muted))]', className)}
      role="status"
      aria-live="polite"
      aria-label={isSyncing ? 'Synchronizing' : `Last synchronized${pendingCount != null && pendingCount > 0 ? `, ${String(pendingCount)} pending updates` : ''}`}
    >
      {isSyncing && (
        <svg className="h-3 w-3 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-20" />
          <path d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" fill="currentColor" className="opacity-80" />
        </svg>
      )}
      {!isSyncing && pendingCount !== undefined && pendingCount > 0 && (
        <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-[hsl(var(--color-primary))] text-[8px] font-bold text-white">
          {pendingCount > 9 ? '9+' : String(pendingCount)}
        </span>
      )}
      {lastSync && !isSyncing && <span>Last sync: {formatTimeAgo(lastSync)}</span>}
    </span>
  );
}
function formatTimeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${String(mins)}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${String(hrs)}h ago`;
  return `${String(Math.floor(hrs / 24))}d ago`;
}
export function OfflineBanner({ className }: { className?: string }) {
  const { status } = useRealtimeConnection();
  if (status !== 'offline' && status !== 'reconnecting' && status !== 'disconnected') return null;
  const messages: Record<string, { title: string; description: string; variant: string }> = {
    offline: { title: 'You are offline', description: 'Dashboard data may be outdated. Reconnecting automatically when connection is restored.', variant: 'bg-[hsl(var(--color-danger))]/10 border-[hsl(var(--color-danger))]/30 text-[hsl(var(--color-danger))]' },
    reconnecting: { title: 'Reconnecting...', description: 'Attempting to restore realtime connection. Data will sync automatically.', variant: 'bg-[hsl(var(--color-warning))]/10 border-[hsl(var(--color-warning))]/30 text-[hsl(var(--color-warning))]' },
    disconnected: { title: 'Disconnected', description: 'Realtime connection lost. Check your network connection.', variant: 'bg-[hsl(var(--color-muted))]/10 border-[hsl(var(--color-muted))]/30 text-[hsl(var(--color-muted))]' },
  };
  const msg = messages[status] ?? messages.disconnected;
  return (
    <div
      className={cn('flex items-center gap-3 rounded-lg border px-4 py-3 text-sm', msg.variant, className)}
      role="alert"
      aria-live="assertive"
    >
      {status === 'reconnecting' ? (
        <svg className="h-4 w-4 animate-spin shrink-0" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-20" />
          <path d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" fill="currentColor" />
        </svg>
      ) : (
        <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
        </svg>
      )}
      <div className="flex-1 min-w-0">
        <p className="font-medium">{msg.title}</p>
        <p className="text-xs opacity-80">{msg.description}</p>
      </div>
    </div>
  );
}
export function BackgroundSyncIndicator({ isFetching, lastUpdated }: { isFetching: boolean; lastUpdated?: string; className?: string }) {
  if (!isFetching && !lastUpdated) return null;
  return (
    <div className="flex items-center gap-2" role="status" aria-live="polite">
      {isFetching && (
        <svg className="h-3 w-3 animate-spin text-[hsl(var(--color-muted))]" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-20" />
          <path d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" fill="currentColor" />
        </svg>
      )}
      {lastUpdated && (
        <span className="text-[10px] text-[hsl(var(--color-muted))]">{formatTimeAgo(lastUpdated)}</span>
      )}
    </div>
  );
}
