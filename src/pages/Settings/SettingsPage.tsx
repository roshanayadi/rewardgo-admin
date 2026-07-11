import { useEffect, useState } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Save } from 'lucide-react'
import { settingsApi } from '@/api/services'
import { PageHeader } from '@/components/common/PageHeader'
import { Card, CardContent } from '@/components/ui/Card'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs'
import { Input, Label } from '@/components/ui/Input'
import { Switch } from '@/components/ui/Switch'
import { Button } from '@/components/ui/Button'
import { EmailSettingsTab } from './EmailSettingsTab'
import type { Setting } from '@/types'

// Hidden from the dynamic tabs: features/coins live in App Manager,
// withdrawal rules per-method in Withdrawal Methods, admob in the Ads page,
// email in its own dedicated tab below.
const HIDDEN_GROUPS = ['features', 'coins', 'withdrawal', 'admob', 'email']

export default function SettingsPage() {
  const { data, isLoading } = useQuery({ queryKey: ['settings'], queryFn: settingsApi.all })
  const [values, setValues] = useState<Record<string, unknown>>({})

  useEffect(() => {
    if (!data) return
    const flat: Record<string, unknown> = {}
    Object.values(data).flat().forEach((s: Setting) => (flat[s.key] = s.value))
    setValues(flat)
  }, [data])

  const groups = data ? Object.keys(data).filter((g) => !HIDDEN_GROUPS.includes(g)) : []

  const mutation = useMutation({
    mutationFn: () => {
      // Only persist keys from the groups shown on this page.
      const visibleKeys = new Set(groups.flatMap((g) => (data?.[g] ?? []).map((s) => s.key)))
      const settings = Object.entries(values)
        .filter(([key]) => visibleKeys.has(key))
        .map(([key, value]) => ({ key, value }))
      return settingsApi.update(settings)
    },
    onSuccess: () => toast.success('Settings saved'),
  })

  const coinsPerUsd = Number(values.coins_per_usd) || 10000
  const usdToNpr = Number(values.usd_to_npr) || 133

  if (isLoading) return <p className="text-sm text-slate-400">Loading settings…</p>

  return (
    <div>
      <PageHeader title="Settings" subtitle="Configure the platform" />

      <Card>
        <CardContent className="pt-5">
          <Tabs defaultValue={groups[0] ?? 'email'}>
            <TabsList>
              {groups.map((g) => (
                <TabsTrigger key={g} value={g} className="capitalize">
                  {g}
                </TabsTrigger>
              ))}
              <TabsTrigger value="email">Email</TabsTrigger>
            </TabsList>

            {groups.map((g) => (
              <TabsContent key={g} value={g}>
                {g === 'currency' && (
                  <div className="mb-5 rounded-xl border border-primary/20 bg-primary-50/50 p-4 dark:bg-primary/5">
                    <p className="text-xs font-semibold uppercase tracking-wide text-primary">Conversion Preview</p>
                    <div className="mt-2 flex flex-wrap items-center gap-2 text-lg font-bold text-slate-800 dark:text-slate-100">
                      <span>{coinsPerUsd.toLocaleString()} coins</span>
                      <span className="text-slate-400">=</span>
                      <span>$1.00</span>
                      <span className="text-slate-400">=</span>
                      <span>रू {usdToNpr.toLocaleString()}</span>
                    </div>
                    <p className="mt-1 text-xs text-slate-500">
                      1 coin = {(1 / coinsPerUsd).toFixed(6)} USD = रू {(usdToNpr / coinsPerUsd).toFixed(5)}
                    </p>
                  </div>
                )}
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  {(data?.[g] ?? []).map((s: Setting) => (
                    <div key={s.key}>
                      <Label className="capitalize">{s.key.replace(/_/g, ' ')}</Label>
                      {s.type === 'boolean' ? (
                        <div className="flex h-10 items-center">
                          <Switch
                            checked={!!values[s.key]}
                            onCheckedChange={(c) => setValues((v) => ({ ...v, [s.key]: c }))}
                          />
                        </div>
                      ) : (
                        <Input
                          type={s.type === 'integer' || s.type === 'float' ? 'number' : 'text'}
                          value={String(values[s.key] ?? '')}
                          onChange={(e) => setValues((v) => ({ ...v, [s.key]: e.target.value }))}
                        />
                      )}
                    </div>
                  ))}
                </div>
                <div className="mt-6 flex justify-end">
                  <Button loading={mutation.isPending} onClick={() => mutation.mutate()}>
                    <Save className="h-4 w-4" /> Save Changes
                  </Button>
                </div>
              </TabsContent>
            ))}

            <TabsContent value="email">
              <EmailSettingsTab />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
