import { useMemo, useState } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { Send, Trash2 } from 'lucide-react'
import { notificationsApi } from '@/api/services'
import { useResourceList } from '@/hooks/useResourceList'
import { useCrud } from '@/hooks/useCrud'
import { DataTable } from '@/components/tables/DataTable'
import { PageHeader } from '@/components/common/PageHeader'
import { StatusBadge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { CrudModal, type FieldDef } from '@/components/common/CrudModal'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import type { Notification } from '@/types'
import { formatDate } from '@/lib/utils'

const FIELDS: FieldDef[] = [
  { name: 'title', label: 'Title', required: true },
  { name: 'body', label: 'Message', type: 'textarea' },
  {
    name: 'type',
    label: 'Type',
    type: 'select',
    options: ['system', 'promo', 'transaction', 'withdrawal'].map((v) => ({ label: v, value: v })),
  },
  { name: 'is_broadcast', label: 'Broadcast to All', type: 'switch' },
  { name: 'user_id', label: 'User ID', type: 'number' },
  { name: 'send_email', label: 'Also send Email (single user)', type: 'switch' },
  { name: 'action_url', label: 'Action URL', type: 'url' },
  { name: 'image', label: 'Image URL', type: 'url' },
]

export default function NotificationsPage() {
  const list = useResourceList<Notification>('notifications', (p) => notificationsApi.list(p))
  const crud = useCrud<Notification>('notifications', notificationsApi, 'Notification')
  const [modalOpen, setModalOpen] = useState(false)
  const [toDelete, setToDelete] = useState<Notification | null>(null)

  const openCreate = () => {
    setModalOpen(true)
  }

  const columns = useMemo<ColumnDef<Notification>[]>(
    () => [
      { header: 'Title', accessorKey: 'title', cell: ({ row }) => <span className="font-medium text-slate-700 dark:text-slate-200">{row.original.title}</span> },
      { header: 'Message', cell: ({ row }) => <span className="block max-w-xs truncate">{row.original.body ?? '—'}</span> },
      { header: 'Type', cell: ({ row }) => <StatusBadge status={row.original.type} /> },
      { header: 'Sent To', cell: ({ row }) => (row.original.is_broadcast ? 'All Users' : `User #${row.original.user_id}`) },
      { header: 'Date', cell: ({ row }) => formatDate(row.original.created_at) },
      {
        header: 'Action',
        cell: ({ row }) => (
          <div className="flex gap-1">
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
        title="Notifications"
        subtitle="Send and manage user notifications"
        actions={
          <Button onClick={openCreate}>
            <Send className="h-4 w-4" /> Send Notification
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
        searchPlaceholder="Search notifications"
        exportName="notifications"
        exportRows={() => list.rows.map((n) => ({ title: n.title, body: n.body, type: n.type, sent_to: n.is_broadcast ? 'All Users' : `User #${n.user_id}`, date: n.created_at }))}
      />

      <CrudModal<Notification>
        open={modalOpen}
        onOpenChange={setModalOpen}
        title="Send Notification"
        fields={FIELDS}
        defaultValues={{ title: '', type: 'system', is_broadcast: true } as any}
        loading={crud.create.isPending}
        submitLabel="Send"
        onSubmit={(v) => {
          const payload = { ...v }
          crud.create.mutate(payload, { onSuccess: () => setModalOpen(false) })
        }}
      />

      <ConfirmDialog
        open={!!toDelete}
        onOpenChange={(v) => !v && setToDelete(null)}
        title="Delete notification?"
        description={`"${toDelete?.title}" will be removed.`}
        loading={crud.remove.isPending}
        onConfirm={() => toDelete && crud.remove.mutate(toDelete.id, { onSuccess: () => setToDelete(null) })}
      />
    </div>
  )
}
