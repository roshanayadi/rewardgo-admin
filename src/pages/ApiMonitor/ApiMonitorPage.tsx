import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Activity, AlertTriangle, Clock, Gauge, Users2, XCircle } from 'lucide-react'
import { apiMonitorApi } from '@/api/services'
import { useResourceList } from '@/hooks/useResourceList'
import { PageHeader } from '@/components/common/PageHeader'
import { StatCard } from '@/components/common/StatCard'
import { Badge } from '@/components/ui/Badge'
import { Select } from '@/components/ui/Input'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs'
import { AreaChart } from '@/components/charts/Charts'
import { formatDateTime } from '@/lib/utils'

type Tone = 'green' | 'red' | 'yellow' | 'blue' | 'gray' | 'purple'

function statusTone(status: number): Tone {
  if (status >= 500) return 'red'
  if (status >= 400) return 'yellow'
  return 'green'
}

function methodTone(method: string): Tone {
  if (method === 'GET') return 'blue'
  if (method === 'POST') return 'green'
  if (method === 'DELETE') return 'red'
  return 'purple'
}

export default function ApiMonitorPage() {
  const [hours, setHours] = useState(24)
  const [filter, setFilter] = useState('')

  const { data: overview } = useQuery({
    queryKey: ['api-overview', hours],
    queryFn: () => apiMonitorApi.overview(hours),
    refetchInterval: 30_000,
  })
  const { data: endpoints } = useQuery({
    queryKey: ['api-endpoints', hours],
    queryFn: () => apiMonitorApi.endpoints(hours),
  })
  const { data: timeline } = useQuery({
    queryKey: ['api-timeline', hours],
    queryFn: () => apiMonitorApi.timeline(Math.min(hours, 72)),
  })

  const requests = useResourceList<any>(`api-requests-${filter}`, (p) =>
    apiMonitorApi.requests({ ...p, filter: filter || undefined }),
  )

  const categories = (timeline ?? []).map((t: any) => t.bucket.slice(5, 13))
  const series = [
    { name: 'Requests', data: (timeline ?? []).map((t: any) => Number(t.requests)) },
    { name: 'Errors', data: (timeline ?? []).map((t: any) => Number(t.errors)) },
  ]

  return (
    <div>
      <PageHeader
        title="API Monitoring"
        subtitle="Request volume, latency and errors across the API surface"
        actions={
          <Select value={String(hours)} onChange={(e) => setHours(Number(e.target.value))} className="w-36">
            <option value="1">Last hour</option>
            <option value="6">Last 6 hours</option>
            <option value="24">Last 24 hours</option>
            <option value="72">Last 3 days</option>
            <option value="168">Last 7 days</option>
          </Select>
        }
      />

      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-6">
        <StatCard label="Requests" value={overview?.total_requests ?? 0} icon={Activity} />
        <StatCard label="Failed (5xx)" value={overview?.failed_requests ?? 0} icon={XCircle} tone="red" />
        <StatCard label="Client Errors" value={overview?.client_errors ?? 0} icon={AlertTriangle} tone="amber" />
        <StatCard label="Avg Response" value={`${overview?.avg_duration_ms ?? 0} ms`} icon={Gauge} tone="green" />
        <StatCard label="Slow (>1s)" value={overview?.slow_requests ?? 0} icon={Clock} tone="purple" />
        <StatCard label="Active Users" value={overview?.unique_users ?? 0} icon={Users2} tone="blue" />
      </div>

      <div className="mb-6 rounded-2xl border border-slate-100 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
        <p className="mb-3 text-sm font-semibold">Requests per hour</p>
        {categories.length > 0 ? (
          <AreaChart categories={categories} series={series} height={260} />
        ) : (
          <p className="py-10 text-center text-sm text-slate-400">No traffic recorded yet</p>
        )}
      </div>

      <Tabs defaultValue="endpoints">
        <TabsList className="mb-5">
          <TabsTrigger value="endpoints">Endpoints</TabsTrigger>
          <TabsTrigger value="requests">Recent Requests</TabsTrigger>
        </TabsList>

        <TabsContent value="endpoints">
          <div className="overflow-hidden rounded-xl border border-slate-100 dark:border-slate-800">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-left text-xs text-slate-500 dark:bg-slate-900">
                <tr>
                  <th className="px-4 py-3">Endpoint</th>
                  <th className="px-4 py-3">Requests</th>
                  <th className="px-4 py-3">Avg</th>
                  <th className="px-4 py-3">Max</th>
                  <th className="px-4 py-3">5xx</th>
                </tr>
              </thead>
              <tbody>
                {(endpoints ?? []).map((e: any, i: number) => (
                  <tr key={i} className="border-t border-slate-100 dark:border-slate-800">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Badge tone={methodTone(e.method)}>{e.method}</Badge>
                        <span className="font-mono text-xs">/{e.endpoint}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">{e.requests}</td>
                    <td className="px-4 py-3">
                      <span className={Number(e.avg_ms) >= 1000 ? 'font-semibold text-red-600' : ''}>
                        {e.avg_ms} ms
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-500">{e.max_ms} ms</td>
                    <td className="px-4 py-3">
                      {Number(e.errors) > 0 ? <Badge tone="red">{e.errors}</Badge> : '—'}
                    </td>
                  </tr>
                ))}
                {(endpoints ?? []).length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-10 text-center text-slate-400">
                      No endpoint data yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </TabsContent>

        <TabsContent value="requests">
          <div className="mb-3">
            <Select value={filter} onChange={(e) => setFilter(e.target.value)} className="w-48">
              <option value="">All requests</option>
              <option value="failed">Failed (5xx)</option>
              <option value="client_error">Client errors (4xx)</option>
              <option value="slow">Slow (&gt;1s)</option>
            </Select>
          </div>
          <div className="overflow-hidden rounded-xl border border-slate-100 dark:border-slate-800">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-left text-xs text-slate-500 dark:bg-slate-900">
                <tr>
                  <th className="px-4 py-3">Time</th>
                  <th className="px-4 py-3">Request</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Duration</th>
                  <th className="px-4 py-3">User</th>
                  <th className="px-4 py-3">IP</th>
                </tr>
              </thead>
              <tbody>
                {requests.rows.map((r: any) => (
                  <tr key={r.id} className="border-t border-slate-100 dark:border-slate-800">
                    <td className="px-4 py-2.5 text-xs text-slate-400">{formatDateTime(r.created_at)}</td>
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-2">
                        <Badge tone={methodTone(r.method)}>{r.method}</Badge>
                        <span className="font-mono text-xs">/{r.endpoint}</span>
                      </div>
                    </td>
                    <td className="px-4 py-2.5">
                      <Badge tone={statusTone(r.status)}>{r.status}</Badge>
                    </td>
                    <td className="px-4 py-2.5">
                      <span className={r.duration_ms >= 1000 ? 'font-semibold text-red-600' : ''}>
                        {r.duration_ms} ms
                      </span>
                    </td>
                    <td className="px-4 py-2.5">{r.user_id ?? '—'}</td>
                    <td className="px-4 py-2.5 font-mono text-xs">{r.ip ?? '—'}</td>
                  </tr>
                ))}
                {requests.rows.length === 0 && !requests.loading && (
                  <tr>
                    <td colSpan={6} className="px-4 py-10 text-center text-slate-400">
                      No requests match this filter
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {requests.meta && requests.meta.last_page > 1 && (
            <div className="mt-3 flex justify-end gap-2">
              <button
                onClick={() => requests.setPage(Math.max(1, requests.page - 1))}
                disabled={requests.page <= 1}
                className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm disabled:opacity-40 dark:border-slate-700"
              >
                Prev
              </button>
              <button
                onClick={() => requests.setPage(requests.page + 1)}
                disabled={requests.page >= (requests.meta.last_page ?? 1)}
                className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm disabled:opacity-40 dark:border-slate-700"
              >
                Next
              </button>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
