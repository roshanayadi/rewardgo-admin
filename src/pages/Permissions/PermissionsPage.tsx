import { useMemo } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { permissionsApi } from '@/api/services'
import { useResourceList } from '@/hooks/useResourceList'
import { DataTable } from '@/components/tables/DataTable'
import { PageHeader } from '@/components/common/PageHeader'
import { Badge } from '@/components/ui/Badge'
import type { Permission } from '@/types'

export default function PermissionsPage({ embedded = false }: { embedded?: boolean }) {
  const list = useResourceList<Permission>('permissions', (p) => permissionsApi.list(p))

  const columns = useMemo<ColumnDef<Permission>[]>(
    () => [
      { header: 'Permission', accessorKey: 'name', cell: ({ row }) => <span className="font-medium text-slate-700 dark:text-slate-200">{row.original.name}</span> },
      { header: 'Module', cell: ({ row }) => <Badge tone="blue">{row.original.name.split('.')[0]}</Badge> },
      { header: 'Action', cell: ({ row }) => row.original.name.split('.')[1] ?? '—' },
      { header: 'Guard', accessorKey: 'guard_name' },
    ],
    [],
  )

  return (
    <div>
      {!embedded && <PageHeader title="Permissions" subtitle="All available system permissions" />}
      <DataTable
        columns={columns}
        data={list.rows}
        loading={list.loading}
        meta={list.meta}
        onPageChange={list.setPage}
        search={list.search}
        onSearchChange={list.onSearchChange}
        searchPlaceholder="Search permissions"
        exportName="permissions"
        exportRows={() => list.rows.map((p) => ({ name: p.name, guard: p.guard_name }))}
      />
    </div>
  )
}
