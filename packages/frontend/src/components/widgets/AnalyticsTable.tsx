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
import { AnalyticsEmptyState } from './analytics.js';
interface AnalyticsTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  isLoading?: boolean;
  className?: string;
  emptyTitle?: string;
  emptyDescription?: string;
}
export function AnalyticsTable<T>({
  data, columns, isLoading, className,
  emptyTitle = 'No analytics data',
  emptyDescription = 'No data matches the current filter criteria.',
}: AnalyticsTableProps<T>) {
  const [sorting, setSorting] = useState<SortingState>([]);
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
          {columns.map((_col, i) => (
            <Skeleton key={i} className="h-3 flex-1" />
          ))}
        </div>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex gap-4 py-2">
            {columns.map((_col, j) => (
              <Skeleton key={j} className="h-4 flex-1" />
            ))}
          </div>
        ))}
      </div>
    );
  }
  if (table.getRowModel().rows.length === 0) {
    return (
      <AnalyticsEmptyState title={emptyTitle} description={emptyDescription} />
    );
  }
  return (
    <div className={cn('overflow-x-auto', className)} role="table" aria-label="Analytics data table">
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
