import { useQuery } from '@tanstack/react-query'
import { Users, DollarSign, Banknote } from 'lucide-react'
import { reportsApi } from '@/api/services'
import { PageHeader } from '@/components/common/PageHeader'
import { StatCard } from '@/components/common/StatCard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { AreaChart, DonutChart } from '@/components/charts/Charts'
import { formatCoins, formatNumber, formatDate } from '@/lib/utils'

export default function ReportsPage() {
  const { data: users } = useQuery({ queryKey: ['report', 'users'], queryFn: () => reportsApi.users() })
  const { data: earnings } = useQuery({ queryKey: ['report', 'earnings'], queryFn: () => reportsApi.earnings() })
  const { data: withdrawals } = useQuery({ queryKey: ['report', 'wd'], queryFn: () => reportsApi.withdrawals() })

  const perDay = earnings?.per_day ?? []
  const bySource = earnings?.by_source ?? {}
  const sourceLabels = Object.keys(bySource)
  const sourceValues = Object.values(bySource).map((v: any) => Number(v))

  return (
    <div>
      <PageHeader title="Reports" subtitle="Platform performance & earnings analytics" />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard label="Total Users" value={formatNumber(users?.total_users)} icon={Users} tone="blue" trend={12.5} />
        <StatCard label="Total Credited" value={formatCoins(earnings?.total_credited)} icon={DollarSign} tone="green" trend={18.7} />
        <StatCard label="Total Paid Out" value={formatCoins(withdrawals?.total_paid_out)} icon={Banknote} tone="red" trend={15.2} />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Earnings Overview (30 days)</CardTitle>
          </CardHeader>
          <CardContent>
            <AreaChart
              categories={perDay.map((d: any) => formatDate(d.date, 'DD MMM'))}
              series={[{ name: 'Earnings', data: perDay.map((d: any) => Number(d.total)) }]}
              colors={['#dc2626']}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Earning Sources</CardTitle>
          </CardHeader>
          <CardContent>
            {sourceLabels.length ? (
              <DonutChart labels={sourceLabels} series={sourceValues} />
            ) : (
              <p className="py-10 text-center text-sm text-slate-400">No earnings data yet</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
