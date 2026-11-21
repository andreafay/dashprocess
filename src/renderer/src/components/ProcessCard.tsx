import { Banknote, CalendarDays, StickyNote } from 'lucide-react'
import type { Process } from '@shared/types'
import { Badge } from './ui/badge'
import { formatDate, formatPay, sinceDate } from '@/lib/format'
import { cn } from '@/lib/utils'

const AVATAR_COLORS = [
  'bg-violet-500',
  'bg-blue-500',
  'bg-emerald-500',
  'bg-amber-500',
  'bg-rose-500',
  'bg-cyan-500',
  'bg-fuchsia-500',
  'bg-orange-500'
]

function avatarColor(name: string): string {
  let h = 0
  for (const ch of name.toLowerCase()) h = (h * 31 + ch.charCodeAt(0)) >>> 0
  return AVATAR_COLORS[h % AVATAR_COLORS.length]
}

function initials(name: string): string {
  const words = name.trim().split(/\s+/)
  return (words.length > 1 ? words[0][0] + words[1][0] : name.slice(0, 2)).toUpperCase()
}

interface Props {
  process: Process
  /** Rendered in the drag overlay (lifted). */
  overlay?: boolean
  /** The card's original spot while it is being dragged. */
  placeholder?: boolean
}

export function ProcessCard({ process: p, overlay, placeholder }: Props) {
  const pay = formatPay(p)
  const ended = p.status !== 'active'

  return (
    <article
      className={cn(
        'group cursor-grab rounded-xl border border-border bg-surface p-3.5 shadow-[var(--shadow-card)] transition-[box-shadow,border-color] hover:border-border-strong active:cursor-grabbing',
        overlay && 'rotate-[1.5deg] cursor-grabbing border-border-strong shadow-[var(--shadow-lift)]',
        placeholder && 'opacity-40',
        ended && !overlay && 'opacity-60 saturate-50'
      )}
    >
      <div className="flex items-start gap-3">
        <div
          className={cn(
            'flex size-8 shrink-0 items-center justify-center rounded-lg text-[11px] font-semibold text-white',
            avatarColor(p.company)
          )}
        >
          {initials(p.company)}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <h4 className="truncate text-[13.5px] leading-5 font-semibold text-fg">{p.company}</h4>
            {p.status === 'rejected' && <Badge tone="rose">Rejected</Badge>}
            {p.status === 'withdrawn' && <Badge>Withdrawn</Badge>}
          </div>
          <p className="truncate text-[12.5px] leading-5 text-muted">{p.role}</p>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-1">
        <Badge tone={p.remote ? 'green' : 'neutral'}>{p.remote ? 'Remote' : 'On-site'}</Badge>
        <Badge tone={p.b2b ? 'violet' : 'neutral'}>{p.b2b ? 'B2B' : 'Employee'}</Badge>
        {p.consulting && <Badge tone="amber">Consulting</Badge>}
        <Badge tone="sky">{p.region === 'italian' ? 'Italian' : 'European'}</Badge>
      </div>

      {(pay || p.startDate || p.notes) && (
        <div className="mt-3 flex items-center gap-3 border-t border-border pt-2.5 text-[12px] text-muted">
          {pay && (
            <span className="flex min-w-0 items-center gap-1 font-medium text-fg">
              <Banknote className="size-3.5 shrink-0 text-subtle" />
              <span className="truncate">{pay}</span>
            </span>
          )}
          <span className="flex-1" />
          {p.notes && <StickyNote className="size-3.5 shrink-0 text-subtle" aria-label="Has notes" />}
          {p.startDate && (
            <span className="flex shrink-0 items-center gap-1" title={`Started ${formatDate(p.startDate)}`}>
              <CalendarDays className="size-3.5 text-subtle" />
              {sinceDate(p.startDate)}
            </span>
          )}
        </div>
      )}
    </article>
  )
}
