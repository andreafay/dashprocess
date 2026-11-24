import type { Process } from '@shared/types'
import { LOCALES, messages, type Language } from '@shared/i18n'

const SYMBOLS: Record<string, string> = { EUR: '€', USD: '$', GBP: '£' }

/** 50000 → "50k", 1500 → "1.5k" (English) or "1,5k" (Italian). */
function compact(n: number, language: Language): string {
  if (n < 1000) return String(n)
  const k = n / 1000
  const text = Number.isInteger(k) ? String(k) : k.toFixed(1)
  return `${language === 'it' ? text.replace('.', ',') : text}k`
}

/** English puts the symbol first ("€50k"), Italian after ("50k €"). */
function money(amount: string, currency: string, language: Language): string {
  const symbol = SYMBOLS[currency]
  if (language === 'it') return `${amount} ${symbol ?? currency}`
  return symbol ? `${symbol}${amount}` : `${currency} ${amount}`
}

/** "€50k–65k / yr", "from €400 / day", "50k–65k € / anno", or null when no pay is set. */
export function formatPay(
  p: Pick<Process, 'payMin' | 'payMax' | 'payCurrency' | 'payPeriod'>,
  language: Language
): string | null {
  const { payMin: min, payMax: max } = p
  if (min == null && max == null) return null
  const t = messages(language).pay
  const per = ` / ${t.periodShort[p.payPeriod]}`
  const fmt = (amount: string) => money(amount, p.payCurrency, language)
  if (min != null && max != null) {
    const range = min === max ? compact(min, language) : `${compact(min, language)}–${compact(max, language)}`
    return fmt(range) + per
  }
  if (min != null) return t.from(fmt(compact(min, language))) + per
  return t.upTo(fmt(compact(max!, language))) + per
}

export function formatDate(iso: string | null, language: Language): string | null {
  if (!iso) return null
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString(LOCALES[language], {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })
}

/** "today", "3d", "5w" (or "oggi", "3g", "5 sett.") since the given ISO date. */
export function sinceDate(iso: string | null, language: Language): string | null {
  if (!iso) return null
  const t = messages(language).since
  const [y, m, d] = iso.split('-').map(Number)
  const days = Math.floor((Date.now() - new Date(y, m - 1, d).getTime()) / 86_400_000)
  if (days < 0) return t.inDays(-days)
  if (days === 0) return t.today
  if (days < 14) return t.days(days)
  if (days < 60) return t.weeks(Math.floor(days / 7))
  return t.months(Math.floor(days / 30))
}
