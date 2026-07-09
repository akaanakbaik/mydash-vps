import { type ReactNode } from 'react';
import { cn } from '../../utils/cn.js';
import { EmptyState } from '../shared/EmptyState.js';
import { Skeleton } from '../shared/Skeleton.js';

export interface MetricColumn {
  key: string;
  label: string;
  sortable?: boolean;
  align?: 'left' | 'right' | 'center';
  width?: string;
  render?: (value: unknown, row: Record<string, unknown>) => ReactNode;
}

interface MetricTableProps {
  columns: MetricColumn[];
  rows: Record<string, unknown>[];
  isLoading?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  className?: string;
}

function formatCellValue(v: unknown): string {
  if (v == null) return '—';
  if (typeof v === 'string') return v;
  if (typeof v === 'number' || typeof v === 'boolean') return String(v);
  return '—';
}

export function MetricTable({
  columns, rows, isLoading, emptyTitle = 'No metrics found',
  emptyDescription = 'No data matches the current filter criteria.',
  className,
}: MetricTableProps) {
  if (isLoading) {
    return (
      <div className={cn('space-y-2', className)}>
        <div className="flex gap-4 border-b border-[hsl(var(--color-border))] pb-2">
          {columns.map((col) => (
            <Skeleton key={col.key} className={cn('h-3', col.width ?? 'flex-1')} />
          ))}
        </div>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex gap-4 py-2">
            {columns.map((col) => (
              <Skeleton key={col.key} className={cn('h-4', col.width ?? 'flex-1')} />
            ))}
          </div>
        ))}
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <EmptyState
        title={emptyTitle}
        description={emptyDescription}
        className="min-h-32"
      />
    );
  }

  return (
    <div className={cn('overflow-x-auto', className)} role="table" aria-label="Metrics table">
      <div className="min-w-full">
        {/* Header */}
        <div className="flex border-b border-[hsl(var(--color-border))]" role="row">
          {columns.map((col) => (
            <div
              key={col.key}
              className={cn(
                'px-3 py-2 text-xs font-medium text-[hsl(var(--color-muted))] uppercase tracking-wider',
                col.align === 'right' && 'text-right',
                col.align === 'center' && 'text-center',
                col.width ?? 'flex-1',
              )}
              role="columnheader"
              aria-sort={col.sortable ? 'none' : undefined}
            >
              {col.label}
            </div>
          ))}
        </div>
        {/* Rows */}
        {rows.map((row, i) => (
          <div
            key={String(i)}
            className={cn(
              'flex border-b border-[hsl(var(--color-border))]/50 transition-colors hover:bg-[hsl(var(--color-bg))]/50',
            )}
            role="row"
          >
            {columns.map((col) => (
              <div
                key={col.key}
                className={cn(
                  'px-3 py-2.5 text-sm text-[hsl(var(--color-text))]',
                  col.align === 'right' && 'text-right',
                  col.align === 'center' && 'text-center',
                  col.width ?? 'flex-1',
                )}
                role="cell"
              >
                {col.render ? col.render(row[col.key], row) : formatCellValue(row[col.key])}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
