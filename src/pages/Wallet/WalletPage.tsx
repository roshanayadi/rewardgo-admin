import { useQuery } from '@tanstack/react-query'
import { Coins, TrendingUp, TrendingDown, Wallet as WalletIcon } from 'lucide-react'
import { dashboardApi, transactionsApi } from '@/api/services'
import { PageHeader } from '@/components/common/PageHeader'
import { StatCard } from '@/components/common/StatCard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { StatusBadge } from '@/components/ui/Badge'
import { formatDateTime } from '@/lib/utils'
import { useCurrency } from '@/hooks/useCurrency'

export default function WalletPage() {
  const { formatCoins, conversion } = useCurrency()
  const { data: stats, isLoading } = useQuery({ queryKey: ['dashboard'], queryFn: dashboardApi.stats })
  const { data: tx } = useQuery({ queryKey: ['wallet', 'tx'], queryFn: () => transactionsApi.list({ per_page: 10 }) })

  return (
    <div>
      <PageHeader title="Wallet" subtitle="Platform coin economy overview" />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Coins in Circulation" value={formatCoins(stats?.total_balance ?? 0)} hint={conversion(stats?.total_balance ?? 0)} icon={Coins} tone="amber" loading={isLoading} />
        <StatCard label="Total Earned" value={formatCoins(stats?.total_earned ?? 0)} hint={conversion(stats?.total_earned ?? 0)} icon={TrendingUp} tone="green" loading={isLoading} />
        <StatCard label="Total Withdrawn" value={formatCoins(stats?.total_withdrawn ?? 0)} hint={conversion(stats?.total_withdrawn ?? 0)} icon={TrendingDown} tone="red" loading={isLoading} />
        <StatCard label="Transactions" value={stats?.total_transactions ?? 0} icon={WalletIcon} tone="blue" loading={isLoading} />
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Recent Ledger Activity</CardTitle>
        </CardHeader>
        <CardContent className="px-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800">
                  {['User', 'Type', 'Source', 'Amount', 'Date'].map((h) => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(tx?.data ?? []).map((t) => (
                  <tr key={t.id} className="border-b border-slate-50 dark:border-slate-800/60">
                    <td className="px-5 py-3">{t.user?.name ?? `User #${t.user_id}`}</td>
                    <td className="px-5 py-3"><StatusBadge status={t.type} /></td>
                    <td className="px-5 py-3 text-slate-500">{t.source}</td>
                    <td className={`px-5 py-3 font-semibold ${t.type === 'credit' ? 'text-emerald-600' : 'text-red-600'}`}>
                      {t.type === 'credit' ? '+' : '-'}
                      {formatCoins(t.amount)}
                    </td>
                    <td className="px-5 py-3 text-slate-500">{formatDateTime(t.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
