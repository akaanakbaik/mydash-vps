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
import { ServerEmptyState } from './servers.js';
import type { Server } from '../../services/mockServers.js';
interface ServerTableProps {
  data: Server[];
  onSelect?: (server: Server) => void;
  isLoading?: boolean;
  className?: string;
}
const statusDots: Record<string, string> = {
  online: 'bg-[hsl(var(--color-success))]',
  offline: 'bg-[hsl(var(--color-muted))]',
  degraded: 'bg-[hsl(var(--color-warning))]',
  maintenance: 'bg-[hsl(var(--color-accent))]',
};
export function ServerTable({ data, onSelect, isLoading, className }: ServerTableProps) {
  const [sorting, setSorting] = useState<SortingState>([{ id: 'name', desc: false }]);
  const columns: ColumnDef<Server>[] = [
    {
      id: 'name',
      header: 'Name',
      accessorFn: (row) => row.name,
      sortingFn: 'text',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <span className={cn('h-2 w-2 rounded-full', statusDots[row.original.status])} aria-hidden="true" />
          <div>
            <span className="text-sm font-medium text-[hsl(var(--color-text))]">{row.original.name}</span>
            <p className="text-[10px] text-[hsl(var(--color-muted))]">{row.original.hostname}</p>
          </div>
        </div>
      ),
    },
    {
      id: 'status',
      header: 'Status',
      accessorFn: (row) => row.status,
      cell: ({ row }) => {
        const labels: Record<string, string> = { online: 'Online', offline: 'Offline', degraded: 'Degraded', maintenance: 'Maint.' };
        return <span className="text-xs text-[hsl(var(--color-muted))]">{labels[row.original.status]}</span>;
      },
    },
    {
      id: 'healthScore',
      header: 'Health',
      accessorFn: (row) => row.healthScore,
      sortingFn: 'basic',
      cell: ({ row }) => (
        <span className={cn('text-xs font-medium', row.original.healthScore >= 80 ? 'text-[hsl(var(--color-success))]' : row.original.healthScore >= 60 ? 'text-[hsl(var(--color-warning))]' : 'text-[hsl(var(--color-muted))]')}>
          {row.original.healthScore > 0 ? String(row.original.healthScore) : '—'}
        </span>
      ),
    },
    {
      id: 'cpuUsage',
      header: 'CPU',
      accessorFn: (row) => row.cpuUsage,
      sortingFn: 'basic',
      cell: ({ row }) => <span className="text-xs text-[hsl(var(--color-muted))]">{String(row.original.cpuUsage)}%</span>,
    },
    {
      id: 'ramUsage',
      header: 'RAM',
      accessorFn: (row) => row.ramUsage,
      sortingFn: 'basic',
      cell: ({ row }) => <span className="text-xs text-[hsl(var(--color-muted))]">{String(row.original.ramUsage)}%</span>,
    },
    {
      id: 'diskUsage',
      header: 'Disk',
      accessorFn: (row) => row.diskUsage,
      sortingFn: 'basic',
      cell: ({ row }) => <span className="text-xs text-[hsl(var(--color-muted))]">{String(row.original.diskUsage)}%</span>,
    },
    {
      id: 'location',
      header: 'Location',
      accessorFn: (row) => row.location,
      cell: ({ row }) => <span className="text-xs text-[hsl(var(--color-muted))]">{row.original.location}</span>,
    },
    {
      id: 'uptime',
      header: 'Uptime',
      accessorFn: (row) => row.uptime,
      cell: ({ row }) => <span className="text-xs text-[hsl(var(--color-muted))]">{row.original.uptime}</span>,
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
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-3 flex-1" />
          ))}
        </div>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex gap-4 py-2">
            {Array.from({ length: 8 }).map((_, j) => (
              <Skeleton key={j} className="h-4 flex-1" />
            ))}
          </div>
        ))}
      </div>
    );
  }
  if (table.getRowModel().rows.length === 0) {
    return <ServerEmptyState />;
  }
  return (
    <div className={cn('overflow-x-auto', className)} role="table" aria-label="Servers table">
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
            className="flex border-b border-[hsl(var(--color-border))]/50 transition-colors hover:bg-[hsl(var(--color-bg))]/50 cursor-pointer"
            role="row"
            onClick={() => onSelect?.(row.original)}
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onSelect?.(row.original); }}
            aria-label={`Select ${row.original.name}`}
          >
            {row.getVisibleCells().map((cell) => (
              <div key={cell.id} className="flex-1 px-3 py-2.5 text-sm text-[hsl(var(--color-text))]" role="cell">
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
