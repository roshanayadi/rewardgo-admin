import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
} from '@tanstack/react-table'
import { ChevronLeft, ChevronRight, Download, Search } from 'lucide-react'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { TableSkeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/common/EmptyState'
import type { PaginationMeta } from '@/types'
import { cn, exportToCsv } from '@/lib/utils'

interface DataTableProps<T> {
  columns: ColumnDef<T, any>[]
  data: T[]
  loading?: boolean
  meta?: PaginationMeta
  onPageChange?: (page: number) => void
  search?: string
  onSearchChange?: (v: string) => void
  searchPlaceholder?: string
  toolbar?: React.ReactNode
  primaryAction?: React.ReactNode
  exportName?: string
  exportRows?: () => Record<string, unknown>[]
}

export function DataTable<T>({
  columns,
  data,
  loading,
  meta,
  onPageChange,
  search,
  onSearchChange,
  searchPlaceholder = 'Search...',
  toolbar,
  primaryAction,
  exportName,
  exportRows,
}: DataTableProps<T>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
  })

  const page = meta?.current_page ?? 1
  const lastPage = meta?.last_page ?? 1

  return (
    <div className="rounded-xl border border-slate-200/70 bg-white shadow-[0_1px_3px_0_rgb(0_0_0/0.06)] dark:border-slate-800 dark:bg-slate-900">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 p-4 dark:border-slate-800">
        <div className="flex flex-1 flex-wrap items-center gap-2">
          {onSearchChange && (
            <div className="relative w-full max-w-xs">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                value={search ?? ''}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder={searchPlaceholder}
                className="pl-9"
              />
            </div>
          )}
          {toolbar}
        </div>
        <div className="flex items-center gap-2">
          {exportRows && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => exportToCsv(exportName ?? 'export', exportRows())}
            >
              <Download className="h-4 w-4" /> Export
            </Button>
          )}
          {primaryAction}
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <TableSkeleton cols={columns.length} />
      ) : data.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              {table.getHeaderGroups().map((hg) => (
                <tr key={hg.id} className="border-b border-slate-100 dark:border-slate-800">
                  {hg.headers.map((header) => (
                    <th
                      key={header.id}
                      className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-400"
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className="border-b border-slate-50 transition-colors hover:bg-slate-50/60 dark:border-slate-800/60 dark:hover:bg-slate-800/40"
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-5 py-3.5 text-slate-700 dark:text-slate-300">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {meta && meta.total > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 p-4 dark:border-slate-800">
          <p className="text-xs text-slate-500">
            Showing {(page - 1) * meta.per_page + 1}–{Math.min(page * meta.per_page, meta.total)} of{' '}
            {meta.total}
          </p>
          <div className="flex items-center gap-1">
            <Button
              variant="secondary"
              size="icon"
              disabled={page <= 1}
              onClick={() => onPageChange?.(page - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            {pageNumbers(page, lastPage).map((p, i) =>
              p === '...' ? (
                <span key={`e${i}`} className="px-2 text-slate-400">
                  …
                </span>
              ) : (
                <button
                  key={p}
                  onClick={() => onPageChange?.(p as number)}
                  className={cn(
                    'h-9 min-w-9 rounded-lg px-3 text-sm font-medium transition-colors',
                    p === page
                      ? 'bg-primary text-white'
                      : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800',
                  )}
                >
                  {p}
                </button>
              ),
            )}
            <Button
              variant="secondary"
              size="icon"
              disabled={page >= lastPage}
              onClick={() => onPageChange?.(page + 1)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

function pageNumbers(current: number, last: number): (number | '...')[] {
  if (last <= 7) return Array.from({ length: last }, (_, i) => i + 1)
  const pages: (number | '...')[] = [1]
  const start = Math.max(2, current - 1)
  const end = Math.min(last - 1, current + 1)
  if (start > 2) pages.push('...')
  for (let i = start; i <= end; i++) pages.push(i)
  if (end < last - 1) pages.push('...')
  pages.push(last)
  return pages
}
