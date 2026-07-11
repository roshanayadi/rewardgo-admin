import { useMemo, useState } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { tasksApi } from '@/api/services'
import { useResourceList } from '@/hooks/useResourceList'
import { useCrud } from '@/hooks/useCrud'
import { DataTable } from '@/components/tables/DataTable'
import { PageHeader } from '@/components/common/PageHeader'
import { StatusBadge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Input'
import { CrudModal, type FieldDef } from '@/components/common/CrudModal'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs'
import { CoinRewardsTab } from './CoinRewardsTab'
import { GamesTab } from './GamesTab'
import type { Task } from '@/types'
import { formatCoins, formatDate } from '@/lib/utils'

const FIELDS: FieldDef[] = [
  { name: 'title', label: 'Task Name', required: true },
  {
    name: 'type',
    label: 'Type',
    type: 'select',
    options: ['general', 'survey', 'video', 'app_install', 'signup', 'daily'].map((v) => ({ label: v, value: v })),
  },
  { name: 'reward_amount', label: 'Coins (Reward)', type: 'number', required: true },
  { name: 'status', label: 'Status', type: 'select', options: [
    { label: 'Active', value: 'active' },
    { label: 'Inactive', value: 'inactive' },
  ] },
  { name: 'daily_limit', label: 'Daily Limit', type: 'number' },
  { name: 'total_limit', label: 'Total Limit', type: 'number' },
  { name: 'url', label: 'URL', type: 'url' },
  { name: 'image', label: 'Image URL', type: 'url' },
  { name: 'description', label: 'Description', type: 'textarea' },
]

export default function TasksPage() {
  const list = useResourceList<Task>('tasks', (p) => tasksApi.list(p))
  const crud = useCrud<Task>('tasks', tasksApi, 'Task')
  const [editing, setEditing] = useState<Task | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [toDelete, setToDelete] = useState<Task | null>(null)

  const openCreate = () => {
    setEditing(null)
    setModalOpen(true)
  }
  const openEdit = (t: Task) => {
    setEditing(t)
    setModalOpen(true)
  }

  const columns = useMemo<ColumnDef<Task>[]>(
    () => [
      { header: 'Task Name', accessorKey: 'title', cell: ({ row }) => <span className="font-medium text-slate-700 dark:text-slate-200">{row.original.title}</span> },
      { header: 'Type', accessorKey: 'type' },
      { header: 'Coins', cell: ({ row }) => formatCoins(row.original.reward_amount) },
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
      <PageHeader title="Tasks" subtitle="Manage earning tasks and coin reward amounts" />

      <Tabs defaultValue="tasks">
        <TabsList className="mb-5">
          <TabsTrigger value="tasks">All Tasks</TabsTrigger>
          <TabsTrigger value="games">Games</TabsTrigger>
          <TabsTrigger value="rewards">Coin Rewards</TabsTrigger>
        </TabsList>

        <TabsContent value="tasks">
          <DataTable
            columns={columns}
            data={list.rows}
            loading={list.loading}
            meta={list.meta}
            onPageChange={list.setPage}
            search={list.search}
            onSearchChange={list.onSearchChange}
            searchPlaceholder="Search tasks"
            exportName="tasks"
            exportRows={() => list.rows.map((t) => ({ title: t.title, type: t.type, coins: t.reward_amount, status: t.status }))}
            primaryAction={
              <Button onClick={openCreate}>
                <Plus className="h-4 w-4" /> Add Task
              </Button>
            }
            toolbar={
              <Select value={(list.filters.status as string) ?? ''} onChange={(e) => list.setFilter('status', e.target.value)}>
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </Select>
            }
          />
        </TabsContent>

        <TabsContent value="games">
          <GamesTab />
        </TabsContent>

        <TabsContent value="rewards">
          <CoinRewardsTab />
        </TabsContent>
      </Tabs>

      <CrudModal<Task>
        open={modalOpen}
        onOpenChange={setModalOpen}
        title={editing ? 'Edit Task' : 'Add Task'}
        fields={FIELDS}
        defaultValues={
          (editing ?? { title: '', type: 'general', reward_amount: 0, status: 'active' }) as any
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
        title="Delete task?"
        description={`"${toDelete?.title}" will be removed.`}
        loading={crud.remove.isPending}
        onConfirm={() => toDelete && crud.remove.mutate(toDelete.id, { onSuccess: () => setToDelete(null) })}
      />
    </div>
  )
}
