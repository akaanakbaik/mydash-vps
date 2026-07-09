import { type ReactNode } from 'react';
import { cn } from '../../utils/cn.js';

interface FooterProps {
  className?: string;
  children?: ReactNode;
}

export function Footer({ className, children }: FooterProps) {
  return (
    <footer
      className={cn(
        'flex h-10 shrink-0 items-center justify-between border-t border-[hsl(var(--color-border))] bg-[hsl(var(--color-surface))] px-4 sm:px-6 text-xs text-[hsl(var(--color-muted))]',
        className,
      )}
      role="contentinfo"
    >
      <span className="flex items-center gap-2">
        <span className="hidden sm:inline">MyDash</span>
        <span className="hidden sm:inline">v0.1.0</span>
        <span className="sm:hidden">v0.1.0</span>
      </span>
      {children && <div className="flex items-center gap-4">{children}</div>}
    </footer>
  );
}
