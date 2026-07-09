import { cn } from '../../utils/cn.js';
import { CheckCircle, AlertTriangle, XCircle, Loader2 } from 'lucide-react';

type StatusBannerVariant = 'success' | 'warning' | 'error' | 'loading';

interface StatusBannerProps {
  variant?: StatusBannerVariant;
  title: string;
  description?: string;
  className?: string;
  dismissible?: boolean;
  onDismiss?: () => void;
}

const variantStyles: Record<StatusBannerVariant, { icon: typeof CheckCircle; bg: string; border: string; text: string }> = {
  success: {
    icon: CheckCircle,
    bg: 'bg-[hsl(var(--color-success))]/5',
    border: 'border-[hsl(var(--color-success))]/20',
    text: 'text-[hsl(var(--color-success))]',
  },
  warning: {
    icon: AlertTriangle,
    bg: 'bg-[hsl(var(--color-warning))]/5',
    border: 'border-[hsl(var(--color-warning))]/20',
    text: 'text-[hsl(var(--color-warning))]',
  },
  error: {
    icon: XCircle,
    bg: 'bg-[hsl(var(--color-danger))]/5',
    border: 'border-[hsl(var(--color-danger))]/20',
    text: 'text-[hsl(var(--color-danger))]',
  },
  loading: {
    icon: Loader2,
    bg: 'bg-[hsl(var(--color-primary))]/5',
    border: 'border-[hsl(var(--color-primary))]/20',
    text: 'text-[hsl(var(--color-primary))]',
  },
};

export function StatusBanner({ variant = 'success', title, description, className, dismissible, onDismiss }: StatusBannerProps) {
  const config = variantStyles[variant];
  const Icon = variant === 'loading' ? Loader2 : config.icon;

  return (
    <div
      className={cn(
        'flex items-start gap-3 rounded-lg border px-4 py-3',
        config.bg, config.border, className,
      )}
      role="status"
      aria-live="polite"
    >
      <Icon
        className={cn('h-5 w-5 shrink-0 mt-0.5', config.text, variant === 'loading' && 'animate-spin')}
        aria-hidden="true"
      />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-[hsl(var(--color-text))]">{title}</p>
        {description && (
          <p className="mt-0.5 text-xs text-[hsl(var(--color-muted))]">{description}</p>
        )}
      </div>
      {dismissible && onDismiss && (
        <button
          onClick={onDismiss}
          className="shrink-0 rounded p-1 text-[hsl(var(--color-muted))] transition-colors hover:bg-[hsl(var(--color-border))] hover:text-[hsl(var(--color-text))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--color-primary))]"
          aria-label="Dismiss"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
}
