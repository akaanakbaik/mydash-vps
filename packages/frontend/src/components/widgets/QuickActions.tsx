import { useNavigate } from 'react-router-dom';
import { cn } from '../../utils/cn.js';
import {
  HardDrive, RefreshCw, Terminal, FileText, type LucideIcon,
} from 'lucide-react';
const iconMap: Record<string, LucideIcon> = {
  HardDrive, RefreshCw, Terminal, FileText,
};
interface QuickAction {
  label: string;
  icon: string;
  description: string;
  to: string;
}
interface QuickActionsProps {
  actions: QuickAction[];
  className?: string;
}
export function QuickActions({ actions, className }: QuickActionsProps) {
  const navigate = useNavigate();
  if (actions.length === 0) {
    return (
      <div className={cn('flex min-h-24 items-center justify-center text-sm text-[hsl(var(--color-muted))]', className)}>
        No quick actions available
      </div>
    );
  }
  return (
    <div className={cn('grid grid-cols-2 gap-3', className)}>
      {actions.map((action) => {
        const Icon = iconMap[action.icon] ?? Terminal;
        return (
          <button
            key={action.label}
            type="button"
            onClick={() => { void navigate(action.to); }}
            className="flex items-center gap-3 rounded-lg border border-[hsl(var(--color-border))] bg-[hsl(var(--color-surface))] p-3 text-left transition-all hover:border-[hsl(var(--color-primary))]/40 hover:bg-[hsl(var(--color-primary))]/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--color-primary))]"
            aria-label={`Quick action: ${action.label}`}
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[hsl(var(--color-primary))]/10">
              <Icon className="h-4 w-4 text-[hsl(var(--color-primary))]" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-[hsl(var(--color-text))]">{action.label}</p>
              <p className="text-xs text-[hsl(var(--color-muted))] truncate">{action.description}</p>
            </div>
          </button>
        );
      })}
    </div>
  );
}
