import { useMemo } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { transactionsApi } from '@/api/services'
import { useResourceList } from '@/hooks/useResourceList'
import { DataTable } from '@/components/tables/DataTable'
import { PageHeader } from '@/components/common/PageHeader'
import { StatusBadge } from '@/components/ui/Badge'
import { Select } from '@/components/ui/Input'
import type { Transaction } from '@/types'
import { formatCoins, formatDateTime } from '@/lib/utils'

export default function TransactionsPage() {
  const list = useResourceList<Transaction>('transactions', (p) => transactionsApi.list(p))

  const columns = useMemo<ColumnDef<Transaction>[]>(
    () => [
      { header: 'User', cell: ({ row }) => row.original.user?.name ?? `User #${row.original.user_id}` },
      {
        header: 'Type',
        cell: ({ row }) => <StatusBadge status={row.original.type} />,
      },
      { header: 'Source', accessorKey: 'source' },
      {
        header: 'Amount',
        cell: ({ row }) => (
          <span className={row.original.type === 'credit' ? 'font-semibold text-emerald-600' : 'font-semibold text-red-600'}>
            {row.original.type === 'credit' ? '+' : '-'}
            {formatCoins(row.original.amount)}
          </span>
        ),
      },
      { header: 'Details', cell: ({ row }) => <span className="text-slate-500">{row.original.description ?? '—'}</span> },
      { header: 'Date', cell: ({ row }) => formatDateTime(row.original.created_at) },
    ],
    [],
  )

  return (
    <div>
      <PageHeader title="Transactions" subtitle="Full ledger of all coin movements" />

      <DataTable
        columns={columns}
        data={list.rows}
        loading={list.loading}
        meta={list.meta}
        onPageChange={list.setPage}
        search={list.search}
        onSearchChange={list.onSearchChange}
        searchPlaceholder="Search by description"
        exportName="transactions"
        exportRows={() =>
          list.rows.map((t) => ({
            user: t.user?.name ?? t.user_id,
            type: t.type,
            source: t.source,
            amount: t.amount,
            details: t.description,
            date: t.created_at,
          }))
        }
        toolbar={
          <>
            <Select value={(list.filters.type as string) ?? ''} onChange={(e) => list.setFilter('type', e.target.value)}>
              <option value="">All Types</option>
              <option value="credit">Credit</option>
              <option value="debit">Debit</option>
            </Select>
            <Select value={(list.filters.source as string) ?? ''} onChange={(e) => list.setFilter('source', e.target.value)}>
              <option value="">All Sources</option>
              <option value="task">Task</option>
              <option value="offerwall">Offerwall</option>
              <option value="reward">Reward</option>
              <option value="withdrawal">Withdrawal</option>
              <option value="bonus">Bonus</option>
            </Select>
          </>
        }
      />
    </div>
  )
}
