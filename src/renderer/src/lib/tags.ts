import type { Process } from '@shared/types'
import type { Messages } from '@shared/i18n'
import type { BadgeTone } from '@/components/ui/badge'

export interface Tag {
  label: string
  tone: BadgeTone
}

/** The badges shown on a card. Search matches these labels too, so keep them in one place. */
export function processTags(p: Process, t: Messages): Tag[] {
  return [
    p.remote ? { label: t.tags.remote, tone: 'green' } : { label: t.tags.onsite, tone: 'neutral' },
    p.b2b ? { label: t.tags.b2b, tone: 'violet' } : { label: t.tags.employee, tone: 'neutral' },
    p.companyType === 'consulting'
      ? { label: t.tags.consulting, tone: 'amber' }
      : { label: t.tags.product, tone: 'indigo' },
    { label: p.region === 'italian' ? t.tags.italian : t.tags.european, tone: 'sky' }
  ]
}
