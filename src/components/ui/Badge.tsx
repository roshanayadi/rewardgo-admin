import { cn } from '@/lib/utils'

type Tone = 'green' | 'red' | 'yellow' | 'blue' | 'gray' | 'purple'

const tones: Record<Tone, string> = {
  green: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-500/10 dark:text-emerald-400',
  red: 'bg-red-50 text-red-700 ring-red-600/20 dark:bg-red-500/10 dark:text-red-400',
  yellow: 'bg-amber-50 text-amber-700 ring-amber-600/20 dark:bg-amber-500/10 dark:text-amber-400',
  blue: 'bg-blue-50 text-blue-700 ring-blue-600/20 dark:bg-blue-500/10 dark:text-blue-400',
  gray: 'bg-slate-100 text-slate-600 ring-slate-500/20 dark:bg-slate-700 dark:text-slate-300',
  purple: 'bg-purple-50 text-purple-700 ring-purple-600/20 dark:bg-purple-500/10 dark:text-purple-400',
}

export function Badge({
  tone = 'gray',
  className,
  children,
}: {
  tone?: Tone
  className?: string
  children: React.ReactNode
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset',
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  )
}

/** Map common status strings to a tone. */
export function statusTone(status?: string | null): Tone {
  const s = (status ?? '').toLowerCase()
  if (['active', 'approved', 'completed', 'paid', 'delivered', 'healthy', 'ok'].includes(s)) return 'green'
  if (['inactive', 'rejected', 'failed', 'banned', 'reversed', 'unhealthy'].includes(s)) return 'red'
  if (['pending', 'draft', 'paused', 'processing'].includes(s)) return 'yellow'
  if (['credit'].includes(s)) return 'green'
  if (['debit'].includes(s)) return 'red'
  return 'gray'
}

export function StatusBadge({ status }: { status?: string | null }) {
  return <Badge tone={statusTone(status)}>{status ?? '—'}</Badge>
}
