import { useMemo } from 'react'
import { Activity, CalendarPlus, ChevronRight, CircleSlash, Trophy, type LucideIcon } from 'lucide-react'
import { useStore } from '@/store'
import { statLists } from '@/lib/stats'
import { useStageLabel, useT } from '@/lib/i18n'
import { cn } from '@/lib/utils'

export function StatsBar() {
  const processes = useStore((s) => s.processes)
  const stages = useStore((s) => s.stages)
  const openProcessList = useStore((s) => s.openProcessList)
  const t = useT()
  const label = useStageLabel()
  const { lists, lastStage } = useMemo(() => statLists(processes, stages), [processes, stages])

  return (
    <div className="grid grid-cols-4 gap-3 px-7 pb-5">
      <Stat
        icon={Activity}
        label={t.stats.active}
        value={lists.active.length}
        tone="text-accent-text bg-accent-soft"
        onClick={() => openProcessList('active')}
        title={t.stats.showList}
      />
      <Stat
        icon={Trophy}
        label={t.stats.atStage(lastStage ? label(lastStage) : '')}
        value={lists.offer.length}
        tone="text-emerald-600 dark:text-emerald-400 bg-emerald-500/10"
        onClick={() => openProcessList('offer')}
        title={t.stats.showList}
      />
      <Stat
        icon={CalendarPlus}
        label={t.stats.startedRecently}
        value={lists.recent.length}
        tone="text-sky-600 dark:text-sky-400 bg-sky-500/10"
        onClick={() => openProcessList('recent')}
        title={t.stats.showList}
      />
      <Stat
        icon={CircleSlash}
        label={t.stats.ended}
        value={lists.ended.length}
        tone="text-muted bg-surface-2"
        onClick={() => openProcessList('ended')}
        title={t.stats.showList}
      />
    </div>
  )
}

function Stat({
  icon: Icon,
  label,
  value,
  tone,
  onClick,
  title
}: {
  icon: LucideIcon
  label: string
  value: number
  tone: string
  /** Makes the tile a button. */
  onClick?: () => void
  title?: string
}) {
  const Tag = onClick ? 'button' : 'div'
  return (
    <Tag
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      title={title}
      className={cn(
        'flex items-center gap-3 rounded-xl border border-border bg-surface px-4 py-3 text-left shadow-[var(--shadow-card)]',
        onClick &&
          'group cursor-pointer transition-colors hover:border-border-strong hover:bg-surface-2/50 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none'
      )}
    >
      <div className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${tone}`}>
        <Icon className="size-[18px]" />
      </div>
      <div className="min-w-0">
        <div className="text-xl leading-6 font-semibold tabular-nums">{value}</div>
        <div className="truncate text-[12px] text-muted">{label}</div>
      </div>
      {onClick && (
        <ChevronRight className="ml-auto size-4 shrink-0 text-subtle transition-transform group-hover:translate-x-0.5" />
      )}
    </Tag>
  )
}
