import { useEffect, useState } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  Save,
  UserPlus,
  CalendarCheck,
  Megaphone,
  Disc3,
  Users2,
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
  { key: 'daily_checkin_coins', label: 'Daily Check-in', description: 'Coins per daily check-in', icon: CalendarCheck },
  { key: 'watch_ad_coins', label: 'Watch Ad / Video', description: 'Coins per rewarded ad view', icon: Megaphone },
  { key: 'spin_coins', label: 'Spin', description: 'Coins per spin-wheel reward', icon: Disc3 },
  { key: 'referral_signup_coins', label: 'Referral Signup', description: 'Coins when a referral joins', icon: Users2 },
  { key: 'referral_bonus', label: 'Referral Bonus', description: 'Bonus coins per referral', icon: Users2 },
]

export function CoinRewardsTab() {
  const { data, isLoading } = useQuery({ queryKey: ['settings'], queryFn: settingsApi.all })
  const [values, setValues] = useState<Record<string, unknown>>({})

  useEffect(() => {
    if (!data) return
    const flat: Record<string, unknown> = {}
    Object.values(data).flat().forEach((s: Setting) => (flat[s.key] = s.value))
    setValues(flat)
  }, [data])

  const mutation = useMutation({
    mutationFn: () => {
      const settings = COINS.filter((c) => c.key in values).map((c) => ({ key: c.key, value: values[c.key] }))
      return settingsApi.update(settings)
    },
    onSuccess: () => toast.success('Coin rewards saved'),
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
      </CardContent>
    </Card>
  )
}
