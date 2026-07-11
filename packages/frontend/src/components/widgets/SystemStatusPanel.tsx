import { cn } from '../../utils/cn.js';
import { Server, Wifi, Clock, RefreshCw } from 'lucide-react';
import type { ServerInfo } from '../../services/mockDashboard.js';
interface SystemStatusPanelProps {
  server: ServerInfo;
  isOnline?: boolean;
  lastSync?: string;
  className?: string;
}
export function SystemStatusPanel({ server, isOnline = true, lastSync, className }: SystemStatusPanelProps) {
  const statusItems = [
    {
      icon: Server,
      label: 'Hostname',
      value: server.hostname,
    },
    {
      icon: Wifi,
      label: 'Online Status',
      value: isOnline ? 'Connected' : 'Disconnected',
      color: isOnline ? 'text-[hsl(var(--color-success))]' : 'text-[hsl(var(--color-danger))]',
    },
    {
      icon: Clock,
      label: 'Uptime',
      value: server.uptime,
    },
    {
      icon: RefreshCw,
      label: 'Agent Version',
      value: server.agentVersion,
    },
  ];
  return (
    <div className={cn('rounded-xl border border-[hsl(var(--color-border))] bg-[hsl(var(--color-surface))] p-5', className)}>
      <h3 className="mb-4 text-sm font-semibold text-[hsl(var(--color-text))]">System Status</h3>
      <div className="space-y-0 divide-y divide-[hsl(var(--color-border))]">
        {statusItems.map((item) => (
          <div key={item.label} className="flex items-center justify-between py-2.5 first:pt-0 last:pb-0">
            <div className="flex items-center gap-2.5">
              <item.icon className="h-4 w-4 text-[hsl(var(--color-muted))]" aria-hidden="true" />
              <span className="text-sm text-[hsl(var(--color-muted))]">{item.label}</span>
            </div>
            <span className={cn('text-sm font-medium', item.color ?? 'text-[hsl(var(--color-text))]')}>
              {item.value}
            </span>
          </div>
        ))}
      </div>
      {lastSync && (
        <div className="mt-4 flex items-center gap-2 rounded-lg bg-[hsl(var(--color-bg))] px-3 py-2">
          <div className={cn('h-2 w-2 rounded-full', isOnline ? 'bg-[hsl(var(--color-success))]' : 'bg-[hsl(var(--color-danger))]')} aria-hidden="true" />
          <span className="text-xs text-[hsl(var(--color-muted))]">
            Last sync: {lastSync}
          </span>
        </div>
      )}
    </div>
  );
}
