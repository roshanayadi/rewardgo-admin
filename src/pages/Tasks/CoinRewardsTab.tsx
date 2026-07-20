import { useEffect, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  Save,
  UserPlus,
  CalendarCheck,
  Megaphone,
  Disc3,
  Gift,
  Users2,
  Trophy,
  type LucideIcon,
} from 'lucide-react'
import { settingsApi } from '@/api/services'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import type { Setting } from '@/types'

interface CoinItem {
  key: string
  label: string
  description: string
  icon: LucideIcon
}

const COINS: CoinItem[] = [
  { key: 'signup_bonus', label: 'Signup Bonus', description: 'Coins granted on registration', icon: UserPlus },
  { key: 'watch_ad_coins', label: 'Watch Ad / Video', description: 'Coins per rewarded ad view', icon: Megaphone },
  { key: 'referral_signup_coins', label: 'Referral Signup', description: 'Coins when a referral joins', icon: Users2 },
  { key: 'referral_bonus', label: 'Referral Bonus', description: 'Bonus coins per referral', icon: Users2 },
]

const CHECKIN_DAYS = [1, 2, 3, 4, 5, 6, 7]
// Mirrors DailyCheckinService::DEFAULT_REWARDS — shown until the admin saves custom values.
const CHECKIN_DEFAULTS: Record<number, number> = { 1: 50, 2: 60, 3: 70, 4: 80, 5: 90, 6: 100, 7: 150 }
const checkinKey = (day: number) => `checkin_day_${day}`

const SCRATCH_TIERS = [1, 2, 3, 4, 5, 6]
// Mirrors ScratchCardService::DEFAULT_TIERS.
const SCRATCH_DEFAULTS: Record<number, number> = { 1: 0, 2: 5, 3: 10, 4: 25, 5: 50, 6: 200 }
const scratchKey = (tier: number) => `scratch_tier_${tier}`

const SPIN_SEGMENTS = [1, 2, 3, 4, 5, 6, 7, 8]
// Mirrors SpinService::DEFAULT_SEGMENTS.
const SPIN_DEFAULTS: Record<number, number> = { 1: 5, 2: 10, 3: 15, 4: 20, 5: 25, 6: 50, 7: 0, 8: 100 }
const spinKey = (segment: number) => `spin_segment_${segment}`

export function CoinRewardsTab() {
  const queryClient = useQueryClient()
  const { data, isLoading } = useQuery({ queryKey: ['settings'], queryFn: settingsApi.all })
  const [values, setValues] = useState<Record<string, unknown>>({})

  useEffect(() => {
    if (!data) return
    const flat: Record<string, unknown> = {}
    Object.values(data).flat().forEach((s: Setting) => (flat[s.key] = s.value))
    // Show the backend's built-in fallbacks until the admin saves custom values.
    CHECKIN_DAYS.forEach((d) => {
      if (!(checkinKey(d) in flat)) flat[checkinKey(d)] = CHECKIN_DEFAULTS[d]
    })
    SPIN_SEGMENTS.forEach((n) => {
      if (!(spinKey(n) in flat)) flat[spinKey(n)] = SPIN_DEFAULTS[n]
    })
    if (!('spin_daily_limit' in flat)) flat['spin_daily_limit'] = 5
    SCRATCH_TIERS.forEach((n) => {
      if (!(scratchKey(n) in flat)) flat[scratchKey(n)] = SCRATCH_DEFAULTS[n]
    })
    if (!('scratch_daily_limit' in flat)) flat['scratch_daily_limit'] = 3
    setValues(flat)
  }, [data])

  const mutation = useMutation({
    mutationFn: () => {
      const keys = [
        ...COINS.map((c) => c.key),
        ...CHECKIN_DAYS.map(checkinKey),
        ...SPIN_SEGMENTS.map(spinKey),
        'spin_daily_limit',
        ...SCRATCH_TIERS.map(scratchKey),
        'scratch_daily_limit',
      ]
      const settings = keys.filter((k) => k in values).map((k) => ({ key: k, value: values[k] }))
      return settingsApi.update(settings)
    },
    onSuccess: () => {
      toast.success('Coin rewards saved')
      queryClient.invalidateQueries({ queryKey: ['settings'] })
    },
  })

  const set = (key: string, value: unknown) => setValues((v) => ({ ...v, [key]: value }))

  if (isLoading) return <p className="text-sm text-slate-400">Loading coin rewards…</p>

  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Coin Rewards</CardTitle>
          <p className="mt-0.5 text-xs text-slate-400">How many coins users earn for each action</p>
        </div>
        <Button loading={mutation.isPending} onClick={() => mutation.mutate()}>
          <Save className="h-4 w-4" /> Save
        </Button>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {COINS.map((c) => (
            <div key={c.key} className="rounded-xl border border-slate-100 p-4 dark:border-slate-800">
              <div className="mb-3 flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-50 text-primary dark:bg-primary/10">
                  <c.icon className="h-[18px] w-[18px]" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{c.label}</p>
                  <p className="text-[11px] text-slate-400">{c.description}</p>
                </div>
              </div>
              <div className="relative">
                <Input
                  type="number"
                  step="any"
                  value={String(values[c.key] ?? '')}
                  onChange={(e) => set(c.key, e.target.value)}
                  className="pr-14"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-400">
                  {c.key.includes('percent') ? '%' : 'coins'}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-7">
          <div className="mb-4 flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-50 text-primary dark:bg-primary/10">
              <CalendarCheck className="h-[18px] w-[18px]" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-700 dark:text-slate-200">Daily Check-in (7-Day Streak)</p>
              <p className="text-[11px] text-slate-400">Coins per day; streak resets to Day 1 if missed, cycles after Day 7</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {CHECKIN_DAYS.map((day) => (
              <div key={day} className="rounded-xl border border-slate-100 p-4 dark:border-slate-800">
                <div className="mb-2.5 flex items-center gap-1.5">
                  {day === 7 && <Trophy className="h-4 w-4 text-amber-500" />}
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-300">Day {day}</p>
                </div>
                <div className="relative">
                  <Input
                    type="number"
                    step="any"
                    min="0"
                    value={String(values[checkinKey(day)] ?? '')}
                    onChange={(e) => set(checkinKey(day), e.target.value)}
                    className="pr-14"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-400">coins</span>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-7">
          <div className="mb-4 flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-50 text-primary dark:bg-primary/10">
              <Disc3 className="h-[18px] w-[18px]" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-700 dark:text-slate-200">Spin &amp; Win (8 Segments)</p>
              <p className="text-[11px] text-slate-400">Coins per wheel segment; 0 = "better luck next time"</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {SPIN_SEGMENTS.map((n) => (
              <div key={n} className="rounded-xl border border-slate-100 p-4 dark:border-slate-800">
                <div className="mb-2.5 flex items-center gap-1.5">
                  {n === 8 && <Trophy className="h-4 w-4 text-amber-500" />}
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-300">Segment {n}</p>
                </div>
                <div className="relative">
                  <Input
                    type="number"
                    step="any"
                    min="0"
                    value={String(values[spinKey(n)] ?? '')}
                    onChange={(e) => set(spinKey(n), e.target.value)}
                    className="pr-14"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-400">coins</span>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 max-w-[260px]">
            <p className="mb-2 text-sm font-medium text-slate-600 dark:text-slate-300">Free spins per day</p>
            <div className="relative">
              <Input
                type="number"
                step="1"
                min="1"
                value={String(values['spin_daily_limit'] ?? '')}
                onChange={(e) => set('spin_daily_limit', e.target.value)}
                className="pr-14"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-400">spins</span>
            </div>
          </div>
        </div>

        <div className="mt-7">
          <div className="mb-4 flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-50 text-primary dark:bg-primary/10">
              <Gift className="h-[18px] w-[18px]" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-700 dark:text-slate-200">Scratch Card (6 Tiers)</p>
              <p className="text-[11px] text-slate-400">Coins per hidden tier; higher tiers are rarer (Tier 6 = jackpot)</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {SCRATCH_TIERS.map((tier) => (
              <div key={tier} className="rounded-xl border border-slate-100 p-4 dark:border-slate-800">
                <div className="mb-2.5 flex items-center gap-1.5">
                  {tier === 6 && <Trophy className="h-4 w-4 text-amber-500" />}
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-300">Tier {tier}</p>
                </div>
                <div className="relative">
                  <Input
                    type="number"
                    step="any"
                    min="0"
                    value={String(values[scratchKey(tier)] ?? '')}
                    onChange={(e) => set(scratchKey(tier), e.target.value)}
                    className="pr-14"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-400">coins</span>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 max-w-[260px]">
            <p className="mb-2 text-sm font-medium text-slate-600 dark:text-slate-300">Free cards per day</p>
            <div className="relative">
              <Input
                type="number"
                step="1"
                min="1"
                value={String(values['scratch_daily_limit'] ?? '')}
                onChange={(e) => set('scratch_daily_limit', e.target.value)}
                className="pr-14"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-400">cards</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
