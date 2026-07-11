import { type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink, Heart } from 'lucide-react';
import { cn } from '../../utils/cn.js';
interface FooterProps {
  className?: string;
  children?: ReactNode;
}
export function Footer({ className, children }: FooterProps) {
  return (
    <footer
      className={cn(
        'flex shrink-0 items-center justify-between border-t border-[hsl(var(--color-border))] bg-[hsl(var(--color-surface))] px-4 sm:px-6 py-2 text-xs text-[hsl(var(--color-muted))]',
        className,
      )}
      role="contentinfo"
    >
      <span className="flex items-center gap-2">
        <span className="hidden sm:inline">My Dash</span>
        <span className="hidden sm:inline">v1.0</span>
        <span className="sm:hidden">v1.0</span>
        <span className="hidden sm:inline-flex items-center gap-1">
          <Heart className="h-3 w-3 text-[hsl(var(--color-danger))]" fill="currentColor" />
          <span>Self-hosted</span>
        </span>
      </span>
      <div className="flex items-center gap-3 sm:gap-4">
        <Link
          to="/terms"
          className="inline-flex items-center gap-1 transition-colors hover:text-[hsl(var(--color-text))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--color-primary))] rounded"
        >
          <ExternalLink className="h-3 w-3" />
          <span>Terms</span>
        </Link>
        <Link
          to="/privacy"
          className="inline-flex items-center gap-1 transition-colors hover:text-[hsl(var(--color-text))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--color-primary))] rounded"
        >
          <ExternalLink className="h-3 w-3" />
          <span>Privacy</span>
        </Link>
        {children && <div className="flex items-center gap-4">{children}</div>}
      </div>
    </footer>
  );
}
