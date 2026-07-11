import { useMemo, useState } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { offerwallsApi } from '@/api/services'
import { useResourceList } from '@/hooks/useResourceList'
import { useCrud } from '@/hooks/useCrud'
import { DataTable } from '@/components/tables/DataTable'
import { PageHeader } from '@/components/common/PageHeader'
import { StatusBadge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Input'
import { CrudModal, type FieldDef } from '@/components/common/CrudModal'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import type { Offerwall } from '@/types'
import { formatNumber, formatDate } from '@/lib/utils'

const FIELDS: FieldDef[] = [
  { name: 'name', label: 'Name', required: true },
  { name: 'provider', label: 'Provider' },
  { name: 'url', label: 'URL', type: 'url' },
  { name: 'currency_rate', label: 'Currency Rate', type: 'number' },
  { name: 'status', label: 'Status', type: 'select', options: [
    { label: 'Active', value: 'active' },
    { label: 'Inactive', value: 'inactive' },
  ] },
  { name: 'app_id', label: 'App ID' },
  { name: 'api_key', label: 'API Key' },
  { name: 'callback_secret', label: 'Callback Secret' },
  { name: 'sort_order', label: 'Sort Order', type: 'number' },
  { name: 'description', label: 'Description', type: 'textarea' },
]

export default function OfferwallsPage() {
  const list = useResourceList<Offerwall>('offerwalls', (p) => offerwallsApi.list(p))
  const crud = useCrud<Offerwall>('offerwalls', offerwallsApi, 'Offerwall')
  const [editing, setEditing] = useState<Offerwall | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [toDelete, setToDelete] = useState<Offerwall | null>(null)

  const openCreate = () => {
    setEditing(null)
    setModalOpen(true)
  }
  const openEdit = (o: Offerwall) => {
    setEditing(o)
    setModalOpen(true)
  }

  const columns = useMemo<ColumnDef<Offerwall>[]>(
    () => [
      { header: 'Name', accessorKey: 'name', cell: ({ row }) => <span className="font-medium text-slate-700 dark:text-slate-200">{row.original.name}</span> },
      { header: 'Provider', cell: ({ row }) => row.original.provider ?? '—' },
      { header: 'Currency Rate', cell: ({ row }) => formatNumber(row.original.currency_rate) },
      { header: 'Status', cell: ({ row }) => <StatusBadge status={row.original.status} /> },
      { header: 'Created', cell: ({ row }) => formatDate(row.original.created_at) },
      {
        header: 'Action',
        cell: ({ row }) => (
          <div className="flex gap-1">
            <button onClick={() => openEdit(row.original)} className="rounded-md p-1.5 text-blue-600 hover:bg-blue-50">
              <Pencil className="h-4 w-4" />
            </button>
            <button onClick={() => setToDelete(row.original)} className="rounded-md p-1.5 text-red-600 hover:bg-red-50">
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ),
      },
    ],
    [],
  )

  return (
    <div>
      <PageHeader
        title="Offerwalls"
        subtitle="Manage offerwall integrations"
        actions={
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4" /> Add Offer
          </Button>
        }
      />

      <DataTable
        columns={columns}
        data={list.rows}
        loading={list.loading}
        meta={list.meta}
        onPageChange={list.setPage}
        search={list.search}
        onSearchChange={list.onSearchChange}
        searchPlaceholder="Search offerwalls"
        exportName="offerwalls"
        exportRows={() => list.rows.map((o) => ({ name: o.name, provider: o.provider, currency_rate: o.currency_rate, status: o.status }))}
        toolbar={
          <Select value={(list.filters.status as string) ?? ''} onChange={(e) => list.setFilter('status', e.target.value)}>
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </Select>
        }
      />

      <CrudModal<Offerwall>
        open={modalOpen}
        onOpenChange={setModalOpen}
        title={editing ? 'Edit Offerwall' : 'Add Offerwall'}
        fields={FIELDS}
        defaultValues={
          (editing ?? { name: '', status: 'active', currency_rate: 0 }) as any
        }
        loading={crud.create.isPending || crud.update.isPending}
        onSubmit={(v) => {
          const payload = { ...v }
          const done = () => setModalOpen(false)
          if (editing) crud.update.mutate({ id: editing.id, payload }, { onSuccess: done })
          else crud.create.mutate(payload, { onSuccess: done })
        }}
      />

      <ConfirmDialog
        open={!!toDelete}
        onOpenChange={(v) => !v && setToDelete(null)}
        title="Delete offerwall?"
        description={`"${toDelete?.name}" will be removed.`}
        loading={crud.remove.isPending}
        onConfirm={() => toDelete && crud.remove.mutate(toDelete.id, { onSuccess: () => setToDelete(null) })}
      />
    </div>
  )
}
