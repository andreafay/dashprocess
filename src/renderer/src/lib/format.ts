import type { PayPeriod, Process } from '@shared/types'

const PERIOD_SHORT: Record<PayPeriod, string> = { year: 'yr', month: 'mo', day: 'day', hour: 'hr' }
export const PERIOD_LABEL: Record<PayPeriod, string> = {
  year: 'per year',
  month: 'per month',
  day: 'per day',
  hour: 'per hour'
}

function compact(n: number): string {
  if (n >= 1000) {
    const k = n / 1000
    return `${Number.isInteger(k) ? k : k.toFixed(1)}k`
  }
  return String(n)
}

function symbol(currency: string): string {
  return { EUR: '€', USD: '$', GBP: '£' }[currency] ?? `${currency} `
}

/** "€50k–65k / yr", "from €400 / day", or null when no pay is set. */
export function formatPay(p: Pick<Process, 'payMin' | 'payMax' | 'payCurrency' | 'payPeriod'>): string | null {
  const { payMin: min, payMax: max } = p
  if (min == null && max == null) return null
  const s = symbol(p.payCurrency)
  const per = ` / ${PERIOD_SHORT[p.payPeriod]}`
  if (min != null && max != null) {
    return min === max ? `${s}${compact(min)}${per}` : `${s}${compact(min)}–${compact(max)}${per}`
  }
  if (min != null) return `from ${s}${compact(min)}${per}`
  return `up to ${s}${compact(max!)}${per}`
}

export function formatDate(iso: string | null): string | null {
  if (!iso) return null
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })
}

/** "today", "3 days", "5 weeks" since the given ISO date. */
export function sinceDate(iso: string | null): string | null {
  if (!iso) return null
  const [y, m, d] = iso.split('-').map(Number)
  const days = Math.floor((Date.now() - new Date(y, m - 1, d).getTime()) / 86_400_000)
  if (days < 0) return `in ${-days}d`
  if (days === 0) return 'today'
  if (days < 14) return `${days}d`
  if (days < 60) return `${Math.floor(days / 7)}w`
  return `${Math.floor(days / 30)}mo`
}
