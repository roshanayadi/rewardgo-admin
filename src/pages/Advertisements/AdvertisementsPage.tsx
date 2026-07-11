import { useMemo, useState } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { Plus, Pencil, Trash2, Settings2 } from 'lucide-react'
import { adsApi } from '@/api/services'
import { AdmobConfigModal } from './AdmobConfigModal'
import { useResourceList } from '@/hooks/useResourceList'
import { useCrud } from '@/hooks/useCrud'
import { DataTable } from '@/components/tables/DataTable'
import { PageHeader } from '@/components/common/PageHeader'
import { StatusBadge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Input'
import { CrudModal, type FieldDef } from '@/components/common/CrudModal'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import type { Advertisement } from '@/types'
import { formatNumber, formatDate } from '@/lib/utils'

const FIELDS: FieldDef[] = [
  { name: 'title', label: 'Title', required: true },
  {
    name: 'type',
    label: 'Type',
    type: 'select',
    options: ['banner', 'video', 'native', 'interstitial'].map((v) => ({ label: v, value: v })),
  },
  { name: 'placement', label: 'Placement' },
  { name: 'url', label: 'URL', type: 'url' },
  { name: 'status', label: 'Status', type: 'select', options: [
    { label: 'Active', value: 'active' },
    { label: 'Inactive', value: 'inactive' },
  ] },
  { name: 'sort_order', label: 'Sort Order', type: 'number' },
  { name: 'starts_at', label: 'Starts At', type: 'date' },
  { name: 'ends_at', label: 'Ends At', type: 'date' },
  { name: 'description', label: 'Description', type: 'textarea' },
  { name: 'image', label: 'Image URL', type: 'url' },
]

export default function AdvertisementsPage() {
  const list = useResourceList<Advertisement>('advertisements', (p) => adsApi.list(p))
  const crud = useCrud<Advertisement>('advertisements', adsApi, 'Advertisement')
  const [editing, setEditing] = useState<Advertisement | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [admobOpen, setAdmobOpen] = useState(false)
  const [toDelete, setToDelete] = useState<Advertisement | null>(null)

  const openCreate = () => {
    setEditing(null)
    setModalOpen(true)
  }
  const openEdit = (a: Advertisement) => {
    setEditing(a)
    setModalOpen(true)
  }

  const columns = useMemo<ColumnDef<Advertisement>[]>(
    () => [
      { header: 'Title', accessorKey: 'title', cell: ({ row }) => <span className="font-medium text-slate-700 dark:text-slate-200">{row.original.title}</span> },
      { header: 'Type', accessorKey: 'type' },
      { header: 'Placement', cell: ({ row }) => row.original.placement ?? '—' },
      { header: 'Impressions', cell: ({ row }) => formatNumber(row.original.impressions) },
      { header: 'Clicks', cell: ({ row }) => formatNumber(row.original.clicks) },
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
        title="Advertisements"
        subtitle="Manage in-app advertisements"
        actions={
          <>
            <Button variant="secondary" onClick={() => setAdmobOpen(true)}>
              <Settings2 className="h-4 w-4" /> AdMob
            </Button>
            <Button onClick={openCreate}>
              <Plus className="h-4 w-4" /> Add Ad
            </Button>
          </>
        }
      />

      <AdmobConfigModal open={admobOpen} onOpenChange={setAdmobOpen} />

      <DataTable
        columns={columns}
        data={list.rows}
        loading={list.loading}
        meta={list.meta}
        onPageChange={list.setPage}
        search={list.search}
        onSearchChange={list.onSearchChange}
        searchPlaceholder="Search advertisements"
        exportName="advertisements"
        exportRows={() => list.rows.map((a) => ({ title: a.title, type: a.type, placement: a.placement, impressions: a.impressions, clicks: a.clicks, status: a.status }))}
        toolbar={
          <Select value={(list.filters.status as string) ?? ''} onChange={(e) => list.setFilter('status', e.target.value)}>
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </Select>
        }
      />

      <CrudModal<Advertisement>
        open={modalOpen}
        onOpenChange={setModalOpen}
        title={editing ? 'Edit Advertisement' : 'Add Advertisement'}
        fields={FIELDS}
        defaultValues={
          (editing ?? { title: '', type: 'banner', status: 'active' }) as any
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
        title="Delete advertisement?"
        description={`"${toDelete?.title}" will be removed.`}
        loading={crud.remove.isPending}
        onConfirm={() => toDelete && crud.remove.mutate(toDelete.id, { onSuccess: () => setToDelete(null) })}
      />
    </div>
  )
}
