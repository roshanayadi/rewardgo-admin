import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Server, Database, Zap, RefreshCw, Trash2, Construction, Clock, HardDriveDownload } from 'lucide-react'
import { systemApi, systemToolsApi } from '@/api/services'
import { PageHeader } from '@/components/common/PageHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge, StatusBadge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Switch } from '@/components/ui/Switch'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { formatNumber, formatDateTime } from '@/lib/utils'

export default function SystemPage() {
  const queryClient = useQueryClient()
  const health = useQuery({ queryKey: ['system', 'health'], queryFn: systemApi.health, refetchInterval: 30000 })
  const stats = useQuery({ queryKey: ['system', 'stats'], queryFn: systemApi.statistics })
  const logs = useQuery({ queryKey: ['system', 'logs'], queryFn: () => systemApi.logs(80) })
  const status = useQuery({ queryKey: ['system', 'status'], queryFn: systemToolsApi.status, refetchInterval: 30000 })

  const [confirmMaintenance, setConfirmMaintenance] = useState(false)

  const cacheMutation = useMutation({
    mutationFn: systemToolsApi.clearCache,
    onSuccess: () => toast.success('All caches cleared'),
    onError: () => toast.error('Cache clear failed (super-admin only)'),
  })

  const maintenanceMutation = useMutation({
    mutationFn: (enabled: boolean) => systemToolsApi.maintenance(enabled),
    onSuccess: () => {
      setConfirmMaintenance(false)
      queryClient.invalidateQueries({ queryKey: ['system', 'status'] })
      toast.success('Maintenance mode updated')
    },
    onError: () => toast.error('Failed (super-admin only)'),
  })

  const inMaintenance = !!status.data?.maintenance

  return (
    <div>
      <PageHeader
        title="System"
        subtitle="Health, statistics, tools & logs"
        actions={
          <Button variant="secondary" onClick={() => { health.refetch(); logs.refetch(); status.refetch() }}>
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

      {/* Tools */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>System Tools</CardTitle>
          <Badge tone="gray">super-admin</Badge>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            {/* Maintenance mode */}
            <div className="flex items-center justify-between rounded-xl border border-slate-100 p-4 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${inMaintenance ? 'bg-red-50 text-red-600' : 'bg-slate-50 text-slate-500'}`}>
                  <Construction className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-medium">Maintenance Mode</p>
                  <p className="text-xs text-slate-400">
                    {inMaintenance ? 'App is OFFLINE for users' : 'App is live'}
                  </p>
                </div>
              </div>
              <Switch
                checked={inMaintenance}
                onCheckedChange={(v) => (v ? setConfirmMaintenance(true) : maintenanceMutation.mutate(false))}
              />
            </div>

            {/* Cache manager */}
            <div className="flex items-center justify-between rounded-xl border border-slate-100 p-4 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
                  <Trash2 className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-medium">Cache Manager</p>
                  <p className="text-xs text-slate-400">
                    Driver: {status.data?.cache_driver ?? '—'}
                  </p>
                </div>
              </div>
              <Button size="sm" variant="secondary" onClick={() => cacheMutation.mutate()} loading={cacheMutation.isPending}>
                Clear All
              </Button>
            </div>

            {/* Cron status */}
            <div className="flex items-center justify-between rounded-xl border border-slate-100 p-4 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${status.data?.cron_healthy ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                  <Clock className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-medium">Cron Scheduler</p>
                  <p className="text-xs text-slate-400">
                    {status.data?.cron_last_run
                      ? `Last run ${formatDateTime(status.data.cron_last_run)}`
                      : 'Never ran — add schedule:run to cron'}
                  </p>
                </div>
              </div>
              <Badge tone={status.data?.cron_healthy ? 'green' : 'red'}>
                {status.data?.cron_healthy ? 'Healthy' : 'Stale'}
              </Badge>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-4 text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <HardDriveDownload className="h-3.5 w-3.5" />
              Last backup: {status.data?.last_backup_at ? formatDateTime(status.data.last_backup_at) : 'never'}
            </span>
            <span>Queue: {status.data?.queue_driver ?? '—'}</span>
            <span>API logs: {formatNumber(status.data?.api_logs_count ?? 0)} rows</span>
          </div>
        </CardContent>
      </Card>

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

      <ConfirmDialog
        open={confirmMaintenance}
        onOpenChange={setConfirmMaintenance}
        title="Enable maintenance mode?"
        description="The app and API will return 503 for ALL users until you switch it back off. The admin panel keeps working."
        onConfirm={() => maintenanceMutation.mutate(true)}
        loading={maintenanceMutation.isPending}
      />
    </div>
  )
}
