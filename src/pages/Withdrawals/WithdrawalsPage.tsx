import { useMemo, useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { ColumnDef } from '@tanstack/react-table'
import { toast } from 'sonner'
import { Check, X } from 'lucide-react'
import { withdrawalsApi } from '@/api/services'
import { useResourceList } from '@/hooks/useResourceList'
import { DataTable } from '@/components/tables/DataTable'
import { PageHeader } from '@/components/common/PageHeader'
import { StatusBadge } from '@/components/ui/Badge'
import { Select } from '@/components/ui/Input'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import type { Withdrawal } from '@/types'
import { formatCoins, formatDate } from '@/lib/utils'

export default function WithdrawalsPage() {
  const qc = useQueryClient()
  const list = useResourceList<Withdrawal>('withdrawals', (p) => withdrawalsApi.list(p))
  const [action, setAction] = useState<{ w: Withdrawal; type: 'approve' | 'reject' } | null>(null)

  const mutation = useMutation({
    mutationFn: ({ uuid, type }: { uuid: string; type: 'approve' | 'reject' }) =>
      type === 'approve' ? withdrawalsApi.approve(uuid) : withdrawalsApi.reject(uuid),
    onSuccess: () => {
      toast.success('Withdrawal updated')
      qc.invalidateQueries({ queryKey: ['withdrawals'] })
      setAction(null)
    },
  })

  const columns = useMemo<ColumnDef<Withdrawal>[]>(
    () => [
      { header: 'User', cell: ({ row }) => row.original.user?.name ?? `User #${row.original.user_id}` },
      { header: 'Method', accessorKey: 'method' },
      { header: 'Amount', cell: ({ row }) => <span className="font-semibold">{formatCoins(row.original.amount)}</span> },
      { header: 'Fee', cell: ({ row }) => formatCoins(row.original.fee) },
      { header: 'Net', cell: ({ row }) => formatCoins(row.original.net_amount) },
      { header: 'Status', cell: ({ row }) => <StatusBadge status={row.original.status} /> },
      { header: 'Date', cell: ({ row }) => formatDate(row.original.created_at) },
      {
        header: 'Action',
        cell: ({ row }) =>
          row.original.status === 'pending' ? (
            <div className="flex gap-1">
              <button
                onClick={() => setAction({ w: row.original, type: 'approve' })}
                className="rounded-md p-1.5 text-emerald-600 hover:bg-emerald-50"
                title="Approve"
              >
                <Check className="h-4 w-4" />
              </button>
              <button
                onClick={() => setAction({ w: row.original, type: 'reject' })}
                className="rounded-md p-1.5 text-red-600 hover:bg-red-50"
                title="Reject"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <span className="text-xs text-slate-400">—</span>
          ),
      },
    ],
    [],
  )

  return (
    <div>
      <PageHeader title="Withdrawals" subtitle="Review and process withdrawal requests" />

      <DataTable
        columns={columns}
        data={list.rows}
        loading={list.loading}
        meta={list.meta}
        onPageChange={list.setPage}
        search={list.search}
        onSearchChange={list.onSearchChange}
        searchPlaceholder="Search withdrawals"
        exportName="withdrawals"
        exportRows={() =>
          list.rows.map((w) => ({
            user: w.user?.name ?? w.user_id,
            method: w.method,
            amount: w.amount,
            net: w.net_amount,
            status: w.status,
            date: w.created_at,
          }))
        }
        toolbar={
          <Select value={(list.filters.status as string) ?? ''} onChange={(e) => list.setFilter('status', e.target.value)}>
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="paid">Paid</option>
          </Select>
        }
      />

      <ConfirmDialog
        open={!!action}
        onOpenChange={(v) => !v && setAction(null)}
        title={action?.type === 'approve' ? 'Approve withdrawal?' : 'Reject withdrawal?'}
        description={
          action?.type === 'approve'
            ? `Approve ${formatCoins(action?.w.amount)} withdrawal for ${action?.w.user?.name ?? 'user'}.`
            : `Reject and refund ${formatCoins(action?.w.amount)} to ${action?.w.user?.name ?? 'user'}.`
        }
        confirmLabel={action?.type === 'approve' ? 'Approve' : 'Reject'}
        variant={action?.type === 'approve' ? 'success' : 'danger'}
        loading={mutation.isPending}
        onConfirm={() => action && mutation.mutate({ uuid: action.w.uuid, type: action.type })}
      />
    </div>
  )
}
