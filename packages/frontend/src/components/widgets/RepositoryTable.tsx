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
import { getMockGitHubData } from '../../services/mockGitHub.js';
import type { RecordUnknown } from './types.js';
export function RepositoryTable({ data: externalData }: { data?: RecordUnknown[] } = {}) {
  const defaultData = getMockGitHubData().repos as unknown as RecordUnknown[];
  const data = externalData ?? defaultData;
  const [sorting, setSorting] = useState<SortingState>([]);
  const columns = useMemo<ColumnDef<RecordUnknown>[]>(() => [
    {
      accessorKey: 'name',
      header: 'Repository',
      cell: ({ row }) => (
        <div>
          <span className="text-xs font-medium text-[hsl(var(--color-foreground))]">{safeStr(row.original.name)}</span>
          {Boolean(row.original.private) && (
            <span className="ml-2 rounded bg-[hsl(var(--color-muted))] px-1 py-0.5 text-[10px] text-[hsl(var(--color-muted-foreground))]">Private</span>
          )}
        </div>
      ),
    },
    {
      accessorKey: 'defaultBranch',
      header: 'Branch',
      cell: ({ row }) => (
        <span className="text-xs font-mono text-[hsl(var(--color-muted-foreground))]">{safeStr(row.original.defaultBranch)}</span>
      ),
    },
    {
      accessorKey: 'stars',
      header: 'Stars',
      cell: ({ row }) => <span className="text-xs text-[hsl(var(--color-muted-foreground))]">{safeStr(row.original.stars)}</span>,
    },
    {
      accessorKey: 'forks',
      header: 'Forks',
      cell: ({ row }) => <span className="text-xs text-[hsl(var(--color-muted-foreground))]">{safeStr(row.original.forks)}</span>,
    },
    {
      accessorKey: 'issues',
      header: 'Issues',
      cell: ({ row }) => <span className="text-xs text-[hsl(var(--color-muted-foreground))]">{safeStr(row.original.issues)}</span>,
    },
    {
      accessorKey: 'language',
      header: 'Language',
      cell: ({ row }) => (
        <span className="inline-flex items-center gap-1.5 text-xs text-[hsl(var(--color-muted-foreground))]">
          <span className="h-2 w-2 rounded-full bg-[hsl(var(--color-primary))]" aria-hidden="true" />
          {safeStr(row.original.language)}
        </span>
      ),
    },
    {
      accessorKey: 'updatedAt',
      header: 'Updated',
      sortingFn: 'datetime',
      cell: ({ row }) => (
        <span className="text-xs text-[hsl(var(--color-muted-foreground))]">
          {new Date(safeStr(row.original.updatedAt)).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
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
    <div className="overflow-x-auto rounded-lg border border-[hsl(var(--color-border))]" role="table" aria-label="Repositories">
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
