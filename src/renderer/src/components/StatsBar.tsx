import { useMemo } from 'react'
import { Activity, CalendarPlus, ChevronRight, CircleSlash, Trophy, type LucideIcon } from 'lucide-react'
import { isEnded, useStore } from '@/store'
import { useStageLabel, useT } from '@/lib/i18n'
import { cn } from '@/lib/utils'

export function StatsBar() {
  const processes = useStore((s) => s.processes)
  const stages = useStore((s) => s.stages)
  const t = useT()
  const label = useStageLabel()
  const openEndedList = useStore((s) => s.openEndedList)

  const stats = useMemo(() => {
    const active = processes.filter((p) => !isEnded(p))
    const lastStage = stages[stages.length - 1]
    const monthAgo = new Date(Date.now() - 30 * 86_400_000).toISOString().slice(0, 10)
    return {
      active: active.length,
      offers: lastStage ? active.filter((p) => p.stageId === lastStage.id).length : 0,
      lastStage,
      recent: processes.filter((p) => p.startDate && p.startDate >= monthAgo).length,
      ended: processes.length - active.length
    }
  }, [processes, stages])

  return (
    <div className="grid grid-cols-4 gap-3 px-7 pb-5">
      <Stat icon={Activity} label={t.stats.active} value={stats.active} tone="text-accent-text bg-accent-soft" />
      <Stat
        icon={Trophy}
        label={t.stats.atStage(stats.lastStage ? label(stats.lastStage) : '')}
        value={stats.offers}
        tone="text-emerald-600 dark:text-emerald-400 bg-emerald-500/10"
      />
      <Stat
        icon={CalendarPlus}
        label={t.stats.startedRecently}
        value={stats.recent}
        tone="text-sky-600 dark:text-sky-400 bg-sky-500/10"
      />
      <Stat
        icon={CircleSlash}
        label={t.stats.ended}
        value={stats.ended}
        tone="text-muted bg-surface-2"
        onClick={() => openEndedList(true)}
        title={t.stats.showEndedList}
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
