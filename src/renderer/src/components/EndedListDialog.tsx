import { useMemo } from 'react'
import { Banknote, CircleSlash } from 'lucide-react'
import { Dialog } from './ui/dialog'
import { Badge } from './ui/badge'
import { avatarColor, initials } from './ProcessCard'
import { formatDate, formatPay } from '@/lib/format'
import { useStageLabel, useT } from '@/lib/i18n'
import { cn } from '@/lib/utils'
import { isEnded, useStore } from '@/store'

/** Lists every rejected or withdrawn process, most recently updated first. Click one to edit it. */
export function EndedListDialog() {
  const open = useStore((s) => s.endedListOpen)
  const openEndedList = useStore((s) => s.openEndedList)
  const openEditor = useStore((s) => s.openEditor)
  const processes = useStore((s) => s.processes)
  const stages = useStore((s) => s.stages)
  const language = useStore((s) => s.language)
  const t = useT()
  const stageLabel = useStageLabel()

  const ended = useMemo(
    () =>
      processes
        .filter(isEnded)
        .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt) || b.id - a.id),
    [processes]
  )

  return (
    <Dialog
      open={open}
      onOpenChange={openEndedList}
      title={t.endedList.title}
      description={t.endedList.description(ended.length)}
      className="w-[560px]"
    >
      {ended.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-10 text-[13px] text-muted">
          <CircleSlash className="size-6 text-subtle" />
          {t.endedList.empty}
        </div>
      ) : (
        <ul className="flex flex-col gap-1.5">
          {ended.map((p) => {
            const stage = stages.find((s) => s.id === p.stageId)
            const pay = formatPay(p, language)
            return (
              <li key={p.id}>
                <button
                  type="button"
                  onClick={() => {
                    openEndedList(false)
                    openEditor({ mode: 'edit', id: p.id })
                  }}
                  className="flex w-full items-center gap-3 rounded-xl border border-border bg-surface px-3 py-2.5 text-left transition-colors hover:border-border-strong hover:bg-surface-2/60 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                >
                  <div
                    className={cn(
                      'flex size-8 shrink-0 items-center justify-center rounded-lg text-[11px] font-semibold text-white opacity-70',
                      avatarColor(p.company)
                    )}
                  >
                    {initials(p.company)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="truncate text-[13.5px] font-semibold text-fg">{p.company}</span>
                      {p.status === 'rejected' ? (
                        <Badge tone="rose">{t.status.rejected}</Badge>
                      ) : (
                        <Badge>{t.status.withdrawn}</Badge>
                      )}
                    </div>
                    <div className="truncate text-[12.5px] text-muted">
                      {p.role}
                      {stage && ` · ${t.endedList.lastStage(stageLabel(stage))}`}
                    </div>
                    {p.endReason && (
                      <p className="mt-1 line-clamp-2 text-[12.5px] text-subtle italic">
                        “{p.endReason}”
                      </p>
                    )}
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-0.5 text-[12px] text-muted">
                    {pay && (
                      <span className="flex items-center gap-1 font-medium text-fg">
                        <Banknote className="size-3.5 text-subtle" />
                        {pay}
                      </span>
                    )}
                    <span>{t.endedList.updated(formatDate(p.updatedAt.slice(0, 10), language) ?? '')}</span>
                  </div>
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </Dialog>
  )
}
