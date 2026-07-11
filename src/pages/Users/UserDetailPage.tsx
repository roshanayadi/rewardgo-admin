import { useQuery } from '@tanstack/react-query'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Wallet as WalletIcon, TrendingUp, TrendingDown, Users2, Share2 } from 'lucide-react'
import { usersApi, transactionsApi, withdrawalsApi, referralsApi } from '@/api/services'
import { PageHeader } from '@/components/common/PageHeader'
import { StatCard } from '@/components/common/StatCard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Avatar } from '@/components/ui/Avatar'
import { Badge, StatusBadge } from '@/components/ui/Badge'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/common/EmptyState'
import { formatCoins, formatDateTime, formatDate } from '@/lib/utils'
import { useCurrency } from '@/hooks/useCurrency'

export default function UserDetailPage() {
  const { conversion } = useCurrency()
  const { id } = useParams<{ id: string }>()
  const userId = Number(id)

  const { data: user, isLoading } = useQuery({ queryKey: ['user', userId], queryFn: () => usersApi.get(userId) })
  const { data: txns } = useQuery({
    queryKey: ['user', userId, 'tx'],
    queryFn: () => transactionsApi.list({ user_id: userId, per_page: 20 }),
  })
  const { data: wds } = useQuery({
    queryKey: ['user', userId, 'wd'],
    queryFn: () => withdrawalsApi.list({ user_id: userId, per_page: 20 }),
  })
  const { data: refs } = useQuery({
    queryKey: ['user', userId, 'refs'],
    queryFn: () => referralsApi.forUser(userId, { per_page: 50 }),
  })

  const wallet = user?.wallet
  const referredUsers = refs?.data ?? []

  return (
    <div>
      <PageHeader
        title="User Details"
        subtitle={user?.email}
        actions={
          <Link to="/users">
            <Button variant="secondary">
              <ArrowLeft className="h-4 w-4" /> Back
            </Button>
          </Link>
        }
      />

      {isLoading ? (
        <p className="text-sm text-slate-400">Loading…</p>
      ) : (
        <>
          {/* Profile header */}
          <Card className="mb-6">
            <CardContent className="flex flex-wrap items-center gap-4 pt-6">
              <Avatar src={user?.avatar} name={user?.name} className="h-16 w-16" />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">{user?.name}</h2>
                  <StatusBadge status={user?.status} />
                </div>
                <p className="text-sm text-slate-500">{user?.email} · {user?.phone ?? 'no phone'}</p>
                <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-slate-400">
                  {user?.roles?.map((r) => <Badge key={r} tone="red">{r}</Badge>)}
                  {user?.referral_code && <Badge tone="purple">Ref: {user.referral_code}</Badge>}
                  <span>Joined {formatDate(user?.created_at)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Wallet stats */}
          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard label="Balance" value={formatCoins(wallet?.balance ?? 0)} hint={conversion(wallet?.balance ?? 0)} icon={WalletIcon} tone="amber" />
            <StatCard label="Total Earned" value={formatCoins(wallet?.total_earned ?? 0)} hint={conversion(wallet?.total_earned ?? 0)} icon={TrendingUp} tone="green" />
            <StatCard label="Total Withdrawn" value={formatCoins(wallet?.total_withdrawn ?? 0)} hint={conversion(wallet?.total_withdrawn ?? 0)} icon={TrendingDown} tone="red" />
            <StatCard label="Pending Balance" value={formatCoins(wallet?.pending_balance ?? 0)} icon={Users2} tone="blue" />
          </div>

          {/* Activity tabs */}
          <Card>
            <CardContent className="pt-5">
              <Tabs defaultValue="transactions">
                <TabsList>
                  <TabsTrigger value="transactions">Transactions</TabsTrigger>
                  <TabsTrigger value="withdrawals">Withdrawals</TabsTrigger>
                  <TabsTrigger value="referrals">Referral Activity {referredUsers.length > 0 && `(${referredUsers.length})`}</TabsTrigger>
                </TabsList>

                <TabsContent value="transactions">
                  {txns?.data?.length ? (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-slate-100 dark:border-slate-800">
                            {['Type', 'Source', 'Amount', 'Description', 'Date'].map((h) => (
                              <th key={h} className="px-3 py-2.5 text-left text-xs font-semibold uppercase text-slate-400">{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {txns.data.map((t) => (
                            <tr key={t.id} className="border-b border-slate-50 dark:border-slate-800/60">
                              <td className="px-3 py-2.5"><StatusBadge status={t.type} /></td>
                              <td className="px-3 py-2.5 text-slate-500">{t.source}</td>
                              <td className={`px-3 py-2.5 font-semibold ${t.type === 'credit' ? 'text-emerald-600' : 'text-red-600'}`}>
                                {t.type === 'credit' ? '+' : '-'}{formatCoins(t.amount)}
                              </td>
                              <td className="px-3 py-2.5 text-slate-500">{t.description ?? '—'}</td>
                              <td className="px-3 py-2.5 text-slate-500">{formatDateTime(t.created_at)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <EmptyState message="No transactions" />
                  )}
                </TabsContent>

                <TabsContent value="withdrawals">
                  {wds?.data?.length ? (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-slate-100 dark:border-slate-800">
                            {['Amount', 'Method', 'Net', 'Status', 'Date'].map((h) => (
                              <th key={h} className="px-3 py-2.5 text-left text-xs font-semibold uppercase text-slate-400">{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {wds.data.map((w) => (
                            <tr key={w.id} className="border-b border-slate-50 dark:border-slate-800/60">
                              <td className="px-3 py-2.5 font-semibold">{formatCoins(w.amount)}</td>
                              <td className="px-3 py-2.5 text-slate-500">{w.method}</td>
                              <td className="px-3 py-2.5">{formatCoins(w.net_amount)}</td>
                              <td className="px-3 py-2.5"><StatusBadge status={w.status} /></td>
                              <td className="px-3 py-2.5 text-slate-500">{formatDateTime(w.created_at)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <EmptyState message="No withdrawals" />
                  )}
                </TabsContent>

                <TabsContent value="referrals">
                  <div className="mb-4 flex flex-wrap items-center gap-3 rounded-lg bg-primary-50/50 p-4 dark:bg-primary/5">
                    <Share2 className="h-5 w-5 text-primary" />
                    <div className="text-sm">
                      <span className="text-slate-500">Referral code: </span>
                      <span className="font-semibold text-slate-800 dark:text-slate-100">{user?.referral_code ?? '—'}</span>
                    </div>
                    <div className="text-sm">
                      <span className="text-slate-500">Total referred: </span>
                      <span className="font-semibold text-primary">{referredUsers.length}</span>
                    </div>
                  </div>
                  {referredUsers.length ? (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-slate-100 dark:border-slate-800">
                            {['User', 'Status', 'Earned', 'Joined'].map((h) => (
                              <th key={h} className="px-3 py-2.5 text-left text-xs font-semibold uppercase text-slate-400">{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {referredUsers.map((r: any) => (
                            <tr key={r.id} className="border-b border-slate-50 dark:border-slate-800/60">
                              <td className="px-3 py-2.5">
                                <Link to={`/users/${r.id}`} className="font-medium text-primary hover:underline">{r.name}</Link>
                                <p className="text-xs text-slate-400">{r.email}</p>
                              </td>
                              <td className="px-3 py-2.5"><StatusBadge status={r.status} /></td>
                              <td className="px-3 py-2.5 font-medium">{formatCoins(r.earned)}</td>
                              <td className="px-3 py-2.5 text-slate-500">{formatDate(r.joined)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <EmptyState message="No referrals yet" hint="This user hasn't referred anyone." />
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
