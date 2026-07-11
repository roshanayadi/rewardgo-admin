import { useMemo, useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { ColumnDef } from '@tanstack/react-table'
import { toast } from 'sonner'
import { Ban, CheckCircle2, Trash2, Plus, Pencil, Eye } from 'lucide-react'
import { Link } from 'react-router-dom'
import { usersApi, usersExtraApi } from '@/api/services'
import { useResourceList } from '@/hooks/useResourceList'
import { useCrud } from '@/hooks/useCrud'
import { DataTable } from '@/components/tables/DataTable'
import { PageHeader } from '@/components/common/PageHeader'
import { Avatar } from '@/components/ui/Avatar'
import { StatusBadge } from '@/components/ui/Badge'
import { Select } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { UserFormModal, type UserFormValues } from './UserFormModal'
import type { User } from '@/types'
import { formatCoins, formatDate } from '@/lib/utils'

export default function UsersPage() {
  const qc = useQueryClient()
  const list = useResourceList<User>('users', (p) => usersApi.list(p))
  const crud = useCrud<User>('users', usersApi, 'User')
  const [confirm, setConfirm] = useState<{ user: User; action: 'delete' | 'ban' | 'activate' } | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<User | null>(null)

  const openCreate = () => {
    setEditing(null)
    setModalOpen(true)
  }
  const openEdit = (user: User) => {
    setEditing(user)
    setModalOpen(true)
  }

  const handleSubmit = (values: UserFormValues) => {
    const done = () => setModalOpen(false)
    if (editing) crud.update.mutate({ id: editing.id, payload: values }, { onSuccess: done })
    else crud.create.mutate(values, { onSuccess: done })
  }

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) =>
      usersExtraApi.updateStatus({ user_id: id, status }),
    onSuccess: () => {
      toast.success('User status updated')
      qc.invalidateQueries({ queryKey: ['users'] })
      setConfirm(null)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => usersApi.remove(id),
    onSuccess: () => {
      toast.success('User deleted')
      qc.invalidateQueries({ queryKey: ['users'] })
      setConfirm(null)
    },
  })

  const columns = useMemo<ColumnDef<User>[]>(
    () => [
      {
        header: 'User',
        accessorKey: 'name',
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            <Avatar src={row.original.avatar} name={row.original.name} className="h-9 w-9" />
            <div>
              <p className="font-medium text-slate-700 dark:text-slate-200">{row.original.name}</p>
              <p className="text-xs text-slate-400">{row.original.email}</p>
            </div>
          </div>
        ),
      },
      { header: 'Phone', accessorKey: 'phone', cell: ({ getValue }) => getValue() || '—' },
      {
        header: 'Coins',
        cell: ({ row }) => (
          <span className="font-medium">{formatCoins(row.original.wallet?.balance ?? 0)}</span>
        ),
      },
      { header: 'Role', cell: ({ row }) => row.original.roles?.[0] ?? 'user' },
      { header: 'Status', cell: ({ row }) => <StatusBadge status={row.original.status} /> },
      { header: 'Joined', cell: ({ row }) => formatDate(row.original.created_at) },
      {
        header: 'Action',
        cell: ({ row }) => (
          <div className="flex items-center gap-1">
            <Link
              to={`/users/${row.original.id}`}
              className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
              title="View details"
            >
              <Eye className="h-4 w-4" />
            </Link>
            <button
              onClick={() => openEdit(row.original)}
              className="rounded-md p-1.5 text-blue-600 hover:bg-blue-50"
              title="Edit"
            >
              <Pencil className="h-4 w-4" />
            </button>
            {row.original.status === 'active' ? (
              <button
                onClick={() => setConfirm({ user: row.original, action: 'ban' })}
                className="rounded-md p-1.5 text-amber-600 hover:bg-amber-50"
                title="Ban"
              >
                <Ban className="h-4 w-4" />
              </button>
            ) : (
              <button
                onClick={() => setConfirm({ user: row.original, action: 'activate' })}
                className="rounded-md p-1.5 text-emerald-600 hover:bg-emerald-50"
                title="Activate"
              >
                <CheckCircle2 className="h-4 w-4" />
              </button>
            )}
            <button
              onClick={() => setConfirm({ user: row.original, action: 'delete' })}
              className="rounded-md p-1.5 text-red-600 hover:bg-red-50"
              title="Delete"
            >
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
        title="Users"
        subtitle="Manage platform users and their status"
        actions={
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4" /> Add User
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
        searchPlaceholder="Search by name, email or phone"
        exportName="users"
        exportRows={() =>
          list.rows.map((u) => ({
            name: u.name,
            email: u.email,
            phone: u.phone,
            balance: u.wallet?.balance ?? 0,
            status: u.status,
            joined: u.created_at,
          }))
        }
        toolbar={
          <Select value={(list.filters.status as string) ?? ''} onChange={(e) => list.setFilter('status', e.target.value)}>
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="banned">Banned</option>
          </Select>
        }
      />

      <UserFormModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        user={editing}
        loading={crud.create.isPending || crud.update.isPending}
        onSubmit={handleSubmit}
      />

      <ConfirmDialog
        open={!!confirm}
        onOpenChange={(v) => !v && setConfirm(null)}
        title={
          confirm?.action === 'delete'
            ? 'Delete user?'
            : confirm?.action === 'ban'
              ? 'Ban this user?'
              : 'Activate this user?'
        }
        description={
          confirm?.action === 'delete'
            ? `${confirm?.user.name} will be permanently removed.`
            : `${confirm?.user.name}'s account status will change.`
        }
        confirmLabel={confirm?.action === 'delete' ? 'Delete' : confirm?.action === 'ban' ? 'Ban' : 'Activate'}
        variant={confirm?.action === 'activate' ? 'success' : 'danger'}
        loading={statusMutation.isPending || deleteMutation.isPending}
        onConfirm={() => {
          if (!confirm) return
          if (confirm.action === 'delete') deleteMutation.mutate(confirm.user.id)
          else statusMutation.mutate({ id: confirm.user.id, status: confirm.action === 'ban' ? 'banned' : 'active' })
        }}
      />
    </div>
  )
}
