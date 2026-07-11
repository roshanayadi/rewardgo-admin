import type { LucideIcon } from 'lucide-react'
import { TrendingUp, TrendingDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Skeleton } from '@/components/ui/Skeleton'

interface StatCardProps {
  label: string
  value: string | number
  icon: LucideIcon
  tone?: 'red' | 'green' | 'blue' | 'amber' | 'purple'
  trend?: number
  trendLabel?: string
  hint?: string
  loading?: boolean
}

const tones = {
  red: 'bg-primary-50 text-primary dark:bg-primary/10',
  green: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10',
  blue: 'bg-blue-50 text-blue-600 dark:bg-blue-500/10',
  amber: 'bg-amber-50 text-amber-600 dark:bg-amber-500/10',
  purple: 'bg-purple-50 text-purple-600 dark:bg-purple-500/10',
}

export function StatCard({ label, value, icon: Icon, tone = 'red', trend, trendLabel, hint, loading }: StatCardProps) {
  return (
    <div className="rounded-xl border border-slate-200/70 bg-white p-5 shadow-[0_1px_3px_0_rgb(0_0_0/0.06)] dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-start justify-between">
        <div className="min-w-0">
          <p className="text-sm font-medium text-slate-500">{label}</p>
          {loading ? (
            <Skeleton className="mt-2 h-8 w-24" />
          ) : (
            <p className="mt-1.5 text-2xl font-bold text-slate-800 dark:text-slate-100">{value}</p>
          )}
          {hint && !loading && <p className="mt-1 text-xs text-slate-400">{hint}</p>}
          {trend !== undefined && !loading && (
            <div
              className={cn(
                'mt-2 inline-flex items-center gap-1 text-xs font-medium',
                trend >= 0 ? 'text-emerald-600' : 'text-red-600',
              )}
            >
              {trend >= 0 ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
              {Math.abs(trend)}% {trendLabel ?? 'from last month'}
            </div>
          )}
        </div>
        <div className={cn('flex h-11 w-11 shrink-0 items-center justify-center rounded-lg', tones[tone])}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  )
}
