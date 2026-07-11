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
import { HealthEmptyState } from './healthScore.js';
import type { HealthGrade } from '../../services/mockHealthScore.js';
interface HealthHistoryRowData {
  id: number;
  timestamp: string;
  score: number;
  grade: HealthGrade;
  change: number;
  reason: string;
  duration: string;
}
interface HealthHistoryTableProps {
  data: HealthHistoryRowData[];
  isLoading?: boolean;
  className?: string;
}
function gradeColor(grade: HealthGrade): string {
  switch (grade) {
    case 'A+': return 'text-[hsl(var(--color-success))]';
    case 'A': return 'text-[hsl(var(--color-success))]';
    case 'B': return 'text-[hsl(var(--color-warning))]';
    case 'C': return 'text-[hsl(var(--color-warning))]';
    case 'D': return 'text-[hsl(var(--color-danger))]';
    case 'F': return 'text-[hsl(var(--color-danger))]';
  }
}
function gradeBg(grade: HealthGrade): string {
  switch (grade) {
    case 'A+': return 'bg-[hsl(var(--color-success))]/20';
    case 'A': return 'bg-[hsl(var(--color-success))]/15';
    case 'B': return 'bg-[hsl(var(--color-warning))]/15';
    case 'C': return 'bg-[hsl(var(--color-warning))]/20';
    case 'D': return 'bg-[hsl(var(--color-danger))]/15';
    case 'F': return 'bg-[hsl(var(--color-danger))]/20';
  }
}
function formatTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}
export function HealthHistoryTable({ data, isLoading, className }: HealthHistoryTableProps) {
  const [sorting, setSorting] = useState<SortingState>([{ id: 'timestamp', desc: true }]);
  const columns: ColumnDef<HealthHistoryRowData>[] = [
    {
      id: 'timestamp',
      header: 'Time',
      accessorFn: (row) => row.timestamp,
      sortingFn: 'datetime',
      cell: ({ row }) => <span className="text-xs text-[hsl(var(--color-muted))]">{formatTime(row.original.timestamp)}</span>,
    },
    {
      id: 'score',
      header: 'Score',
      accessorFn: (row) => row.score,
      sortingFn: 'basic',
      cell: ({ row }) => (
        <span className="text-sm font-semibold text-[hsl(var(--color-text))]">{String(row.original.score)}</span>
      ),
    },
    {
      id: 'grade',
      header: 'Grade',
      accessorFn: (row) => row.grade,
      cell: ({ row }) => (
        <span className={cn('rounded px-1.5 py-0.5 text-xs font-bold', gradeBg(row.original.grade), gradeColor(row.original.grade))}>
          {row.original.grade}
        </span>
      ),
    },
    {
      id: 'change',
      header: 'Change',
      accessorFn: (row) => row.change,
      sortingFn: 'basic',
      cell: ({ row }) => (
        <span className={cn('text-sm font-medium', row.original.change >= 0 ? 'text-[hsl(var(--color-success))]' : 'text-[hsl(var(--color-danger))]')}>
          {row.original.change >= 0 ? '+' : ''}{row.original.change}
        </span>
      ),
    },
    {
      id: 'reason',
      header: 'Reason',
      accessorFn: (row) => row.reason,
      cell: ({ row }) => (
        <span className="text-xs text-[hsl(var(--color-muted))] truncate block max-w-52">{row.original.reason}</span>
      ),
    },
    {
      id: 'duration',
      header: 'Duration',
      accessorFn: (row) => row.duration,
      cell: ({ row }) => (
        <span className="text-xs text-[hsl(var(--color-muted))]">{row.original.duration}</span>
      ),
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
      <HealthEmptyState title="No health history" description="No health score history records are available." />
    );
  }
  return (
    <div className={cn('overflow-x-auto', className)} role="table" aria-label="Health score history table">
      <div className="min-w-full">
        {}
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
        {}
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
