import { type ReactNode } from 'react';
import { cn } from '../../utils/cn.js';
interface SkeletonProps {
  className?: string;
}
export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn('animate-pulse rounded-md bg-[hsl(var(--color-border))]', className)}
      aria-hidden="true"
    />
  );
}
interface SkeletonBlockProps {
  lines?: number;
  className?: string;
}
export function SkeletonBlock({ lines = 3, className }: SkeletonBlockProps) {
  return (
    <div className={cn('space-y-3', className)} aria-label="Loading content" role="status">
      <Skeleton className="h-4 w-3/4" />
      {Array.from({ length: lines - 1 }).map((_, i) => (
        <Skeleton
          key={i}
          className={cn('h-4', i === lines - 2 ? 'w-1/2' : 'w-full')}
        />
      ))}
      <span className="sr-only">Loading...</span>
    </div>
  );
}
export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={cn('rounded-xl border border-[hsl(var(--color-border))] bg-[hsl(var(--color-surface))] p-5', className)} aria-label="Loading card" role="status">
      <div className="flex items-center justify-between mb-4">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-4 w-8" />
      </div>
      <div className="space-y-3">
        <Skeleton className="h-8 w-24" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-2/3" />
      </div>
      <span className="sr-only">Loading...</span>
    </div>
  );
}
interface ErrorStateProps {
  title?: string;
  message?: string;
  action?: ReactNode;
  className?: string;
}
export function ErrorState({ title = 'Failed to load', message = 'An error occurred while loading data. Please try again.', action, className }: ErrorStateProps) {
  return (
    <div className={cn('flex min-h-32 flex-col items-center justify-center gap-2 p-6', className)} role="alert">
      <svg className="h-8 w-8 text-[hsl(var(--color-danger))]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
      </svg>
      <p className="text-sm font-medium text-[hsl(var(--color-text))]">{title}</p>
      <p className="text-xs text-[hsl(var(--color-muted))] text-center max-w-xs">{message}</p>
      {action}
    </div>
  );
}
