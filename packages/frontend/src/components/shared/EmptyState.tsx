import { type ReactNode } from 'react';
import { Inbox } from 'lucide-react';
import { cn } from '../../utils/cn.js';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn('flex min-h-40 flex-col items-center justify-center gap-3 p-8', className)}>
      <div className="text-[hsl(var(--color-muted))]">{icon ?? <Inbox className="h-12 w-12" />}</div>
      <h3 className="text-lg font-medium">{title}</h3>
      {description && <p className="text-sm text-[hsl(var(--color-muted))]">{description}</p>}
      {action}
    </div>
  );
}
