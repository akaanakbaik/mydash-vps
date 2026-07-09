import { cn } from '../../utils/cn.js';
import {
  Shield, Bot, Bell, GitBranch, Package, Terminal, HardDrive, RotateCcw,
  type LucideIcon,
} from 'lucide-react';
import type { Activity } from '../../services/mockDashboard.js';

const activityIcons: Record<string, LucideIcon> = {
  security: Shield,
  automation: Bot,
  notification: Bell,
  github: GitBranch,
  docker: Package,
  tunnel: Terminal,
  backup: HardDrive,
  restore: RotateCcw,
};

const severityColors: Record<string, string> = {
  info: 'bg-[hsl(var(--color-primary))]',
  success: 'bg-[hsl(var(--color-success))]',
  warning: 'bg-[hsl(var(--color-warning))]',
  error: 'bg-[hsl(var(--color-danger))]',
};

function formatRelativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${String(mins)}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${String(hours)}h ago`;
  const days = Math.floor(hours / 24);
  return `${String(days)}d ago`;
}

interface RecentActivityPanelProps {
  activities: Activity[];
  className?: string;
}

export function RecentActivityPanel({ activities, className }: RecentActivityPanelProps) {
  if (activities.length === 0) {
    return (
      <div className={cn('flex min-h-32 items-center justify-center text-sm text-[hsl(var(--color-muted))]', className)}>
        No recent activity
      </div>
    );
  }

  return (
    <div className={cn('space-y-0', className)}>
      {activities.map((activity, index) => {
        const Icon = activityIcons[activity.type] ?? Bell;

        return (
          <div
            key={activity.id}
            className={cn(
              'flex items-start gap-3 py-2.5 transition-colors hover:bg-[hsl(var(--color-border))]/20',
              index > 0 && 'border-t border-[hsl(var(--color-border))]/50',
            )}
          >
            {/* Timeline indicator */}
            <div className="relative flex flex-col items-center pt-0.5">
              <div className={cn('h-2 w-2 rounded-full', severityColors[activity.severity] ?? 'bg-[hsl(var(--color-muted))]')} aria-hidden="true" />
              {index < activities.length - 1 && (
                <div className="mt-1 h-full w-px bg-[hsl(var(--color-border))]" aria-hidden="true" />
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <p className="text-sm text-[hsl(var(--color-text))] leading-snug">{activity.message}</p>
              <div className="mt-1 flex items-center gap-2">
                <Icon className="h-3 w-3 text-[hsl(var(--color-muted))]" aria-hidden="true" />
                <span className="text-xs text-[hsl(var(--color-muted))]">
                  {formatRelativeTime(activity.timestamp)}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
