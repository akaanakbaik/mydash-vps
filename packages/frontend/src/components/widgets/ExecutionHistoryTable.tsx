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
import { AutomationEmptyState } from './automation.js';

interface ExecutionRowData {
  id: number;
  workflowId: string;
  workflowName: string;
  trigger: string;
  status: string;
  startedAt: string;
  completedAt: string | null;
  duration: number;
  actions: number;
  actionsCompleted: number;
  errorMessage: string | null;
  triggeredBy: string;
}

interface ExecutionHistoryTableProps {
  data: ExecutionRowData[];
  isLoading?: boolean;
  className?: string;
}

const statusStyles: Record<string, { color: string; label: string }> = {
  running: { color: 'text-[hsl(var(--color-primary))]', label: 'Running' },
  success: { color: 'text-[hsl(var(--color-success))]', label: 'Success' },
  failed: { color: 'text-[hsl(var(--color-danger))]', label: 'Failed' },
  pending: { color: 'text-[hsl(var(--color-warning))]', label: 'Pending' },
  cancelled: { color: 'text-[hsl(var(--color-muted))]', label: 'Cancelled' },
  skipped: { color: 'text-[hsl(var(--color-muted))]', label: 'Skipped' },
};

function formatTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export function ExecutionHistoryTable({ data, isLoading, className }: ExecutionHistoryTableProps) {
  const [sorting, setSorting] = useState<SortingState>([{ id: 'startedAt', desc: true }]);

  const columns: ColumnDef<ExecutionRowData>[] = [
    {
      id: 'startedAt',
      header: 'Time',
      accessorFn: (row) => row.startedAt,
      sortingFn: 'datetime',
      cell: ({ row }) => <span className="text-xs text-[hsl(var(--color-muted))]">{formatTime(row.original.startedAt)}</span>,
    },
    {
      id: 'workflowName',
      header: 'Workflow',
      accessorFn: (row) => row.workflowName,
      cell: ({ row }) => <span className="text-sm font-medium text-[hsl(var(--color-text))]">{row.original.workflowName}</span>,
    },
    {
      id: 'trigger',
      header: 'Trigger',
      accessorFn: (row) => row.trigger,
      cell: ({ row }) => (
        <span className="text-xs rounded bg-[hsl(var(--color-bg))] px-1.5 py-0.5 text-[hsl(var(--color-muted))]">
          {row.original.trigger}
        </span>
      ),
    },
    {
      id: 'status',
      header: 'Status',
      accessorFn: (row) => row.status,
      cell: ({ row }) => {
        const s = statusStyles[row.original.status];
        return (
          <span className={cn('text-xs font-medium', s.color)}>
            {s.label}
          </span>
        );
      },
    },
    {
      id: 'duration',
      header: 'Duration',
      accessorFn: (row) => row.duration,
      sortingFn: 'basic',
      cell: ({ row }) => <span className="text-xs text-[hsl(var(--color-muted))]">{String(row.original.duration)}s</span>,
    },
    {
      id: 'actionsCompleted',
      header: 'Actions',
      accessorFn: (row) => `${String(row.actionsCompleted)}/${String(row.actions)}`,
      cell: ({ row }) => <span className="text-xs text-[hsl(var(--color-muted))]">{String(row.original.actionsCompleted)}/{String(row.original.actions)}</span>,
    },
    {
      id: 'triggeredBy',
      header: 'Triggered By',
      accessorFn: (row) => row.triggeredBy,
      cell: ({ row }) => <span className="text-xs text-[hsl(var(--color-muted))]">{row.original.triggeredBy}</span>,
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
          {Array.from({ length: 7 }).map((_, i) => (
            <Skeleton key={i} className="h-3 flex-1" />
          ))}
        </div>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex gap-4 py-2">
            {Array.from({ length: 7 }).map((_, j) => (
              <Skeleton key={j} className="h-4 flex-1" />
            ))}
          </div>
        ))}
      </div>
    );
  }

  if (table.getRowModel().rows.length === 0) {
    return (
      <AutomationEmptyState title="No executions" description="No execution records match the current filters." />
    );
  }

  return (
    <div className={cn('overflow-x-auto', className)} role="table" aria-label="Execution history table">
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
