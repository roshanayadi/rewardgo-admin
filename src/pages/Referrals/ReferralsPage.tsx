import { useMemo } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { referralsApi } from '@/api/services'
import { useResourceList } from '@/hooks/useResourceList'
import { DataTable } from '@/components/tables/DataTable'
import { PageHeader } from '@/components/common/PageHeader'
import { Badge } from '@/components/ui/Badge'
import type { Referral } from '@/types'
import { formatCoins, formatNumber, formatDate } from '@/lib/utils'

export default function ReferralsPage() {
  const list = useResourceList<Referral>('referrals', (p) => referralsApi.list(p))

  const columns = useMemo<ColumnDef<Referral>[]>(
    () => [
      { header: 'User', accessorKey: 'name', cell: ({ row }) => (
        <div>
          <p className="font-medium text-slate-700 dark:text-slate-200">{row.original.name}</p>
          <p className="text-xs text-slate-400">{row.original.email}</p>
        </div>
      ) },
      { header: 'Referral Code', cell: ({ row }) => <Badge tone="purple">{row.original.referral_code ?? '—'}</Badge> },
      { header: 'Total Referrals', cell: ({ row }) => <span className="font-semibold">{formatNumber(row.original.total_referrals)}</span> },
      { header: 'Earned Coins', cell: ({ row }) => formatCoins(row.original.earned) },
      { header: 'Joined', cell: ({ row }) => formatDate(row.original.joined) },
    ],
    [],
  )

  return (
    <div>
      <PageHeader title="Referrals" subtitle="Top referrers and their earnings" />
      <DataTable
        columns={columns}
        data={list.rows}
        loading={list.loading}
        meta={list.meta}
        onPageChange={list.setPage}
        search={list.search}
        onSearchChange={list.onSearchChange}
        searchPlaceholder="Search by name, email or code"
        exportName="referrals"
        exportRows={() => list.rows.map((r) => ({ name: r.name, email: r.email, code: r.referral_code, referrals: r.total_referrals, earned: r.earned }))}
      />
    </div>
  )
}
