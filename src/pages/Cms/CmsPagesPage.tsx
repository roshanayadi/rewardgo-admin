import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Plus, Save, Trash2, FileText, Eye, EyeOff } from 'lucide-react'
import { cmsApi } from '@/api/services'
import { PageHeader } from '@/components/common/PageHeader'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import type { CmsPage } from '@/types'
import { formatDateTime } from '@/lib/utils'

const EMPTY: Partial<CmsPage> = { slug: '', title: '', body: '', is_published: true }

export default function CmsPagesPage() {
  const queryClient = useQueryClient()
  const { data: pages, isLoading } = useQuery({ queryKey: ['cms-pages'], queryFn: cmsApi.list })

  const [selected, setSelected] = useState<CmsPage | null>(null)
  const [draft, setDraft] = useState<Partial<CmsPage> | null>(null)
  const [toDelete, setToDelete] = useState<CmsPage | null>(null)

  const isNew = draft != null && !draft.id

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['cms-pages'] })

  const saveMutation = useMutation({
    mutationFn: () =>
      draft!.id ? cmsApi.update(draft!.id, draft!) : cmsApi.create(draft!),
    onSuccess: (page) => {
      toast.success('Page saved')
      invalidate()
      setSelected(page)
      setDraft(page)
    },
    onError: () => toast.error('Save failed — check slug (lowercase, dashes) and fields'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => cmsApi.remove(id),
    onSuccess: () => {
      toast.success('Page deleted')
      invalidate()
      setToDelete(null)
      setSelected(null)
      setDraft(null)
    },
  })

  const openPage = (p: CmsPage) => {
    setSelected(p)
    setDraft({ ...p })
  }

  const openNew = () => {
    setSelected(null)
    setDraft({ ...EMPTY })
  }

  const set = (k: keyof CmsPage, v: unknown) => setDraft((d) => ({ ...d!, [k]: v }))

  return (
    <div>
      <PageHeader
        title="CMS Pages"
        subtitle="Terms, Privacy Policy, About and other content pages (Markdown)"
        actions={
          <Button onClick={openNew}>
            <Plus className="h-4 w-4" /> New Page
          </Button>
        }
      />

      <div className="grid gap-5 lg:grid-cols-[280px,1fr]">
        {/* Page list */}
        <div className="space-y-2">
          {isLoading && <p className="text-sm text-slate-400">Loading…</p>}
          {(pages ?? []).map((p) => (
            <button
              key={p.id}
              onClick={() => openPage(p)}
              className={`w-full rounded-xl border p-3 text-left transition ${
                selected?.id === p.id
                  ? 'border-primary bg-primary-50 dark:bg-primary/10'
                  : 'border-slate-100 bg-white hover:border-slate-200 dark:border-slate-800 dark:bg-slate-900'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-slate-400" />
                  <span className="text-sm font-medium">{p.title}</span>
                </div>
                {p.is_published ? (
                  <Eye className="h-3.5 w-3.5 text-emerald-500" />
                ) : (
                  <EyeOff className="h-3.5 w-3.5 text-slate-400" />
                )}
              </div>
              <p className="mt-1 font-mono text-[11px] text-slate-400">/{p.slug}</p>
            </button>
          ))}
          {(pages ?? []).length === 0 && !isLoading && (
            <p className="text-sm text-slate-400">No pages yet.</p>
          )}
        </div>

        {/* Editor */}
        {draft ? (
          <div className="rounded-2xl border border-slate-100 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-4 flex flex-wrap items-end gap-3">
              <div>
                <p className="mb-1 text-xs font-medium text-slate-500">Slug (URL key)</p>
                <Input
                  value={draft.slug ?? ''}
                  onChange={(e) => set('slug', e.target.value.toLowerCase())}
                  placeholder="terms"
                  className="w-44 font-mono"
                  disabled={!isNew}
                />
              </div>
              <div className="min-w-[220px] flex-1">
                <p className="mb-1 text-xs font-medium text-slate-500">Title</p>
                <Input
                  value={draft.title ?? ''}
                  onChange={(e) => set('title', e.target.value)}
                  placeholder="Terms & Conditions"
                />
              </div>
              <button
                onClick={() => set('is_published', !draft.is_published)}
                className="rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700"
              >
                {draft.is_published ? (
                  <Badge tone="green">Published</Badge>
                ) : (
                  <Badge tone="gray">Draft</Badge>
                )}
              </button>
            </div>

            <p className="mb-1 text-xs font-medium text-slate-500">Body (Markdown)</p>
            <textarea
              value={draft.body ?? ''}
              onChange={(e) => set('body', e.target.value)}
              rows={18}
              className="w-full rounded-xl border border-slate-200 bg-white p-4 font-mono text-sm leading-6 outline-none focus:border-primary dark:border-slate-700 dark:bg-slate-950"
              placeholder={'# Heading\n\nYour content here…'}
            />

            <div className="mt-4 flex items-center justify-between">
              <div className="text-xs text-slate-400">
                {selected && <>Last updated {formatDateTime(selected.updated_at)}</>}
              </div>
              <div className="flex gap-2">
                {selected && (
                  <Button variant="outline" onClick={() => setToDelete(selected)}>
                    <Trash2 className="h-4 w-4" /> Delete
                  </Button>
                )}
                <Button
                  onClick={() => saveMutation.mutate()}
                  loading={saveMutation.isPending}
                  disabled={!draft.slug || !draft.title || !draft.body}
                >
                  <Save className="h-4 w-4" /> Save
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex min-h-[300px] items-center justify-center rounded-2xl border border-dashed border-slate-200 text-sm text-slate-400 dark:border-slate-700">
            Select a page to edit, or create a new one
          </div>
        )}
      </div>

      <ConfirmDialog
        open={!!toDelete}
        onOpenChange={(v) => !v && setToDelete(null)}
        title="Delete page?"
        description={`"${toDelete?.title}" (/${toDelete?.slug}) will be removed from the app.`}
        onConfirm={() => toDelete && deleteMutation.mutate(toDelete.id)}
        loading={deleteMutation.isPending}
      />
    </div>
  )
}
