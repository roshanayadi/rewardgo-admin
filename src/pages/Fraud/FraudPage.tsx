import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { ColumnDef } from '@tanstack/react-table'
import { toast } from 'sonner'
import { ShieldAlert, Ban, Globe, Activity, Smartphone, Users2, Trash2, Eye, ShieldCheck, Plus } from 'lucide-react'
import { fraudApi } from '@/api/services'
import { useResourceList } from '@/hooks/useResourceList'
import { DataTable } from '@/components/tables/DataTable'
import { PageHeader } from '@/components/common/PageHeader'
import { StatCard } from '@/components/common/StatCard'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { formatDateTime } from '@/lib/utils'

type Tone = 'green' | 'red' | 'yellow' | 'blue' | 'gray' | 'purple'

interface SuspiciousUser {
  id: number
  name: string
  email: string
  status: string
  risk_score: number
  fraud_events_count: number
  wallet?: { balance: number; total_earned: number } | null
}

interface Device {
  id: number
  fingerprint: string
  device_model: string | null
  os_version: string | null
  is_rooted: boolean
  is_emulator: boolean
  last_ip: string | null
  last_seen_at: string | null
  user?: { id: number; name: string; email: string; status: string; risk_score: number } | null
}

function riskTone(score: number): Tone {
  if (score >= 80) return 'red'
  if (score >= 40) return 'yellow'
  return 'green'
}

export default function FraudPage() {
  const queryClient = useQueryClient()
  const { data: stats } = useQuery({ queryKey: ['fraud-dashboard'], queryFn: fraudApi.dashboard })

  const suspicious = useResourceList<SuspiciousUser>('fraud-suspicious', (p) => fraudApi.suspicious(p))
  const devices = useResourceList<Device>('fraud-devices', (p) => fraudApi.devices(p))
  const { data: ipList } = useQuery({ queryKey: ['fraud-ips'], queryFn: fraudApi.ipList })

  const [detail, setDetail] = useState<any | null>(null)
  const [toClear, setToClear] = useState<SuspiciousUser | null>(null)
  const [newIp, setNewIp] = useState('')
  const [newReason, setNewReason] = useState('')

  const clearMutation = useMutation({
    mutationFn: (id: number) => fraudApi.clear(id),
    onSuccess: () => {
      toast.success('Fraud flags cleared')
      setToClear(null)
      suspicious.refetch()
      queryClient.invalidateQueries({ queryKey: ['fraud-dashboard'] })
    },
  })

  const ipAddMutation = useMutation({
    mutationFn: () => fraudApi.ipAdd(newIp.trim(), newReason.trim() || undefined),
    onSuccess: () => {
      toast.success('IP blacklisted')
      setNewIp('')
      setNewReason('')
      queryClient.invalidateQueries({ queryKey: ['fraud-ips'] })
      queryClient.invalidateQueries({ queryKey: ['fraud-dashboard'] })
    },
    onError: () => toast.error('Could not blacklist IP — check the format'),
  })

  const ipRemoveMutation = useMutation({
    mutationFn: (id: number) => fraudApi.ipRemove(id),
    onSuccess: () => {
      toast.success('IP removed')
      queryClient.invalidateQueries({ queryKey: ['fraud-ips'] })
      queryClient.invalidateQueries({ queryKey: ['fraud-dashboard'] })
    },
  })

  const openDetail = async (u: SuspiciousUser) => {
    const data = await fraudApi.events(u.id)
    setDetail(data)
  }

  const suspiciousCols = useMemo<ColumnDef<SuspiciousUser>[]>(
    () => [
      {
        header: 'User',
        cell: ({ row }) => (
          <div>
            <p className="text-sm font-medium">{row.original.name}</p>
            <p className="text-xs text-slate-400">{row.original.email}</p>
          </div>
        ),
      },
      {
        header: 'Risk',
        cell: ({ row }) => (
          <Badge tone={riskTone(row.original.risk_score)}>{row.original.risk_score}</Badge>
        ),
      },
      { header: 'Signals', cell: ({ row }) => row.original.fraud_events_count },
      {
        header: 'Status',
        cell: ({ row }) => (
          <Badge tone={row.original.status === 'banned' ? 'red' : 'blue'}>{row.original.status}</Badge>
        ),
      },
      { header: 'Balance', cell: ({ row }) => row.original.wallet?.balance ?? 0 },
      {
        header: 'Action',
        cell: ({ row }) => (
          <div className="flex gap-1">
            <button onClick={() => openDetail(row.original)} className="rounded-md p-1.5 text-blue-600 hover:bg-blue-50" title="View signals">
              <Eye className="h-4 w-4" />
            </button>
            <button onClick={() => setToClear(row.original)} className="rounded-md p-1.5 text-emerald-600 hover:bg-emerald-50" title="Clear flags">
              <ShieldCheck className="h-4 w-4" />
            </button>
          </div>
        ),
      },
    ],
    [],
  )

  const deviceCols = useMemo<ColumnDef<Device>[]>(
    () => [
      {
        header: 'Fingerprint',
        cell: ({ row }) => (
          <span className="font-mono text-xs">{row.original.fingerprint.slice(0, 16)}…</span>
        ),
      },
      {
        header: 'User',
        cell: ({ row }) =>
          row.original.user ? (
            <div>
              <p className="text-sm">{row.original.user.name}</p>
              <p className="text-xs text-slate-400">{row.original.user.email}</p>
            </div>
          ) : (
            '—'
          ),
      },
      { header: 'Model', cell: ({ row }) => row.original.device_model ?? '—' },
      {
        header: 'Flags',
        cell: ({ row }) => (
          <div className="flex gap-1">
            {row.original.is_emulator && <Badge tone="red">Emulator</Badge>}
            {row.original.is_rooted && <Badge tone="yellow">Rooted</Badge>}
            {!row.original.is_emulator && !row.original.is_rooted && <Badge tone="green">Clean</Badge>}
          </div>
        ),
      },
      { header: 'IP', cell: ({ row }) => <span className="font-mono text-xs">{row.original.last_ip ?? '—'}</span> },
      { header: 'Last Seen', cell: ({ row }) => formatDateTime(row.original.last_seen_at) },
    ],
    [],
  )

  return (
    <div>
      <PageHeader title="Fraud Detection" subtitle="Risk scores, device fingerprints, and IP blacklist" />

      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-6">
        <StatCard label="Flagged Users" value={stats?.flagged_users ?? 0} icon={ShieldAlert} />
        <StatCard label="Banned" value={stats?.banned_users ?? 0} icon={Ban} />
        <StatCard label="Blacklisted IPs" value={stats?.blacklisted_ips ?? 0} icon={Globe} />
        <StatCard label="Events (7d)" value={stats?.events_7d ?? 0} icon={Activity} />
        <StatCard label="Emulators" value={stats?.emulator_devices ?? 0} icon={Smartphone} />
        <StatCard label="Shared Devices" value={stats?.shared_devices ?? 0} icon={Users2} />
      </div>

      <Tabs defaultValue="suspicious">
        <TabsList className="mb-5">
          <TabsTrigger value="suspicious">Review Queue</TabsTrigger>
          <TabsTrigger value="devices">Device Lookup</TabsTrigger>
          <TabsTrigger value="ips">IP Blacklist</TabsTrigger>
        </TabsList>

        <TabsContent value="suspicious">
          <DataTable
            columns={suspiciousCols}
            data={suspicious.rows}
            loading={suspicious.loading}
            meta={suspicious.meta}
            onPageChange={suspicious.setPage}
            search={suspicious.search}
            onSearchChange={suspicious.onSearchChange}
            searchPlaceholder="Search flagged users"
            exportName="suspicious-users"
            exportRows={() =>
              suspicious.rows.map((u) => ({
                name: u.name,
                email: u.email,
                risk_score: u.risk_score,
                signals: u.fraud_events_count,
                status: u.status,
              }))
            }
          />
        </TabsContent>

        <TabsContent value="devices">
          <div className="mb-3 flex gap-3">
            <Input
              placeholder="Filter by fingerprint"
              value={(devices.filters.fingerprint as string) ?? ''}
              onChange={(e) => devices.setFilter('fingerprint', e.target.value)}
              className="w-64"
            />
            <Input
              placeholder="Filter by IP"
              value={(devices.filters.ip as string) ?? ''}
              onChange={(e) => devices.setFilter('ip', e.target.value)}
              className="w-48"
            />
          </div>
          <DataTable
            columns={deviceCols}
            data={devices.rows}
            loading={devices.loading}
            meta={devices.meta}
            onPageChange={devices.setPage}
          />
        </TabsContent>

        <TabsContent value="ips">
          <div className="mb-4 flex flex-wrap items-end gap-3">
            <div>
              <p className="mb-1 text-xs font-medium text-slate-500">IP Address</p>
              <Input placeholder="1.2.3.4" value={newIp} onChange={(e) => setNewIp(e.target.value)} className="w-48" />
            </div>
            <div>
              <p className="mb-1 text-xs font-medium text-slate-500">Reason (optional)</p>
              <Input placeholder="VPN exit node" value={newReason} onChange={(e) => setNewReason(e.target.value)} className="w-64" />
            </div>
            <Button onClick={() => ipAddMutation.mutate()} disabled={!newIp.trim()} loading={ipAddMutation.isPending}>
              <Plus className="h-4 w-4" /> Blacklist
            </Button>
          </div>

          <div className="overflow-hidden rounded-xl border border-slate-100 dark:border-slate-800">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-left text-xs text-slate-500 dark:bg-slate-900">
                <tr>
                  <th className="px-4 py-3">IP</th>
                  <th className="px-4 py-3">Reason</th>
                  <th className="px-4 py-3">Added</th>
                  <th className="px-4 py-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {(ipList ?? []).map((entry: any) => (
                  <tr key={entry.id} className="border-t border-slate-100 dark:border-slate-800">
                    <td className="px-4 py-3 font-mono text-xs">{entry.ip}</td>
                    <td className="px-4 py-3">{entry.reason ?? '—'}</td>
                    <td className="px-4 py-3 text-xs text-slate-400">{formatDateTime(entry.created_at)}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => ipRemoveMutation.mutate(entry.id)}
                        className="rounded-md p-1.5 text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
                {(ipList ?? []).length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-slate-400">
                      No blacklisted IPs
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </TabsContent>
      </Tabs>

      {/* User signal detail */}
      {detail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setDetail(null)}>
          <div
            className="max-h-[80vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 dark:bg-slate-900"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">{detail.user.name}</h3>
                <p className="text-sm text-slate-400">{detail.user.email}</p>
              </div>
              <Badge tone={riskTone(detail.user.risk_score)}>Risk {detail.user.risk_score}</Badge>
            </div>

            <p className="mb-2 text-sm font-semibold">Signals</p>
            <div className="mb-4 space-y-2">
              {detail.events.map((ev: any) => (
                <div key={ev.id} className="rounded-lg border border-slate-100 p-3 dark:border-slate-800">
                  <div className="flex items-center justify-between">
                    <Badge tone="red">{ev.type}</Badge>
                    <span className="text-xs text-slate-400">weight {ev.weight}</span>
                  </div>
                  <p className="mt-1 text-sm">{ev.description}</p>
                </div>
              ))}
              {detail.events.length === 0 && <p className="text-sm text-slate-400">No signals.</p>}
            </div>

            <p className="mb-2 text-sm font-semibold">Devices</p>
            <div className="space-y-2">
              {detail.devices.map((d: any) => (
                <div key={d.id} className="flex items-center justify-between rounded-lg border border-slate-100 p-3 text-sm dark:border-slate-800">
                  <span className="font-mono text-xs">{d.fingerprint.slice(0, 20)}…</span>
                  <span>{d.device_model ?? '—'}</span>
                  <span className="font-mono text-xs">{d.last_ip ?? '—'}</span>
                  <div className="flex gap-1">
                    {d.is_emulator && <Badge tone="red">EMU</Badge>}
                    {d.is_rooted && <Badge tone="yellow">ROOT</Badge>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={!!toClear}
        onOpenChange={(v) => !v && setToClear(null)}
        title="Clear fraud flags?"
        description={`All signals for "${toClear?.name}" will be dismissed and their risk score reset to 0.`}
        onConfirm={() => toClear && clearMutation.mutate(toClear.id)}
        loading={clearMutation.isPending}
      />
    </div>
  )
}
