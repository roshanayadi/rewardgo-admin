import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'

dayjs.extend(relativeTime)

/** Tailwind-aware className combiner (shadcn convention). */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Format a number as a coin/points value with thousands separators. */
export function formatNumber(value: number | string | null | undefined): string {
  const n = Number(value ?? 0)
  return new Intl.NumberFormat('en-US').format(n)
}

/** Coins are the app's base currency, e.g. "2,500 coins". */
export function formatCoins(value: number | string | null | undefined): string {
  return `${formatNumber(value)} coins`
}

/** Format a monetary amount. */
export function formatMoney(value: number | string | null | undefined, currency = 'USD'): string {
  const n = Number(value ?? 0)
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(n)
}

export function formatDate(value?: string | null, template = 'DD MMM YYYY'): string {
  if (!value) return '—'
  return dayjs(value).format(template)
}

export function formatDateTime(value?: string | null): string {
  if (!value) return '—'
  return dayjs(value).format('DD MMM YYYY, hh:mm A')
}

export function fromNow(value?: string | null): string {
  if (!value) return '—'
  return dayjs(value).fromNow()
}

/** Turn an array of objects into a CSV string and trigger a download. */
export function exportToCsv<T extends Record<string, unknown>>(
  filename: string,
  rows: T[],
  columns?: { key: keyof T; label: string }[],
): void {
  if (!rows.length) return

  const keys = columns ? columns.map((c) => c.key) : (Object.keys(rows[0]) as (keyof T)[])
  const headers = columns ? columns.map((c) => c.label) : keys.map(String)

  const escape = (val: unknown) => {
    const s = val === null || val === undefined ? '' : String(val)
    return `"${s.replace(/"/g, '""')}"`
  }

  const csv = [
    headers.join(','),
    ...rows.map((row) => keys.map((k) => escape(row[k])).join(',')),
  ].join('\n')

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${filename}-${dayjs().format('YYYYMMDD-HHmmss')}.csv`
  link.click()
  URL.revokeObjectURL(url)
}

export function initials(name?: string | null): string {
  if (!name) return 'U'
  return name
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}
