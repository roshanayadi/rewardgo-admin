import { useQuery } from '@tanstack/react-query'
import { Server, Database, Zap, RefreshCw } from 'lucide-react'
import { systemApi } from '@/api/services'
import { PageHeader } from '@/components/common/PageHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge, StatusBadge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { formatNumber } from '@/lib/utils'

export default function SystemPage() {
  const health = useQuery({ queryKey: ['system', 'health'], queryFn: systemApi.health, refetchInterval: 30000 })
  const stats = useQuery({ queryKey: ['system', 'stats'], queryFn: systemApi.statistics })
  const logs = useQuery({ queryKey: ['system', 'logs'], queryFn: () => systemApi.logs(80) })

  return (
    <div>
      <PageHeader
        title="System"
        subtitle="Health, statistics & logs"
        actions={
          <Button variant="secondary" onClick={() => { health.refetch(); logs.refetch() }}>
            <RefreshCw className="h-4 w-4" /> Refresh
          </Button>
        }
      />

      {/* Health */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-4 pt-5">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
              <Database className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Database</p>
              <StatusBadge status={health.data?.components?.database?.status} />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 pt-5">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
              <Zap className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Cache / Redis</p>
              <StatusBadge status={health.data?.components?.cache?.status} />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 pt-5">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary-50 text-primary">
              <Server className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Runtime</p>
              <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                PHP {health.data?.php_version} · Laravel {health.data?.laravel_version}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Stats */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {Object.entries(stats.data ?? {}).map(([k, v]) => (
              <div key={k} className="rounded-lg bg-slate-50 p-4 text-center dark:bg-slate-800">
                <p className="text-xl font-bold text-slate-800 dark:text-slate-100">{formatNumber(v)}</p>
                <p className="mt-1 text-xs capitalize text-slate-500">{k.replace(/_/g, ' ')}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Logs */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Recent Logs</CardTitle>
          <Badge tone="gray">last 80 lines</Badge>
        </CardHeader>
        <CardContent>
          <pre className="max-h-96 overflow-auto rounded-lg bg-slate-900 p-4 text-xs leading-relaxed text-slate-300">
            {logs.data?.lines?.length ? logs.data.lines.join('\n') : 'No log entries.'}
          </pre>
        </CardContent>
      </Card>
    </div>
  )
}
