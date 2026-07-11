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
import { getMockBackupData } from '../../services/mockBackup.js';
import type { RecordUnknown } from './types.js';
import { safeStr } from '../../utils/index.js';
const backupStatusStyles: Record<string, { color: string; label: string }> = {
  completed: { color: 'hsl(var(--color-success))', label: 'Completed' },
  failed: { color: 'hsl(var(--color-danger))', label: 'Failed' },
  running: { color: 'hsl(var(--color-info))', label: 'Running' },
  scheduled: { color: 'hsl(var(--color-warning))', label: 'Scheduled' },
};
export function BackupTable({ data: externalData }: { data?: RecordUnknown[] } = {}) {
  const defaultData = getMockBackupData().backups as unknown as RecordUnknown[];
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
      accessorKey: 'type',
      header: 'Type',
      cell: ({ row }) => (
        <span className="text-[11px] capitalize text-[hsl(var(--color-muted-foreground))]">{safeStr(row.original.type)}</span>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = safeStr(row.original.status);
        const s = backupStatusStyles[status];
        const color = s.color;
        const label = s.label;
        return (
          <span className="inline-flex items-center gap-1.5 text-xs">
            <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: color }} aria-hidden="true" />
            <span style={{ color }}>{label}</span>
          </span>
        );
      },
    },
    {
      accessorKey: 'size',
      header: 'Size',
      cell: ({ row }) => <span className="text-xs text-[hsl(var(--color-muted-foreground))]">{safeStr(row.original.size)}</span>,
    },
    {
      accessorKey: 'duration',
      header: 'Duration',
      cell: ({ row }) => <span className="text-xs text-[hsl(var(--color-muted-foreground))]">{safeStr(row.original.duration)}</span>,
    },
    {
      accessorKey: 'timestamp',
      header: 'Date',
      sortingFn: 'datetime',
      cell: ({ row }) => (
        <span className="text-xs text-[hsl(var(--color-muted-foreground))]">
          {new Date(safeStr(row.original.timestamp)).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
        </span>
      ),
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
    <div className="overflow-x-auto rounded-lg border border-[hsl(var(--color-border))]" role="table" aria-label="Backup history">
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
