import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import type { ColumnDef } from '@tanstack/react-table'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { rolesApi, permissionsApi } from '@/api/services'
import { useResourceList } from '@/hooks/useResourceList'
import { useCrud } from '@/hooks/useCrud'
import { DataTable } from '@/components/tables/DataTable'
import { PageHeader } from '@/components/common/PageHeader'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Input, Label } from '@/components/ui/Input'
import { Dialog, DialogContent } from '@/components/ui/Dialog'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import type { Role, Permission } from '@/types'
import { formatDate } from '@/lib/utils'

const CORE_ROLES = ['super-admin', 'admin', 'user']

export default function RolesPage({ embedded = false }: { embedded?: boolean }) {
  const list = useResourceList<Role>('roles', (p) => rolesApi.list(p))
  const crud = useCrud<Role>('roles', rolesApi, 'Role')
  const { data: allPerms } = useQuery({
    queryKey: ['permissions', 'all'],
    queryFn: () => permissionsApi.list({ per_page: 200 }),
  })

  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Role | null>(null)
  const [name, setName] = useState('')
  const [selected, setSelected] = useState<string[]>([])
  const [toDelete, setToDelete] = useState<Role | null>(null)

  const grouped = useMemo(() => {
    const groups: Record<string, Permission[]> = {}
    for (const p of allPerms?.data ?? []) {
      const key = p.name.split('.')[0]
      ;(groups[key] ??= []).push(p)
    }
    return groups
  }, [allPerms])

  const openCreate = () => {
    setEditing(null)
    setName('')
    setSelected([])
    setModalOpen(true)
  }
  const openEdit = async (role: Role) => {
    const full = await rolesApi.get(role.id)
    setEditing(role)
    setName(full.name)
    setSelected(full.permissions ?? [])
    setModalOpen(true)
  }

  const toggle = (perm: string) =>
    setSelected((s) => (s.includes(perm) ? s.filter((p) => p !== perm) : [...s, perm]))

  const submit = () => {
    const payload = { name, permissions: selected }
    const done = () => setModalOpen(false)
    if (editing) crud.update.mutate({ id: editing.id, payload }, { onSuccess: done })
    else crud.create.mutate(payload, { onSuccess: done })
  }

  const columns = useMemo<ColumnDef<Role>[]>(
    () => [
      { header: 'Role', accessorKey: 'name', cell: ({ row }) => <span className="font-medium capitalize text-slate-700 dark:text-slate-200">{row.original.name}</span> },
      { header: 'Guard', accessorKey: 'guard_name' },
      { header: 'Users', cell: ({ row }) => row.original.users_count ?? '—' },
      { header: 'Created', cell: ({ row }) => formatDate(row.original.created_at) },
      {
        header: 'Action',
        cell: ({ row }) => (
          <div className="flex gap-1">
            <button onClick={() => openEdit(row.original)} className="rounded-md p-1.5 text-blue-600 hover:bg-blue-50">
              <Pencil className="h-4 w-4" />
            </button>
            {!CORE_ROLES.includes(row.original.name) && (
              <button onClick={() => setToDelete(row.original)} className="rounded-md p-1.5 text-red-600 hover:bg-red-50">
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
        ),
      },
    ],
    [],
  )

  return (
    <div>
      {!embedded && (
        <PageHeader
          title="Roles"
          subtitle="Define roles and their permissions"
          actions={
            <Button onClick={openCreate}>
              <Plus className="h-4 w-4" /> Add Role
            </Button>
          }
        />
      )}

      <DataTable
        columns={columns}
        data={list.rows}
        loading={list.loading}
        meta={list.meta}
        onPageChange={list.setPage}
        search={list.search}
        onSearchChange={list.onSearchChange}
        searchPlaceholder="Search roles"
        primaryAction={
          embedded ? (
            <Button onClick={openCreate}>
              <Plus className="h-4 w-4" /> Add Role
            </Button>
          ) : undefined
        }
      />

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent title={editing ? 'Edit Role' : 'Add Role'} className="max-w-3xl">
          <div className="space-y-4">
            <div>
              <Label>Role Name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. moderator" disabled={!!editing && CORE_ROLES.includes(editing.name)} />
            </div>
            <div>
              <Label>Permissions</Label>
              <div className="max-h-80 space-y-4 overflow-y-auto rounded-lg border border-slate-200 p-4 dark:border-slate-700">
                {Object.entries(grouped).map(([group, perms]) => (
                  <div key={group}>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">{group}</p>
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                      {perms.map((p) => (
                        <label key={p.id} className="flex cursor-pointer items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                          <input
                            type="checkbox"
                            checked={selected.includes(p.name)}
                            onChange={() => toggle(p.name)}
                            className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary"
                          />
                          {p.name.split('.')[1]}
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <p className="mt-1 text-xs text-slate-400">{selected.length} permissions selected</p>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setModalOpen(false)}>
                Cancel
              </Button>
              <Button loading={crud.create.isPending || crud.update.isPending} onClick={submit}>
                Save Role
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!toDelete}
        onOpenChange={(v) => !v && setToDelete(null)}
        title="Delete role?"
        description={`Role "${toDelete?.name}" will be removed.`}
        loading={crud.remove.isPending}
        onConfirm={() => toDelete && crud.remove.mutate(toDelete.id, { onSuccess: () => setToDelete(null) })}
      />
    </div>
  )
}
