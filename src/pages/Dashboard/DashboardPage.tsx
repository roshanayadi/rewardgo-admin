import { useQuery } from '@tanstack/react-query'
import { Users, DollarSign, Banknote, Coins, Clock, ArrowUpRight } from 'lucide-react'
import { dashboardApi, transactionsApi, withdrawalsApi, usersApi } from '@/api/services'
import { StatCard } from '@/components/common/StatCard'
import { PageHeader } from '@/components/common/PageHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { AreaChart, DonutChart } from '@/components/charts/Charts'
import { Avatar } from '@/components/ui/Avatar'
import { StatusBadge } from '@/components/ui/Badge'
import { formatNumber, fromNow, formatDate } from '@/lib/utils'
import { useCurrency } from '@/hooks/useCurrency'
import dayjs from 'dayjs'

export default function DashboardPage() {
  const { formatCoins, conversion } = useCurrency()
  const { data: stats, isLoading } = useQuery({ queryKey: ['dashboard'], queryFn: dashboardApi.stats })
  const { data: recentTx } = useQuery({
    queryKey: ['dashboard', 'tx'],
    queryFn: () => transactionsApi.list({ per_page: 5 }),
  })
  const { data: recentWd } = useQuery({
    queryKey: ['dashboard', 'wd'],
    queryFn: () => withdrawalsApi.list({ per_page: 5 }),
  })
  const { data: recentUsers } = useQuery({
    queryKey: ['dashboard', 'users'],
    queryFn: () => usersApi.list({ per_page: 5 }),
  })

  const growth = stats?.users_last_7_days ?? []

  return (
    <div>
      <PageHeader title="Dashboard" subtitle="Welcome back, here's what's happening today" />

      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Users" value={formatNumber(stats?.total_users)} icon={Users} tone="red" loading={isLoading} trend={12.5} />
        <StatCard label="Total Earnings" value={formatCoins(stats?.total_earned ?? 0)} hint={conversion(stats?.total_earned ?? 0)} icon={DollarSign} tone="green" loading={isLoading} />
        <StatCard label="Total Withdrawn" value={formatCoins(stats?.total_withdrawn ?? 0)} hint={conversion(stats?.total_withdrawn ?? 0)} icon={Banknote} tone="blue" loading={isLoading} />
        <StatCard label="Coins in System" value={formatCoins(stats?.total_balance ?? 0)} hint={conversion(stats?.total_balance ?? 0)} icon={Coins} tone="amber" loading={isLoading} />
      </div>

      {/* Charts row */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>User Growth (Last 7 days)</CardTitle>
          </CardHeader>
          <CardContent>
            <AreaChart
              categories={growth.map((g) => formatDate(g.date, 'DD MMM'))}
              series={[{ name: 'New Users', data: growth.map((g) => g.count) }]}
              colors={['#dc2626']}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <DonutChart
              labels={['Balance', 'Earned', 'Withdrawn']}
              series={[
                Number(stats?.total_balance ?? 0),
                Number(stats?.total_earned ?? 0),
                Number(stats?.total_withdrawn ?? 0),
              ]}
            />
          </CardContent>
        </Card>
      </div>

      {/* Secondary stat row */}
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Active Users" value={formatNumber(stats?.active_users)} icon={Users} tone="green" loading={isLoading} />
        <StatCard label="New Today" value={formatNumber(stats?.new_users_today)} icon={ArrowUpRight} tone="purple" loading={isLoading} />
        <StatCard label="Pending Withdrawals" value={formatNumber(stats?.pending_withdrawals_count)} icon={Clock} tone="amber" loading={isLoading} />
        <StatCard label="Transactions" value={formatNumber(stats?.total_transactions)} icon={ArrowUpRight} tone="blue" loading={isLoading} />
      </div>

      {/* Recent lists */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Recent Users</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {(recentUsers?.data ?? []).map((u) => (
              <div key={u.id} className="flex items-center gap-3">
                <Avatar src={u.avatar} name={u.name} className="h-9 w-9" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-slate-700 dark:text-slate-200">{u.name}</p>
                  <p className="truncate text-xs text-slate-400">{u.email}</p>
                </div>
                <span className="text-xs text-slate-400">{fromNow(u.created_at)}</span>
              </div>
            ))}
            {!recentUsers?.data?.length && <p className="text-sm text-slate-400">No users yet</p>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Withdrawals</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {(recentWd?.data ?? []).map((w) => (
              <div key={w.id} className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-slate-700 dark:text-slate-200">
                    {w.user?.name ?? `User #${w.user_id}`}
                  </p>
                  <p className="text-xs text-slate-400">{w.method}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{formatCoins(w.amount)}</p>
                  <StatusBadge status={w.status} />
                </div>
              </div>
            ))}
            {!recentWd?.data?.length && <p className="text-sm text-slate-400">No withdrawals yet</p>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {(recentTx?.data ?? []).map((t) => (
              <div key={t.id} className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-slate-700 dark:text-slate-200">
                    {t.description ?? t.source}
                  </p>
                  <p className="text-xs text-slate-400">{dayjs(t.created_at).format('DD MMM, hh:mm A')}</p>
                </div>
                <span className={t.type === 'credit' ? 'text-sm font-semibold text-emerald-600' : 'text-sm font-semibold text-red-600'}>
                  {t.type === 'credit' ? '+' : '-'}
                  {formatCoins(t.amount)}
                </span>
              </div>
            ))}
            {!recentTx?.data?.length && <p className="text-sm text-slate-400">No transactions yet</p>}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
