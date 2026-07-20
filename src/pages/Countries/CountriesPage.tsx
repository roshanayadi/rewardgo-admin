import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Plus, Pencil, Trash2, Globe2 } from 'lucide-react'
import { countriesApi } from '@/api/services'
import { PageHeader } from '@/components/common/PageHeader'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Switch } from '@/components/ui/Switch'
import { CrudModal, type FieldDef } from '@/components/common/CrudModal'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'

interface Country {
  id: number
  code: string
  name: string
  flag: string | null
  currency: string | null
  is_supported: boolean
  users: number
}

const FIELDS: FieldDef[] = [
  { name: 'code', label: 'ISO Code (2 letters)', required: true },
  { name: 'name', label: 'Country Name', required: true },
  { name: 'flag', label: 'Flag Emoji' },
  { name: 'currency', label: 'Currency (e.g. NPR)' },
]

export default function CountriesPage() {
  const queryClient = useQueryClient()
  const { data: countries, isLoading } = useQuery({ queryKey: ['countries'], queryFn: countriesApi.list })

  const [editing, setEditing] = useState<Country | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [toDelete, setToDelete] = useState<Country | null>(null)

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['countries'] })

  const saveMutation = useMutation({
    mutationFn: (payload: Record<string, unknown>) =>
      editing ? countriesApi.update(editing.id, payload) : countriesApi.create(payload),
    onSuccess: () => {
      toast.success('Country saved')
      setModalOpen(false)
      invalidate()
    },
    onError: () => toast.error('Save failed — check the ISO code'),
  })

  const toggleMutation = useMutation({
    mutationFn: (c: Country) => countriesApi.update(c.id, { is_supported: !c.is_supported }),
    onSuccess: (_data, c) => {
      toast.success(c.is_supported ? `${c.name} geo-blocked` : `${c.name} enabled`)
      invalidate()
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => countriesApi.remove(id),
    onSuccess: () => {
      toast.success('Country removed')
      setToDelete(null)
      invalidate()
    },
  })

  return (
    <div>
      <PageHeader
        title="Countries"
        subtitle="Supported markets, currencies and geo blocking"
        actions={
          <Button
            onClick={() => {
              setEditing(null)
              setModalOpen(true)
            }}
          >
            <Plus className="h-4 w-4" /> Add Country
          </Button>
        }
      />

      <div className="overflow-hidden rounded-xl border border-slate-100 dark:border-slate-800">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs text-slate-500 dark:bg-slate-900">
            <tr>
              <th className="px-4 py-3">Country</th>
              <th className="px-4 py-3">Code</th>
              <th className="px-4 py-3">Currency</th>
              <th className="px-4 py-3">Users</th>
              <th className="px-4 py-3">Supported</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {(countries ?? []).map((c: Country) => (
              <tr key={c.id} className="border-t border-slate-100 dark:border-slate-800">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    {/* Real flag image — emoji flags don't render on Windows */}
                    <img
                      src={`https://flagcdn.com/w40/${c.code.toLowerCase()}.png`}
                      srcSet={`https://flagcdn.com/w80/${c.code.toLowerCase()}.png 2x`}
                      alt={c.code}
                      className="h-5 w-7 rounded-sm border border-slate-100 object-cover dark:border-slate-700"
                      loading="lazy"
                      onError={(e) => ((e.target as HTMLImageElement).style.display = 'none')}
                    />
                    <span className="font-medium">{c.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 font-mono text-xs">{c.code}</td>
                <td className="px-4 py-3">{c.currency ?? '—'}</td>
                <td className="px-4 py-3">{c.users}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={c.is_supported}
                      onCheckedChange={() => toggleMutation.mutate(c)}
                    />
                    {!c.is_supported && <Badge tone="red">Blocked</Badge>}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-1">
                    <button
                      onClick={() => {
                        setEditing(c)
                        setModalOpen(true)
                      }}
                      className="rounded-md p-1.5 text-blue-600 hover:bg-blue-50"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setToDelete(c)}
                      className="rounded-md p-1.5 text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {(countries ?? []).length === 0 && !isLoading && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-slate-400">
                  <Globe2 className="mx-auto mb-2 h-8 w-8" />
                  No countries yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <CrudModal<Country>
        open={modalOpen}
        onOpenChange={setModalOpen}
        title={editing ? `Edit ${editing.name}` : 'Add Country'}
        fields={FIELDS}
        defaultValues={(editing ?? { code: '', name: '', flag: '', currency: '' }) as any}
        loading={saveMutation.isPending}
        onSubmit={(v: any) => saveMutation.mutate(v)}
      />

      <ConfirmDialog
        open={!!toDelete}
        onOpenChange={(v) => !v && setToDelete(null)}
        title="Remove country?"
        description={`"${toDelete?.name}" will be removed from the supported list.`}
        onConfirm={() => toDelete && deleteMutation.mutate(toDelete.id)}
        loading={deleteMutation.isPending}
      />
    </div>
  )
}
