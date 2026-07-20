import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { toast } from 'sonner'
import { DatabaseBackup, Download, RotateCcw, Trash2, Plus } from 'lucide-react'
import { api } from '@/api/client'
import { backupsApi } from '@/api/services'
import { PageHeader } from '@/components/common/PageHeader'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { formatDateTime } from '@/lib/utils'

interface BackupRow {
  id: number
  filename: string
  size_bytes: number
  tables: number
  trigger: string
  status: string
  error: string | null
  created_at: string
}

function formatBytes(bytes: number): string {
  if (bytes >= 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`
  if (bytes >= 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${bytes} B`
}

export default function BackupsPage() {
  const queryClient = useQueryClient()
  const { data: backups, isLoading } = useQuery({ queryKey: ['backups'], queryFn: backupsApi.list })

  const [toRestore, setToRestore] = useState<BackupRow | null>(null)
  const [toDelete, setToDelete] = useState<BackupRow | null>(null)

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['backups'] })

  const createMutation = useMutation({
    mutationFn: backupsApi.create,
    onSuccess: () => {
      toast.success('Backup created')
      invalidate()
    },
    onError: () => toast.error('Backup failed — check server logs'),
  })

  const restoreMutation = useMutation({
    mutationFn: (id: number) => backupsApi.restore(id),
    onSuccess: () => {
      toast.success('Database restored')
      setToRestore(null)
    },
    onError: () => toast.error('Restore failed — check server logs'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => backupsApi.remove(id),
    onSuccess: () => {
      toast.success('Backup deleted')
      setToDelete(null)
      invalidate()
    },
  })

  const download = async (b: BackupRow) => {
    try {
      const res = await api.get(backupsApi.downloadUrl(b.id), { responseType: 'blob' })
      const url = URL.createObjectURL(res.data as Blob)
      const a = document.createElement('a')
      a.href = url
      a.download = b.filename
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      toast.error('Download failed')
    }
  }

  return (
    <div>
      <PageHeader
        title="Backup & Restore"
        subtitle="Gzipped SQL dumps in storage/app/backups — nightly at 03:20 + manual"
        actions={
          <Button onClick={() => createMutation.mutate()} loading={createMutation.isPending}>
            <Plus className="h-4 w-4" /> Backup Now
          </Button>
        }
      />

      <div className="overflow-hidden rounded-xl border border-slate-100 dark:border-slate-800">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs text-slate-500 dark:bg-slate-900">
            <tr>
              <th className="px-4 py-3">File</th>
              <th className="px-4 py-3">Size</th>
              <th className="px-4 py-3">Tables</th>
              <th className="px-4 py-3">Trigger</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Created</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {(backups ?? []).map((b: BackupRow) => (
              <tr key={b.id} className="border-t border-slate-100 dark:border-slate-800">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <DatabaseBackup className="h-4 w-4 text-slate-400" />
                    <span className="font-mono text-xs">{b.filename}</span>
                  </div>
                  {b.error && <p className="mt-1 text-xs text-red-500">{b.error}</p>}
                </td>
                <td className="px-4 py-3">{formatBytes(b.size_bytes)}</td>
                <td className="px-4 py-3">{b.tables}</td>
                <td className="px-4 py-3">
                  <Badge tone={b.trigger === 'scheduled' ? 'blue' : 'purple'}>{b.trigger}</Badge>
                </td>
                <td className="px-4 py-3">
                  <Badge tone={b.status === 'completed' ? 'green' : 'red'}>{b.status}</Badge>
                </td>
                <td className="px-4 py-3 text-xs text-slate-400">{formatDateTime(b.created_at)}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-1">
                    <button
                      onClick={() => download(b)}
                      className="rounded-md p-1.5 text-blue-600 hover:bg-blue-50"
                      title="Download"
                      disabled={b.status !== 'completed'}
                    >
                      <Download className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setToRestore(b)}
                      className="rounded-md p-1.5 text-amber-600 hover:bg-amber-50"
                      title="Restore"
                      disabled={b.status !== 'completed'}
                    >
                      <RotateCcw className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setToDelete(b)}
                      className="rounded-md p-1.5 text-red-600 hover:bg-red-50"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {(backups ?? []).length === 0 && !isLoading && (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-slate-400">
                  No backups yet — click "Backup Now" to create the first one
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <ConfirmDialog
        open={!!toRestore}
        onOpenChange={(v) => !v && setToRestore(null)}
        title="Restore database?"
        description={`The ENTIRE database will be replaced with "${toRestore?.filename}". Anything saved after that backup will be lost. This cannot be undone.`}
        onConfirm={() => toRestore && restoreMutation.mutate(toRestore.id)}
        loading={restoreMutation.isPending}
      />

      <ConfirmDialog
        open={!!toDelete}
        onOpenChange={(v) => !v && setToDelete(null)}
        title="Delete backup?"
        description={`"${toDelete?.filename}" will be removed from the server.`}
        onConfirm={() => toDelete && deleteMutation.mutate(toDelete.id)}
        loading={deleteMutation.isPending}
      />
    </div>
  )
}
