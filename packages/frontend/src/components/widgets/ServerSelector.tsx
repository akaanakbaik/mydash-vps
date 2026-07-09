import { cn } from '../../utils/cn.js';
import { Server, ChevronDown } from 'lucide-react';

interface ServerOption {
  id: string;
  label: string;
  hostname: string;
  status: 'online' | 'offline' | 'warning';
}

interface ServerSelectorProps {
  servers: ServerOption[];
  selected: string;
  onChange: (id: string) => void;
  className?: string;
}

const statusColors: Record<string, string> = {
  online: 'bg-[hsl(var(--color-success))]',
  offline: 'bg-[hsl(var(--color-muted))]',
  warning: 'bg-[hsl(var(--color-warning))]',
};

export function ServerSelector({ servers, selected, onChange, className }: ServerSelectorProps) {
  if (servers.length === 0) {
    return null;
  }

  const current = servers.find((s) => s.id === selected) ?? servers[0];

  if (servers.length === 1) {
    return (
      <div className={cn('flex items-center gap-2 rounded-lg border border-[hsl(var(--color-border))] bg-[hsl(var(--color-surface))] px-3 py-2', className)}>
        <Server className="h-4 w-4 text-[hsl(var(--color-muted))]" aria-hidden="true" />
        <div className="flex items-center gap-2">
          <span className={cn('h-2 w-2 rounded-full', statusColors[current.status])} aria-label={current.status} />
          <span className="text-sm font-medium text-[hsl(var(--color-text))]">{current.label}</span>
          <span className="text-xs text-[hsl(var(--color-muted))]">{current.hostname}</span>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('relative', className)}>
      <div className="flex items-center gap-2 rounded-lg border border-[hsl(var(--color-border))] bg-[hsl(var(--color-surface))] px-3 py-2">
        <Server className="h-4 w-4 text-[hsl(var(--color-muted))]" aria-hidden="true" />
        <span className={cn('h-2 w-2 rounded-full', statusColors[current.status])} aria-label={current.status} />
        <span className="text-sm font-medium text-[hsl(var(--color-text))]">{current.label}</span>
        <ChevronDown className="h-3.5 w-3.5 text-[hsl(var(--color-muted))]" aria-hidden="true" />
      </div>
      <select
        value={selected}
        onChange={(e) => { onChange(e.target.value); }}
        className="absolute inset-0 cursor-pointer opacity-0"
        aria-label="Select server"
      >
        {servers.map((s) => (
          <option key={s.id} value={s.id}>
            {s.label} ({s.hostname})
          </option>
        ))}
      </select>
    </div>
  );
}
