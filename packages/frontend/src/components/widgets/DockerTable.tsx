import { useState, useMemo } from 'react';
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type SortingState,
} from '@tanstack/react-table';
import { type ColumnDef } from '@tanstack/react-table';
import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';
import { safeStr } from '../../utils/index.js';
import { cn } from '../../utils/cn.js';
import { getMockDockerData } from '../../services/mockDocker.js';
import type { RecordUnknown } from './types.js';

/* ─── Docker Table ─── */

const containerStatusStyles: Record<string, string> = {
  running: 'text-[hsl(var(--color-success))]',
  stopped: 'text-[hsl(var(--color-danger))]',
  paused: 'text-[hsl(var(--color-warning))]',
};

export function DockerTable({ data: externalData }: { data?: RecordUnknown[] } = {}) {
  const defaultData = getMockDockerData().containers as unknown as RecordUnknown[];
  const data = externalData ?? defaultData;
  const [sorting, setSorting] = useState<SortingState>([]);

  const columns = useMemo<ColumnDef<RecordUnknown>[]>(() => [
    {
      accessorKey: 'name',
      header: 'Name',
      cell: ({ row }) => (
        <span className="text-xs font-medium text-[hsl(var(--color-foreground))]">{safeStr(row.original.name)}</span>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const st = safeStr(row.original.status);
        const safeColor = containerStatusStyles[st] ?? 'text-[hsl(var(--color-muted-foreground))]';
        return (
          <span className={cn('inline-flex items-center gap-1.5 text-xs', safeColor)}>
            <span className={cn('h-1.5 w-1.5 rounded-full', st === 'running' ? 'bg-[hsl(var(--color-success))]' : st === 'stopped' ? 'bg-[hsl(var(--color-danger))]' : 'bg-[hsl(var(--color-warning))]')} aria-hidden="true" />
            {st}
          </span>
        );
      },
    },
    {
      accessorKey: 'image',
      header: 'Image',
      cell: ({ row }) => <span className="text-xs text-[hsl(var(--color-muted-foreground))]">{safeStr(row.original.image)}</span>,
    },
    {
      accessorKey: 'cpuPercent',
      header: 'CPU (%)',
      cell: ({ row }) => <span className="text-xs text-[hsl(var(--color-muted-foreground))]">{safeStr(row.original.cpuPercent)}</span>,
    },
    {
      accessorKey: 'memoryPercent',
      header: 'Memory (%)',
      cell: ({ row }) => <span className="text-xs text-[hsl(var(--color-muted-foreground))]">{safeStr(row.original.memoryPercent)}</span>,
    },
    {
      accessorKey: 'restartCount',
      header: 'Restarts',
      cell: ({ row }) => <span className="text-xs text-[hsl(var(--color-muted-foreground))]">{safeStr(row.original.restartCount)}</span>,
    },
    {
      accessorKey: 'ports',
      header: 'Ports',
      cell: ({ row }) => <span className="text-xs text-[hsl(var(--color-muted-foreground))]">{safeStr(row.original.ports)}</span>,
    },
  ], []);

  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div className="overflow-x-auto rounded-lg border border-[hsl(var(--color-border))]" role="table" aria-label="Docker containers">
      <table className="w-full">
        <thead>
          {table.getHeaderGroups().map((hg) => (
            <tr key={hg.id} className="border-b border-[hsl(var(--color-border))] bg-[hsl(var(--color-muted))]">
              {hg.headers.map((header) => (
                <th
                  key={header.id}
                  className="px-3 py-2.5 text-left text-[11px] font-semibold text-[hsl(var(--color-muted-foreground))] cursor-pointer select-none hover:text-[hsl(var(--color-foreground))]"
                  onClick={header.column.getToggleSortingHandler()}
                  aria-sort={header.column.getIsSorted() === 'asc' ? 'ascending' : header.column.getIsSorted() === 'desc' ? 'descending' : 'none'}
                >
                  <div className="inline-flex items-center gap-1">
                    {flexRender(header.column.columnDef.header, header.getContext())}
                    {header.column.getCanSort() && (
                      header.column.getIsSorted() === 'asc' ? <ChevronUp className="h-3 w-3" aria-hidden="true" />
                        : header.column.getIsSorted() === 'desc' ? <ChevronDown className="h-3 w-3" aria-hidden="true" />
                          : <ChevronsUpDown className="h-3 w-3" aria-hidden="true" />
                    )}
                  </div>
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id} className="border-b border-[hsl(var(--color-border))] transition-colors hover:bg-[hsl(var(--color-muted)/0.5)]">
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id} className="px-3 py-2.5">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
