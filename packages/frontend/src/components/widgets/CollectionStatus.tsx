import { cn } from '../../utils/cn.js';
import { CheckCircle, AlertCircle, Clock, RefreshCw, XCircle } from 'lucide-react';
import { Skeleton } from '../shared/Skeleton.js';

/* ─────────── Collection Status ─────────── */

interface CollectionStatusProps {
  status: 'idle' | 'collecting' | 'success' | 'error';
  className?: string;
}

export function CollectionStatus({ status, className }: CollectionStatusProps) {
  const config = {
    idle: { icon: Clock, label: 'Idle', color: 'text-[hsl(var(--color-muted))]' },
    collecting: { icon: RefreshCw, label: 'Collecting...', color: 'text-[hsl(var(--color-primary))]' },
    success: { icon: CheckCircle, label: 'Success', color: 'text-[hsl(var(--color-success))]' },
    error: { icon: XCircle, label: 'Error', color: 'text-[hsl(var(--color-danger))]' },
  };

  const { icon: Icon, label, color } = config[status];

  return (
    <span className={cn('inline-flex items-center gap-1.5 text-xs font-medium', color, status === 'collecting' && 'animate-pulse', className)} role="status" aria-label={`Collection status: ${label}`}>
      <Icon className={cn('h-3 w-3', status === 'collecting' && 'animate-spin')} aria-hidden="true" />
      {label}
    </span>
  );
}

/* ─────────── Last Updated ─────────── */

interface LastUpdatedProps {
  timestamp: string;
  className?: string;
}

function formatRelativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return `${String(seconds)}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${String(minutes)}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${String(hours)}h ago`;
  return `${String(Math.floor(hours / 24))}d ago`;
}

export function LastUpdated({ timestamp, className }: LastUpdatedProps) {
  return (
    <span className={cn('inline-flex items-center gap-1 text-xs text-[hsl(var(--color-muted))]', className)} aria-label={`Last updated ${formatRelativeTime(timestamp)}`}>
      <Clock className="h-3 w-3" aria-hidden="true" />
      {formatRelativeTime(timestamp)}
    </span>
  );
}

/* ─────────── Collection Errors ─────────── */

interface CollectionError {
  message: string;
  timestamp: string;
  severity: 'warning' | 'error';
}

interface CollectionErrorsProps {
  errors: CollectionError[];
  className?: string;
}

export function CollectionErrors({ errors, className }: CollectionErrorsProps) {
  if (errors.length === 0) {
    return (
      <span className={cn('inline-flex items-center gap-1 text-xs text-[hsl(var(--color-success))]', className)}>
        <CheckCircle className="h-3 w-3" aria-hidden="true" />
        No errors
      </span>
    );
  }

  return (
    <div className={cn('space-y-1', className)} role="alert">
      {errors.map((err, i) => (
        <div key={i} className="flex items-start gap-2 rounded-lg bg-[hsl(var(--color-danger))]/5 p-2">
          <AlertCircle className="mt-0.5 h-3 w-3 shrink-0 text-[hsl(var(--color-danger))]" aria-hidden="true" />
          <div className="flex-1 min-w-0">
            <p className="text-xs text-[hsl(var(--color-text))]">{err.message}</p>
            <p className="text-xs text-[hsl(var(--color-muted))]">
              {new Date(err.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─────────── Collection Summary ─────────── */

interface CollectionSummaryProps {
  status: CollectionStatusProps['status'];
  lastUpdated: string;
  errors: CollectionError[];
  summary: string;
  isLoading?: boolean;
  className?: string;
}

export function CollectionSummary({ status, lastUpdated, errors, summary, isLoading, className }: CollectionSummaryProps) {
  if (isLoading) {
    return (
      <div className={cn('space-y-2', className)}>
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-3 w-64" />
        <Skeleton className="h-3 w-32" />
      </div>
    );
  }

  return (
    <div className={cn('flex flex-wrap items-center gap-x-4 gap-y-2 text-xs', className)}>
      <CollectionStatus status={status} />
      <LastUpdated timestamp={lastUpdated} />
      <CollectionErrors errors={errors} />
      <span className="text-[hsl(var(--color-muted))]">{summary}</span>
    </div>
  );
}
