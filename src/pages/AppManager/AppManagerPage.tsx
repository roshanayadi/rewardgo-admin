import { useEffect, useState } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  Save,
  UserPlus,
  LogIn,
  ListChecks,
  LayoutGrid,
  Gift,
  Banknote,
  Users2,
  CalendarCheck,
  Megaphone,
  type LucideIcon,
} from 'lucide-react'
import { settingsApi } from '@/api/services'
import { PageHeader } from '@/components/common/PageHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Switch } from '@/components/ui/Switch'
import { Button } from '@/components/ui/Button'
import type { Setting } from '@/types'

interface CatalogItem {
  key: string
  label: string
  description: string
  icon: LucideIcon
}

const FEATURES: CatalogItem[] = [
  { key: 'registration_enabled', label: 'User Registration', description: 'Allow new users to sign up', icon: UserPlus },
  { key: 'google_login_enabled', label: 'Google Login', description: 'Enable sign-in with Google', icon: LogIn },
  { key: 'tasks_enabled', label: 'Tasks', description: 'Show and allow completing tasks', icon: ListChecks },
  { key: 'offerwalls_enabled', label: 'Offerwalls', description: 'Enable third-party offerwalls', icon: LayoutGrid },
  { key: 'rewards_enabled', label: 'Rewards Store', description: 'Allow users to redeem rewards', icon: Gift },
  { key: 'withdrawals_enabled', label: 'Withdrawals', description: 'Allow users to request payouts', icon: Banknote },
  { key: 'referral_enabled', label: 'Referral System', description: 'Enable referral rewards', icon: Users2 },
  { key: 'daily_checkin_enabled', label: 'Daily Check-in', description: 'Daily reward for opening the app', icon: CalendarCheck },
  { key: 'ads_enabled', label: 'Advertisements', description: 'Show ads inside the app', icon: Megaphone },
]

export default function AppManagerPage() {
  const { data, isLoading } = useQuery({ queryKey: ['settings'], queryFn: settingsApi.all })
  const [values, setValues] = useState<Record<string, unknown>>({})

  useEffect(() => {
    if (!data) return
    const flat: Record<string, unknown> = {}
    Object.values(data)
      .flat()
      .forEach((s: Setting) => (flat[s.key] = s.value))
    setValues(flat)
  }, [data])

  const mutation = useMutation({
    mutationFn: () => {
      const settings = FEATURES.filter((f) => f.key in values).map((f) => ({ key: f.key, value: values[f.key] }))
      return settingsApi.update(settings)
    },
    onSuccess: () => toast.success('Features saved'),
  })

  const set = (key: string, value: unknown) => setValues((v) => ({ ...v, [key]: value }))

  if (isLoading) return <p className="text-sm text-slate-400">Loading configuration…</p>

  const enabledCount = FEATURES.filter((f) => !!values[f.key]).length

  return (
    <div>
      <PageHeader
        title="App Manager"
        subtitle="Turn app features on or off"
        actions={
          <Button loading={mutation.isPending} onClick={() => mutation.mutate()}>
            <Save className="h-4 w-4" /> Save Changes
          </Button>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>Features</CardTitle>
          <span className="text-xs font-medium text-slate-400">
            {enabledCount}/{FEATURES.length} enabled
          </span>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-x-8 gap-y-1 sm:grid-cols-2">
            {FEATURES.map((f) => {
              const on = !!values[f.key]
              return (
                <div
                  key={f.key}
                  className="flex items-center justify-between gap-4 border-b border-slate-100 py-3.5 last:border-0 dark:border-slate-800"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-9 w-9 items-center justify-center rounded-lg ${
                        on ? 'bg-primary-50 text-primary dark:bg-primary/10' : 'bg-slate-100 text-slate-400 dark:bg-slate-800'
                      }`}
                    >
                      <f.icon className="h-[18px] w-[18px]" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{f.label}</p>
                      <p className="text-xs text-slate-400">{f.description}</p>
                    </div>
                  </div>
                  <Switch checked={on} onCheckedChange={(c) => set(f.key, c)} />
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
