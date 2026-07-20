import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import type { ColumnDef } from '@tanstack/react-table'
import { Plus, Pencil, Trash2, X } from 'lucide-react'
import { withdrawalMethodsApi, countriesApi } from '@/api/services'
import { useResourceList } from '@/hooks/useResourceList'
import { useCrud } from '@/hooks/useCrud'
import { DataTable } from '@/components/tables/DataTable'
import { PageHeader } from '@/components/common/PageHeader'
import { StatusBadge, Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Input, Label, Select, Textarea } from '@/components/ui/Input'
import { Switch } from '@/components/ui/Switch'
import { Dialog, DialogContent } from '@/components/ui/Dialog'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import type { WithdrawalMethod, MethodField } from '@/types'
import { formatCoins } from '@/lib/utils'

type FormState = {
  name: string
  logo: string
  min_amount: number
  max_amount: number | null
  fee_percent: number
  fee_flat: number
  status: string
  sort_order: number
  instructions: string
  fields: MethodField[]
  countries: string[]
}

const blank: FormState = {
  name: '',
  logo: '',
  min_amount: 0,
  max_amount: null,
  fee_percent: 0,
  fee_flat: 0,
  status: 'active',
  sort_order: 0,
  instructions: '',
  fields: [],
  countries: [],
}

export default function WithdrawalMethodsPage() {
  const list = useResourceList<WithdrawalMethod>('withdrawal-methods', (p) => withdrawalMethodsApi.list(p))
  const { data: allCountries } = useQuery({ queryKey: ['countries'], queryFn: countriesApi.list })
  const crud = useCrud<WithdrawalMethod>('withdrawal-methods', withdrawalMethodsApi, 'Method')

  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<WithdrawalMethod | null>(null)
  const [form, setForm] = useState<FormState>(blank)
  const [toDelete, setToDelete] = useState<WithdrawalMethod | null>(null)

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) => setForm((f) => ({ ...f, [k]: v }))

  const openCreate = () => {
    setEditing(null)
    setForm(blank)
    setOpen(true)
  }
  const openEdit = (m: WithdrawalMethod) => {
    setEditing(m)
    setForm({
      name: m.name,
      logo: m.logo ?? '',
      min_amount: m.min_amount,
      max_amount: m.max_amount,
      fee_percent: m.fee_percent,
      fee_flat: m.fee_flat,
      status: m.status,
      sort_order: m.sort_order,
      instructions: m.instructions ?? '',
      fields: m.fields ?? [],
      countries: (m as any).countries ?? [],
    })
    setOpen(true)
  }

  // ---- dynamic fields ----
  const addField = () =>
    set('fields', [...form.fields, { key: '', label: '', type: 'text', required: true }])
  const updateField = (i: number, patch: Partial<MethodField>) =>
    set(
      'fields',
      form.fields.map((f, idx) => (idx === i ? { ...f, ...patch } : f)),
    )
  const removeField = (i: number) => set('fields', form.fields.filter((_, idx) => idx !== i))

  const autoKey = (label: string) => label.toLowerCase().trim().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '')

  const submit = () => {
    const payload = {
      ...form,
      max_amount: form.max_amount || null,
      instructions: form.instructions || null,
      // ensure every field has a key
      fields: form.fields
        .filter((f) => f.label)
        .map((f) => ({ ...f, key: f.key || autoKey(f.label) })),
      // empty selection = available in every country
      countries: form.countries.length ? form.countries : null,
    }
    const done = () => setOpen(false)
    if (editing) crud.update.mutate({ id: editing.id, payload }, { onSuccess: done })
    else crud.create.mutate(payload, { onSuccess: done })
  }

  const columns = useMemo<ColumnDef<WithdrawalMethod>[]>(
    () => [
      {
        header: 'Method',
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            {row.original.logo ? (
              <img src={row.original.logo} alt="" className="h-8 w-8 rounded object-contain" />
            ) : (
              <div className="flex h-8 w-8 items-center justify-center rounded bg-slate-100 text-xs text-slate-400">
                {row.original.name[0]}
              </div>
            )}
            <span className="font-medium text-slate-700 dark:text-slate-200">{row.original.name}</span>
          </div>
        ),
      },
      { header: 'Min', cell: ({ row }) => formatCoins(row.original.min_amount) },
      { header: 'Max', cell: ({ row }) => (row.original.max_amount != null ? formatCoins(row.original.max_amount) : '∞') },
      {
        header: 'Fee',
        cell: ({ row }) => {
          const parts = []
          if (row.original.fee_percent) parts.push(`${row.original.fee_percent}%`)
          if (row.original.fee_flat) parts.push(formatCoins(row.original.fee_flat))
          return parts.join(' + ') || 'Free'
        },
      },
      { header: 'Fields', cell: ({ row }) => <Badge tone="blue">{row.original.fields?.length ?? 0} fields</Badge> },
      {
        header: 'Countries',
        cell: ({ row }) => {
          const cs = (row.original as any).countries as string[] | null
          if (!cs || cs.length === 0) return <Badge tone="green">Global</Badge>
          return (
            <div className="flex items-center gap-1">
              {cs.slice(0, 4).map((c) => (
                <img
                  key={c}
                  src={`https://flagcdn.com/w20/${c.toLowerCase()}.png`}
                  alt={c}
                  title={c}
                  className="h-3.5 w-5 rounded-[2px] object-cover"
                />
              ))}
              {cs.length > 4 && <span className="text-xs text-slate-400">+{cs.length - 4}</span>}
            </div>
          )
        },
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
      <PageHeader
        title="Withdrawal Methods"
        subtitle="Configure payout methods and the details users must provide"
        actions={
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4" /> Add Method
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
        searchPlaceholder="Search methods"
      />

      {/* Create / Edit modal */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent title={editing ? 'Edit Method' : 'Add Withdrawal Method'} className="max-w-3xl">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 sm:col-span-1">
                <Label>Method Name *</Label>
                <Input value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="e.g. PayPal" />
              </div>
              <div className="col-span-2 sm:col-span-1">
                <Label>Logo URL</Label>
                <Input value={form.logo} onChange={(e) => set('logo', e.target.value)} placeholder="https://..." />
              </div>
              <div className="col-span-2 sm:col-span-1">
                <Label>Minimum Withdraw *</Label>
                <Input type="number" step="any" value={form.min_amount} onChange={(e) => set('min_amount', Number(e.target.value))} />
              </div>
              <div className="col-span-2 sm:col-span-1">
                <Label>Maximum Withdraw</Label>
                <Input type="number" step="any" value={form.max_amount ?? ''} onChange={(e) => set('max_amount', e.target.value ? Number(e.target.value) : null)} placeholder="Unlimited" />
              </div>
              <div className="col-span-2 sm:col-span-1">
                <Label>Fee %</Label>
                <Input type="number" step="any" value={form.fee_percent} onChange={(e) => set('fee_percent', Number(e.target.value))} />
              </div>
              <div className="col-span-2 sm:col-span-1">
                <Label>Flat Fee</Label>
                <Input type="number" step="any" value={form.fee_flat} onChange={(e) => set('fee_flat', Number(e.target.value))} />
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
                <Label>Instructions (optional)</Label>
                <Textarea rows={2} value={form.instructions} onChange={(e) => set('instructions', e.target.value)} placeholder="Shown to the user on the withdrawal form" />
              </div>
            </div>

            {/* Country availability */}
            <div className="rounded-lg border border-slate-200 p-4 dark:border-slate-700">
              <div className="mb-3">
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">Available Countries</p>
                <p className="text-xs text-slate-400">
                  Leave empty for all countries. Selected: {form.countries.length === 0 ? 'Global' : form.countries.join(', ')}
                </p>
              </div>
              <div className="grid max-h-44 grid-cols-2 gap-1 overflow-y-auto sm:grid-cols-3">
                {(allCountries ?? [])
                  .filter((c: any) => c.is_supported)
                  .map((c: any) => {
                    const on = form.countries.includes(c.code)
                    return (
                      <button
                        key={c.code}
                        type="button"
                        onClick={() =>
                          set(
                            'countries',
                            on ? form.countries.filter((x) => x !== c.code) : [...form.countries, c.code],
                          )
                        }
                        className={`flex items-center gap-2 rounded-lg px-2 py-1.5 text-left text-xs transition ${
                          on
                            ? 'bg-primary-50 font-semibold text-primary dark:bg-primary/10'
                            : 'text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800'
                        }`}
                      >
                        <img
                          src={`https://flagcdn.com/w20/${c.code.toLowerCase()}.png`}
                          alt=""
                          className="h-3 w-4.5 rounded-[2px] object-cover"
                        />
                        <span className="truncate">{c.name}</span>
                      </button>
                    )
                  })}
              </div>
            </div>

            {/* Dynamic fields builder */}
            <div className="rounded-lg border border-slate-200 p-4 dark:border-slate-700">
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">Required User Fields</p>
                  <p className="text-xs text-slate-400">What the user must enter for this method (e.g. email, phone, account no.)</p>
                </div>
                <Button size="sm" variant="secondary" onClick={addField}>
                  <Plus className="h-4 w-4" /> Add Field
                </Button>
              </div>

              {form.fields.length === 0 && <p className="py-3 text-center text-xs text-slate-400">No fields yet. Add what the user should provide.</p>}

              <div className="space-y-2">
                {form.fields.map((f, i) => (
                  <div key={i} className="flex flex-col gap-2 rounded-lg bg-slate-50 p-2 dark:bg-slate-800 sm:flex-row sm:items-center">
                    <Input
                      className="h-9 w-full sm:flex-1"
                      placeholder="Field label (e.g. PayPal Email)"
                      value={f.label}
                      onChange={(e) => updateField(i, { label: e.target.value, key: f.key || autoKey(e.target.value) })}
                    />
                    <div className="flex items-center gap-2">
                      <Select className="h-9 flex-1 sm:w-28 sm:flex-none" value={f.type} onChange={(e) => updateField(i, { type: e.target.value as MethodField['type'] })}>
                        <option value="text">Text</option>
                        <option value="email">Email</option>
                        <option value="phone">Phone</option>
                        <option value="number">Number</option>
                      </Select>
                      <label className="flex shrink-0 items-center gap-1.5 text-xs text-slate-500">
                        <Switch checked={f.required} onCheckedChange={(c) => updateField(i, { required: c })} />
                        Required
                      </label>
                      <button onClick={() => removeField(i)} className="shrink-0 rounded-md p-1.5 text-red-500 hover:bg-red-50">
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="secondary" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button loading={crud.create.isPending || crud.update.isPending} disabled={!form.name} onClick={submit}>
                {editing ? 'Update Method' : 'Create Method'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!toDelete}
        onOpenChange={(v) => !v && setToDelete(null)}
        title="Delete method?"
        description={`"${toDelete?.name}" will be removed.`}
        loading={crud.remove.isPending}
        onConfirm={() => toDelete && crud.remove.mutate(toDelete.id, { onSuccess: () => setToDelete(null) })}
      />
    </div>
  )
}
