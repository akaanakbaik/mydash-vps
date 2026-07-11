import { useState, useMemo } from 'react';
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type SortingState,
} from '@tanstack/react-table';
import { type ColumnDef } from '@tanstack/react-table';
import { type LucideIcon, ChevronUp, ChevronDown, ChevronsUpDown, CheckCircle, XCircle, AlertTriangle, RefreshCw, Download } from 'lucide-react';
import { safeStr } from '../../utils/index.js';
import { cn } from '../../utils/cn.js';
import { getMockPluginData } from '../../services/mockPlugin.js';
import type { RecordUnknown } from './types.js';
const pluginStatusStyles: Record<string, { color: string; icon: LucideIcon }> = {
  installed: { color: 'hsl(var(--color-success))', icon: CheckCircle },
  available: { color: 'hsl(var(--color-info))', icon: Download },
  update_available: { color: 'hsl(var(--color-warning))', icon: RefreshCw },
  disabled: { color: 'hsl(var(--color-muted-foreground))', icon: XCircle },
  incompatible: { color: 'hsl(var(--color-danger))', icon: AlertTriangle },
};
export function PluginTable({ data: externalData }: { data?: RecordUnknown[] } = {}) {
  const defaultData = getMockPluginData().plugins as unknown as RecordUnknown[];
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
      accessorKey: 'version',
      header: 'Version',
      cell: ({ row }) => (
        <span className="text-xs text-[hsl(var(--color-muted-foreground))]">v{safeStr(row.original.version)}</span>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = safeStr(row.original.status);
        const s = pluginStatusStyles[status];
        const color = s.color;
        const Icon = s.icon;
        return (
          <span className="inline-flex items-center gap-1.5 text-xs" style={{ color }}>
            <Icon className="h-3.5 w-3.5" aria-hidden="true" />
            {status.replace('_', ' ')}
          </span>
        );
      },
    },
    {
      accessorKey: 'category',
      header: 'Category',
      cell: ({ row }) => (
        <span className="text-xs capitalize text-[hsl(var(--color-muted-foreground))]">{safeStr(row.original.category)}</span>
      ),
    },
    {
      accessorKey: 'compatible',
      header: 'Compatible',
      cell: ({ row }) => {
        const compat = Boolean(row.original.compatible);
        return (
          <span className={cn('inline-flex items-center gap-1 text-xs', compat ? 'text-[hsl(var(--color-success))]' : 'text-[hsl(var(--color-danger))]')}>
            {compat ? <CheckCircle className="h-3.5 w-3.5" aria-hidden="true" /> : <XCircle className="h-3.5 w-3.5" aria-hidden="true" />}
            {compat ? 'Yes' : 'No'}
          </span>
        );
      },
    },
    {
      accessorKey: 'rating',
      header: 'Rating',
      cell: ({ row }) => (
        <span className="text-xs text-[hsl(var(--color-muted-foreground))]">{safeStr(row.original.rating, '—')}</span>
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
    <div className="overflow-x-auto rounded-lg border border-[hsl(var(--color-border))]" role="table" aria-label="Plugins">
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
