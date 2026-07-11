import { useMemo, useState } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { bannersApi } from '@/api/services'
import { useResourceList } from '@/hooks/useResourceList'
import { useCrud } from '@/hooks/useCrud'
import { DataTable } from '@/components/tables/DataTable'
import { PageHeader } from '@/components/common/PageHeader'
import { StatusBadge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Input'
import { CrudModal, type FieldDef } from '@/components/common/CrudModal'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import type { Banner } from '@/types'
import { formatDate } from '@/lib/utils'

const FIELDS: FieldDef[] = [
  { name: 'title', label: 'Title' },
  { name: 'image', label: 'Image URL', type: 'url', required: true },
  { name: 'url', label: 'URL', type: 'url' },
  {
    name: 'position',
    label: 'Position',
    type: 'select',
    options: ['home', 'offers', 'rewards'].map((v) => ({ label: v, value: v })),
  },
  { name: 'status', label: 'Status', type: 'select', options: [
    { label: 'Active', value: 'active' },
    { label: 'Inactive', value: 'inactive' },
  ] },
  { name: 'sort_order', label: 'Sort Order', type: 'number' },
  { name: 'starts_at', label: 'Starts At', type: 'date' },
  { name: 'ends_at', label: 'Ends At', type: 'date' },
]

export default function BannersPage() {
  const list = useResourceList<Banner>('banners', (p) => bannersApi.list(p))
  const crud = useCrud<Banner>('banners', bannersApi, 'Banner')
  const [editing, setEditing] = useState<Banner | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [toDelete, setToDelete] = useState<Banner | null>(null)

  const openCreate = () => {
    setEditing(null)
    setModalOpen(true)
  }
  const openEdit = (b: Banner) => {
    setEditing(b)
    setModalOpen(true)
  }

  const columns = useMemo<ColumnDef<Banner>[]>(
    () => [
      { header: 'Title', cell: ({ row }) => row.original.title ?? '—' },
      {
        header: 'Image',
        cell: ({ row }) =>
          row.original.image ? (
            <img src={row.original.image} className="h-10 w-16 rounded object-cover" />
          ) : (
            '—'
          ),
      },
      { header: 'Position', accessorKey: 'position' },
      { header: 'Status', cell: ({ row }) => <StatusBadge status={row.original.status} /> },
      { header: 'Order', cell: ({ row }) => row.original.sort_order },
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
        title="Banners"
        subtitle="Manage promotional banners"
        actions={
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4" /> Add Banner
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
        searchPlaceholder="Search banners"
        exportName="banners"
        exportRows={() => list.rows.map((b) => ({ title: b.title, position: b.position, status: b.status, sort_order: b.sort_order }))}
      />

      <CrudModal<Banner>
        open={modalOpen}
        onOpenChange={setModalOpen}
        title={editing ? 'Edit Banner' : 'Add Banner'}
        fields={FIELDS}
        defaultValues={
          (editing ?? { title: '', image: '', position: 'home', status: 'active' }) as any
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
        title="Delete banner?"
        description={`"${toDelete?.title ?? 'Banner'}" will be removed.`}
        loading={crud.remove.isPending}
        onConfirm={() => toDelete && crud.remove.mutate(toDelete.id, { onSuccess: () => setToDelete(null) })}
      />
    </div>
  )
}
