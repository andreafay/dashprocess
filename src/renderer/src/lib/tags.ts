import type { Process } from '@shared/types'
import type { BadgeTone } from '@/components/ui/badge'

export interface Tag {
  label: string
  tone: BadgeTone
}

/** The badges shown on a card. Search matches these labels too, so keep them in one place. */
export function processTags(p: Process): Tag[] {
  return [
    p.remote ? { label: 'Remote', tone: 'green' } : { label: 'On-site', tone: 'neutral' },
    p.b2b ? { label: 'B2B', tone: 'violet' } : { label: 'Employee', tone: 'neutral' },
    p.companyType === 'consulting'
      ? { label: 'Consulting', tone: 'amber' }
      : { label: 'Product', tone: 'indigo' },
    { label: p.region === 'italian' ? 'Italian' : 'European', tone: 'sky' }
  ]
}
