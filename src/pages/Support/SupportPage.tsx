import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { ColumnDef } from '@tanstack/react-table'
import { toast } from 'sonner'
import { Eye, Trash2 } from 'lucide-react'
import { supportApi } from '@/api/services'
import { useResourceList } from '@/hooks/useResourceList'
import { DataTable } from '@/components/tables/DataTable'
import { PageHeader } from '@/components/common/PageHeader'
import { Badge, StatusBadge, statusTone } from '@/components/ui/Badge'
import { Select, Textarea, Label } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Dialog, DialogContent } from '@/components/ui/Dialog'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import type { SupportTicket } from '@/types'
import { formatDate, formatDateTime } from '@/lib/utils'

const priorityTone = (p: string): 'red' | 'yellow' | 'gray' =>
  p === 'high' ? 'red' : p === 'medium' ? 'yellow' : 'gray'

export default function SupportPage() {
  const qc = useQueryClient()
  const list = useResourceList<SupportTicket>('support', (p) => supportApi.list(p))
  const [viewId, setViewId] = useState<number | null>(null)
  const [reply, setReply] = useState('')
  const [toDelete, setToDelete] = useState<SupportTicket | null>(null)

  const { data: ticket } = useQuery({
    queryKey: ['support', viewId],
    queryFn: () => supportApi.get(viewId!),
    enabled: !!viewId,
  })

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['support'] })
  }

  const replyMutation = useMutation({
    mutationFn: () => supportApi.reply(viewId!, reply),
    onSuccess: () => {
      toast.success('Reply sent')
      setReply('')
      invalidate()
      setViewId(null)
    },
  })

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) => supportApi.updateStatus(id, status),
    onSuccess: () => {
      toast.success('Status updated')
      invalidate()
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => supportApi.remove(id),
    onSuccess: () => {
      toast.success('Ticket deleted')
      invalidate()
      setToDelete(null)
    },
  })

  const columns = useMemo<ColumnDef<SupportTicket>[]>(
    () => [
      { header: 'User', cell: ({ row }) => row.original.user?.name ?? `User #${row.original.user_id}` },
      { header: 'Subject', cell: ({ row }) => <span className="font-medium text-slate-700 dark:text-slate-200">{row.original.subject}</span> },
      { header: 'Priority', cell: ({ row }) => <Badge tone={priorityTone(row.original.priority)}>{row.original.priority}</Badge> },
      {
        header: 'Status',
        cell: ({ row }) => (
          <Select
            value={row.original.status}
            onChange={(e) => statusMutation.mutate({ id: row.original.id, status: e.target.value })}
            className="h-8 text-xs"
          >
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="answered">Answered</option>
            <option value="closed">Closed</option>
          </Select>
        ),
      },
      { header: 'Date', cell: ({ row }) => formatDate(row.original.created_at) },
      {
        header: 'Action',
        cell: ({ row }) => (
          <div className="flex gap-1">
            <button onClick={() => { setViewId(row.original.id); setReply('') }} className="rounded-md p-1.5 text-blue-600 hover:bg-blue-50" title="View / Reply">
              <Eye className="h-4 w-4" />
            </button>
            <button onClick={() => setToDelete(row.original)} className="rounded-md p-1.5 text-red-600 hover:bg-red-50" title="Delete">
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ),
      },
    ],
    [statusMutation],
  )

  return (
    <div>
      <PageHeader title="Support Tickets" subtitle="Respond to user queries and complaints" />

      <DataTable
        columns={columns}
        data={list.rows}
        loading={list.loading}
        meta={list.meta}
        onPageChange={list.setPage}
        search={list.search}
        onSearchChange={list.onSearchChange}
        searchPlaceholder="Search tickets"
        toolbar={
          <Select value={(list.filters.status as string) ?? ''} onChange={(e) => list.setFilter('status', e.target.value)}>
            <option value="">All Status</option>
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="answered">Answered</option>
            <option value="closed">Closed</option>
          </Select>
        }
      />

      {/* View + Reply */}
      <Dialog open={!!viewId} onOpenChange={(v) => !v && setViewId(null)}>
        <DialogContent title={ticket?.subject ?? 'Ticket'} className="max-w-2xl">
          {ticket && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                <span>{ticket.user?.name} · {ticket.user?.email}</span>
                <Badge tone={priorityTone(ticket.priority)}>{ticket.priority}</Badge>
                <Badge tone={statusTone(ticket.status)}>{ticket.status}</Badge>
                <Badge tone="gray">{ticket.category}</Badge>
                <span>· {formatDateTime(ticket.created_at)}</span>
              </div>

              <div className="rounded-lg bg-slate-50 p-4 text-sm text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                {ticket.message}
              </div>

              {ticket.admin_reply && (
                <div className="rounded-lg border border-primary/20 bg-primary-50/50 p-4 text-sm dark:bg-primary/5">
                  <p className="mb-1 text-xs font-semibold text-primary">Admin Reply {ticket.replied_by && `· ${ticket.replied_by}`}</p>
                  <p className="text-slate-700 dark:text-slate-200">{ticket.admin_reply}</p>
                </div>
              )}

              <div>
                <Label>{ticket.admin_reply ? 'Update Reply' : 'Reply'}</Label>
                <Textarea rows={4} value={reply} onChange={(e) => setReply(e.target.value)} placeholder="Type your response..." />
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="secondary" onClick={() => setViewId(null)}>Close</Button>
                <Button loading={replyMutation.isPending} disabled={!reply.trim()} onClick={() => replyMutation.mutate()}>
                  Send Reply
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!toDelete}
        onOpenChange={(v) => !v && setToDelete(null)}
        title="Delete ticket?"
        description={`"${toDelete?.subject}" will be removed.`}
        loading={deleteMutation.isPending}
        onConfirm={() => toDelete && deleteMutation.mutate(toDelete.id)}
      />
    </div>
  )
}
