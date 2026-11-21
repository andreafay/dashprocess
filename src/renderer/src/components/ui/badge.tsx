import type { HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

const tones = {
  neutral: 'bg-surface-2 text-muted border-border',
  accent: 'bg-accent-soft text-accent-text border-transparent',
  green: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-transparent',
  amber: 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border-transparent',
  sky: 'bg-sky-500/10 text-sky-700 dark:text-sky-400 border-transparent',
  rose: 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border-transparent',
  violet: 'bg-violet-500/10 text-violet-700 dark:text-violet-400 border-transparent'
}

export type BadgeTone = keyof typeof tones

export function Badge({
  tone = 'neutral',
  className,
  ...props
}: HTMLAttributes<HTMLSpanElement> & { tone?: BadgeTone }) {
  return (
    <span
      className={cn(
        'inline-flex h-5 items-center gap-1 rounded-md border px-1.5 text-[11px] font-medium whitespace-nowrap',
        tones[tone],
        className
      )}
      {...props}
    />
  )
}
