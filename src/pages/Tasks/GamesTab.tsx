import { useMemo, useState } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { Plus, Pencil, Trash2, X, Clock } from 'lucide-react'
import { gamesApi } from '@/api/services'
import { useResourceList } from '@/hooks/useResourceList'
import { useCrud } from '@/hooks/useCrud'
import { DataTable } from '@/components/tables/DataTable'
import { StatusBadge, Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Input, Label, Select, Textarea } from '@/components/ui/Input'
import { Dialog, DialogContent } from '@/components/ui/Dialog'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import type { Game, RewardRule } from '@/types'

type FormState = {
  name: string
  description: string
  thumbnail: string
  game_url: string
  status: string
  sort_order: number
  reward_rules: RewardRule[]
}

const DEFAULT_RULES: RewardRule[] = [
  { minutes: 1, coins: 5 },
  { minutes: 3, coins: 10 },
  { minutes: 7, coins: 20 },
]

const blank: FormState = {
  name: '',
  description: '',
  thumbnail: '',
  game_url: '',
  status: 'active',
  sort_order: 0,
  reward_rules: DEFAULT_RULES,
}

export function GamesTab() {
  const list = useResourceList<Game>('games', (p) => gamesApi.list(p))
  const crud = useCrud<Game>('games', gamesApi, 'Game')

  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Game | null>(null)
  const [form, setForm] = useState<FormState>(blank)
  const [toDelete, setToDelete] = useState<Game | null>(null)

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) => setForm((f) => ({ ...f, [k]: v }))

  const openCreate = () => {
    setEditing(null)
    setForm(blank)
    setOpen(true)
  }
  const openEdit = (g: Game) => {
    setEditing(g)
    setForm({
      name: g.name,
      description: g.description ?? '',
      thumbnail: g.thumbnail ?? '',
      game_url: g.game_url,
      status: g.status,
      sort_order: g.sort_order,
      reward_rules: g.reward_rules?.length ? g.reward_rules : DEFAULT_RULES,
    })
    setOpen(true)
  }

  // ---- reward rule rows ----
  const addRule = () => set('reward_rules', [...form.reward_rules, { minutes: 1, coins: 0 }])
  const updateRule = (i: number, patch: Partial<RewardRule>) =>
    set('reward_rules', form.reward_rules.map((r, idx) => (idx === i ? { ...r, ...patch } : r)))
  const removeRule = (i: number) => set('reward_rules', form.reward_rules.filter((_, idx) => idx !== i))

  const submit = () => {
    const payload = {
      ...form,
      description: form.description || null,
      reward_rules: form.reward_rules.filter((r) => r.minutes > 0),
    }
    const done = () => setOpen(false)
    if (editing) crud.update.mutate({ id: editing.id, payload }, { onSuccess: done })
    else crud.create.mutate(payload, { onSuccess: done })
  }

  const columns = useMemo<ColumnDef<Game>[]>(
    () => [
      {
        header: 'Game',
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            {row.original.thumbnail ? (
              <img src={row.original.thumbnail} alt="" className="h-9 w-9 rounded object-contain" />
            ) : (
              <div className="flex h-9 w-9 items-center justify-center rounded bg-slate-100 text-xs text-slate-400">
                {row.original.name[0]}
              </div>
            )}
            <div>
              <p className="font-medium text-slate-700 dark:text-slate-200">{row.original.name}</p>
              <p className="max-w-xs truncate text-xs text-slate-400">{row.original.game_url}</p>
            </div>
          </div>
        ),
      },
      {
        header: 'Reward Milestones',
        cell: ({ row }) => (
          <div className="flex flex-wrap gap-1">
            {(row.original.reward_rules ?? []).map((r, i) => (
              <Badge key={i} tone="blue">
                {r.minutes}m → {r.coins}
              </Badge>
            ))}
          </div>
        ),
      },
      { header: 'Status', cell: ({ row }) => <StatusBadge status={row.original.status} /> },
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
      <DataTable
        columns={columns}
        data={list.rows}
        loading={list.loading}
        meta={list.meta}
        onPageChange={list.setPage}
        search={list.search}
        onSearchChange={list.onSearchChange}
        searchPlaceholder="Search games"
        primaryAction={
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4" /> Add Game
          </Button>
        }
      />

      {/* Create / Edit modal */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent title={editing ? 'Edit Game' : 'Add HTML Game'} className="max-w-2xl">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 sm:col-span-1">
                <Label>Game Name *</Label>
                <Input value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="e.g. 2048" />
              </div>
              <div className="col-span-2 sm:col-span-1">
                <Label>Thumbnail URL</Label>
                <Input value={form.thumbnail} onChange={(e) => set('thumbnail', e.target.value)} placeholder="https://..." />
              </div>
              <div className="col-span-2">
                <Label>Game URL (HTML5) *</Label>
                <Input value={form.game_url} onChange={(e) => set('game_url', e.target.value)} placeholder="https://play2048.co/" />
              </div>
              <div className="col-span-2 sm:col-span-1">
                <Label>Status</Label>
                <Select className="w-full" value={form.status} onChange={(e) => set('status', e.target.value)}>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </Select>
              </div>
              <div className="col-span-2 sm:col-span-1">
                <Label>Sort Order</Label>
                <Input type="number" value={form.sort_order} onChange={(e) => set('sort_order', Number(e.target.value))} />
              </div>
              <div className="col-span-2">
                <Label>Description</Label>
                <Textarea rows={2} value={form.description} onChange={(e) => set('description', e.target.value)} />
              </div>
            </div>

            {/* Reward milestone builder */}
            <div className="rounded-lg border border-slate-200 p-4 dark:border-slate-700">
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <p className="flex items-center gap-1.5 text-sm font-semibold text-slate-700 dark:text-slate-200">
                    <Clock className="h-4 w-4" /> Timed Coin Rewards
                  </p>
                  <p className="text-xs text-slate-400">Coins credited after the user plays for X minutes</p>
                </div>
                <Button size="sm" variant="secondary" onClick={addRule}>
                  <Plus className="h-4 w-4" /> Add Milestone
                </Button>
              </div>

              <div className="space-y-2">
                {form.reward_rules.map((r, i) => (
                  <div key={i} className="flex items-center gap-2 rounded-lg bg-slate-50 p-2 dark:bg-slate-800">
                    <span className="text-sm text-slate-500">After</span>
                    <Input
                      type="number"
                      min={1}
                      className="h-9 w-20"
                      value={r.minutes}
                      onChange={(e) => updateRule(i, { minutes: Number(e.target.value) })}
                    />
                    <span className="text-sm text-slate-500">min →</span>
                    <Input
                      type="number"
                      step="any"
                      className="h-9 w-28"
                      value={r.coins}
                      onChange={(e) => updateRule(i, { coins: Number(e.target.value) })}
                    />
                    <span className="text-sm text-slate-500">coins</span>
                    <button onClick={() => removeRule(i)} className="ml-auto shrink-0 rounded-md p-1.5 text-red-500 hover:bg-red-50">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="secondary" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button loading={crud.create.isPending || crud.update.isPending} disabled={!form.name || !form.game_url} onClick={submit}>
                {editing ? 'Update Game' : 'Create Game'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!toDelete}
        onOpenChange={(v) => !v && setToDelete(null)}
        title="Delete game?"
        description={`"${toDelete?.name}" will be removed.`}
        loading={crud.remove.isPending}
        onConfirm={() => toDelete && crud.remove.mutate(toDelete.id, { onSuccess: () => setToDelete(null) })}
      />
    </div>
  )
}
