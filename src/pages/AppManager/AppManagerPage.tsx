import { useEffect, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
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
  UserCog,
  KeyRound,
  Wallet,
  Trophy,
  Bell,
  Gamepad2,
  Image,
  Disc3,
  Ticket,
  ToggleLeft,
  type LucideIcon,
} from 'lucide-react'
import { settingsApi } from '@/api/services'
import { PageHeader } from '@/components/common/PageHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs'
import { Switch } from '@/components/ui/Switch'
import { Badge } from '@/components/ui/Badge'
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

interface FunctionGroup {
  title: string
  items: CatalogItem[]
}

/**
 * Per-function kill switches. Each key maps to a `fn_*` setting enforced by
 * the API's `fn:` middleware — turning one OFF makes the endpoints return
 * 503 immediately; no deploy needed.
 */
const FUNCTION_GROUPS: FunctionGroup[] = [
  {
    title: 'Account',
    items: [
      { key: 'fn_register', label: 'Registration', description: 'POST /auth/register — new account creation', icon: UserPlus },
      { key: 'fn_google_login', label: 'Google Login', description: 'POST /auth/google/login — Google sign-in', icon: LogIn },
      { key: 'fn_profile_update', label: 'Profile Update', description: 'PUT /auth/profile — edit name, phone, avatar', icon: UserCog },
      { key: 'fn_change_password', label: 'Change Password', description: 'PUT /auth/change-password', icon: KeyRound },
    ],
  },
  {
    title: 'Earning',
    items: [
      { key: 'fn_tasks', label: 'Tasks', description: 'Browse & complete tasks for coins', icon: ListChecks },
      { key: 'fn_offerwalls', label: 'Offerwalls', description: 'Third-party offer providers', icon: LayoutGrid },
      { key: 'fn_games', label: 'Games', description: 'Play games & claim rewards', icon: Gamepad2 },
      { key: 'fn_ads', label: 'Advertisements', description: 'Ad feed, impressions & clicks', icon: Megaphone },
      { key: 'fn_referrals', label: 'Referrals', description: 'Apply referral codes & referral stats', icon: Users2 },
      { key: 'fn_checkin', label: 'Daily Check-in', description: 'Daily streak rewards (7-day cycle)', icon: CalendarCheck },
      { key: 'fn_spin', label: 'Spin & Win', description: 'Prize wheel — daily free spins', icon: Disc3 },
      { key: 'fn_promo', label: 'Promo Codes', description: 'POST /promo/redeem — code redemption', icon: Ticket },
      { key: 'fn_scratch', label: 'Scratch Card', description: 'Daily scratch-to-win cards', icon: Gift },
    ],
  },
  {
    title: 'Money',
    items: [
      { key: 'fn_wallet', label: 'Wallet', description: 'Balance & transaction history', icon: Wallet },
      { key: 'fn_rewards', label: 'Rewards Store', description: 'Redeem coins for rewards', icon: Gift },
      { key: 'fn_withdrawals', label: 'Withdrawals', description: 'Request & cancel payouts', icon: Banknote },
    ],
  },
  {
    title: 'Engagement',
    items: [
      { key: 'fn_leaderboard', label: 'Leaderboard', description: 'Top earners ranking', icon: Trophy },
      { key: 'fn_notifications', label: 'Notifications', description: 'In-app notification feed', icon: Bell },
      { key: 'fn_banners', label: 'Banners', description: 'Promotional banners in the app', icon: Image },
    ],
  },
]

const ALL_FUNCTIONS = FUNCTION_GROUPS.flatMap((g) => g.items)

/** Settings arrive as raw strings — treat '1'/'true' as on, missing as on. */
function asBool(value: unknown): boolean {
  if (value === undefined || value === null) return true
  if (typeof value === 'boolean') return value
  return value === '1' || value === 1 || value === 'true'
}

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
      <PageHeader title="App Manager" subtitle="Control app features and functions" />

      <Tabs defaultValue="features">
        <TabsList>
          <TabsTrigger value="features">Features</TabsTrigger>
          <TabsTrigger value="functions">Function Manager</TabsTrigger>
        </TabsList>

        {/* ── Features (bulk save) ─────────────────────────────────────── */}
        <TabsContent value="features">
          <Card>
            <CardHeader>
              <CardTitle>Features</CardTitle>
              <div className="flex items-center gap-3">
                <span className="text-xs font-medium text-slate-400">
                  {enabledCount}/{FEATURES.length} enabled
                </span>
                <Button size="sm" loading={mutation.isPending} onClick={() => mutation.mutate()}>
                  <Save className="h-4 w-4" /> Save Changes
                </Button>
              </div>
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
        </TabsContent>

        {/* ── Function Manager (instant per-toggle save) ───────────────── */}
        <TabsContent value="functions">
          <FunctionManager values={values} onLocalChange={set} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

function FunctionManager({
  values,
  onLocalChange,
}: {
  values: Record<string, unknown>
  onLocalChange: (key: string, value: unknown) => void
}) {
  const queryClient = useQueryClient()
  const [saving, setSaving] = useState<string | null>(null)

  const toggle = useMutation({
    mutationFn: ({ key, value }: { key: string; value: boolean }) =>
      settingsApi.update([{ key, value: value ? '1' : '0' }]),
    onMutate: ({ key, value }) => {
      setSaving(key)
      onLocalChange(key, value ? '1' : '0')
    },
    onSuccess: (_res, { key, value }) => {
      const item = ALL_FUNCTIONS.find((f) => f.key === key)
      toast.success(`${item?.label ?? key} turned ${value ? 'ON' : 'OFF'}`)
      queryClient.invalidateQueries({ queryKey: ['settings'] })
    },
    onError: (_err, { key, value }) => {
      // Roll the optimistic flip back.
      onLocalChange(key, value ? '0' : '1')
      toast.error('Could not save — try again')
    },
    onSettled: () => setSaving(null),
  })

  const enabledCount = ALL_FUNCTIONS.filter((f) => asBool(values[f.key])).length

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-50 text-primary dark:bg-primary/10">
            <ToggleLeft className="h-[18px] w-[18px]" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-700 dark:text-slate-200">API Function Switches</p>
            <p className="text-xs text-slate-400">
              Changes apply instantly — a disabled function returns "currently unavailable" to the app.
            </p>
          </div>
        </div>
        <Badge tone={enabledCount === ALL_FUNCTIONS.length ? 'green' : 'yellow'}>
          {enabledCount}/{ALL_FUNCTIONS.length} active
        </Badge>
      </div>

      {FUNCTION_GROUPS.map((group) => (
        <Card key={group.title}>
          <CardHeader>
            <CardTitle>{group.title}</CardTitle>
            <span className="text-xs font-medium text-slate-400">
              {group.items.filter((f) => asBool(values[f.key])).length}/{group.items.length} on
            </span>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-x-8 gap-y-1 sm:grid-cols-2">
              {group.items.map((f) => {
                const on = asBool(values[f.key])
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
                        <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                          {f.label}
                          {!on && (
                            <span className="ml-2 rounded bg-red-50 px-1.5 py-0.5 text-[10px] font-semibold text-red-500 dark:bg-red-500/10">
                              OFF
                            </span>
                          )}
                        </p>
                        <p className="text-xs text-slate-400">{f.description}</p>
                      </div>
                    </div>
                    <Switch
                      checked={on}
                      disabled={saving === f.key}
                      onCheckedChange={(c) => toggle.mutate({ key: f.key, value: c })}
                    />
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
