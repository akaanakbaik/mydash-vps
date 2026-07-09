import { useState } from 'react';
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
} from '@tanstack/react-table';
import { cn } from '../../utils/cn.js';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { Skeleton } from '../shared/Skeleton.js';
import { NotificationEmptyState } from './notification.js';

interface NotificationHistoryRowData {
  id: number;
  timestamp: string;
  title: string;
  message: string;
  provider: string;
  status: string;
  category: string;
  severity: string;
  retryCount: number;
  latency: number;
}

interface NotificationHistoryTableProps {
  data: NotificationHistoryRowData[];
  isLoading?: boolean;
  className?: string;
}

const statusConfig: Record<string, { color: string; label: string }> = {
  delivered: { color: 'text-[hsl(var(--color-success))]', label: 'Delivered' },
  failed: { color: 'text-[hsl(var(--color-danger))]', label: 'Failed' },
  pending: { color: 'text-[hsl(var(--color-warning))]', label: 'Pending' },
  rate_limited: { color: 'text-[hsl(var(--color-accent))]', label: 'Rate Limited' },
  deduplicated: { color: 'text-[hsl(var(--color-muted))]', label: 'Deduplicated' },
};

const severityDot: Record<string, string> = {
  info: 'bg-[hsl(var(--color-accent))]',
  success: 'bg-[hsl(var(--color-success))]',
  warning: 'bg-[hsl(var(--color-warning))]',
  error: 'bg-[hsl(var(--color-danger))]',
};

function formatTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export function NotificationHistoryTable({ data, isLoading, className }: NotificationHistoryTableProps) {
  const [sorting, setSorting] = useState<SortingState>([{ id: 'timestamp', desc: true }]);

  const columns: ColumnDef<NotificationHistoryRowData>[] = [
    {
      id: 'timestamp',
      header: 'Time',
      accessorFn: (row) => row.timestamp,
      sortingFn: 'datetime',
      cell: ({ row }) => <span className="text-xs text-[hsl(var(--color-muted))]">{formatTime(row.original.timestamp)}</span>,
    },
    {
      id: 'title',
      header: 'Title',
      accessorFn: (row) => row.title,
      cell: ({ row }) => (
        <div className="flex items-center gap-1.5">
          <span className={cn('h-1.5 w-1.5 rounded-full', severityDot[row.original.severity])} aria-hidden="true" />
          <span className="text-sm font-medium text-[hsl(var(--color-text))]">{row.original.title}</span>
        </div>
      ),
    },
    {
      id: 'provider',
      header: 'Provider',
      accessorFn: (row) => row.provider,
      cell: ({ row }) => <span className="text-xs text-[hsl(var(--color-muted))]">{row.original.provider}</span>,
    },
    {
      id: 'status',
      header: 'Status',
      accessorFn: (row) => row.status,
      cell: ({ row }) => {
        const cfg = statusConfig[row.original.status];
        return (
          <span className={cn('text-xs font-medium', cfg.color)}>{cfg.label}</span>
        );
      },
    },
    {
      id: 'retryCount',
      header: 'Retries',
      accessorFn: (row) => row.retryCount,
      sortingFn: 'basic',
      cell: ({ row }) => <span className="text-xs text-[hsl(var(--color-muted))]">{String(row.original.retryCount)}</span>,
    },
    {
      id: 'latency',
      header: 'Latency',
      accessorFn: (row) => row.latency,
      sortingFn: 'basic',
      cell: ({ row }) => <span className="text-xs text-[hsl(var(--color-muted))]">{row.original.latency > 0 ? `${String(row.original.latency)}ms` : '—'}</span>,
    },
  ];

  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  if (isLoading) {
    return (
      <div className={cn('space-y-2', className)}>
        <div className="flex gap-4 border-b border-[hsl(var(--color-border))] pb-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-3 flex-1" />
          ))}
        </div>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex gap-4 py-2">
            {Array.from({ length: 6 }).map((_, j) => (
              <Skeleton key={j} className="h-4 flex-1" />
            ))}
          </div>
        ))}
      </div>
    );
  }

  if (table.getRowModel().rows.length === 0) {
    return (
      <NotificationEmptyState title="No history" description="No notification history records match the current filters." />
    );
  }

  return (
    <div className={cn('overflow-x-auto', className)} role="table" aria-label="Notification history table">
      <div className="min-w-full">
        {table.getHeaderGroups().map((headerGroup) => (
          <div key={headerGroup.id} className="flex border-b border-[hsl(var(--color-border))]" role="row">
            {headerGroup.headers.map((header) => {
              const canSort = header.column.getCanSort();
              return (
                <div
                  key={header.id}
                  className={cn(
                    'flex items-center gap-1 px-3 py-2 text-xs font-medium text-[hsl(var(--color-muted))] uppercase tracking-wider flex-1',
                    canSort && 'cursor-pointer select-none hover:text-[hsl(var(--color-text))]',
                  )}
                  role="columnheader"
                  onClick={canSort ? header.column.getToggleSortingHandler() : undefined}
                  aria-sort={
                    header.column.getIsSorted() === 'asc' ? 'ascending' :
                    header.column.getIsSorted() === 'desc' ? 'descending' : 'none'
                  }
                >
                  {flexRender(header.column.columnDef.header, header.getContext())}
                  {canSort && (
                    <span className="text-[hsl(var(--color-muted))]">
                      {header.column.getIsSorted() === 'asc' ? <ArrowUp className="h-3 w-3" aria-hidden="true" /> :
                       header.column.getIsSorted() === 'desc' ? <ArrowDown className="h-3 w-3" aria-hidden="true" /> :
                       <ArrowUpDown className="h-3 w-3 opacity-40" aria-hidden="true" />}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        ))}
        {table.getRowModel().rows.map((row) => (
          <div
            key={row.id}
            className="flex border-b border-[hsl(var(--color-border))]/50 transition-colors hover:bg-[hsl(var(--color-bg))]/50"
            role="row"
          >
            {row.getVisibleCells().map((cell) => (
              <div
                key={cell.id}
                className="flex-1 px-3 py-2.5 text-sm text-[hsl(var(--color-text))]"
                role="cell"
              >
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
