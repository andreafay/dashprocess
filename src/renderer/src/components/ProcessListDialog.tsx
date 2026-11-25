import { useMemo } from 'react'
import { Banknote, Inbox } from 'lucide-react'
import { Dialog } from './ui/dialog'
import { Badge } from './ui/badge'
import { avatarColor, initials } from './ProcessCard'
import { formatDate, formatPay } from '@/lib/format'
import { useStageLabel, useT } from '@/lib/i18n'
import { statLists } from '@/lib/stats'
import { cn } from '@/lib/utils'
import { isEnded, useStore } from '@/store'

/**
 * The processes behind one of the tiles above the board, as a compact list (one row per process).
 * Clicking a row opens it for editing.
 */
export function ProcessListDialog() {
  const kind = useStore((s) => s.processList)
  const openProcessList = useStore((s) => s.openProcessList)
  const openViewer = useStore((s) => s.openViewer)
  const processes = useStore((s) => s.processes)
  const stages = useStore((s) => s.stages)
  const language = useStore((s) => s.language)
  const t = useT()
  const stageLabel = useStageLabel()

  const { lists, lastStage } = useMemo(() => statLists(processes, stages), [processes, stages])
  if (!kind) return null
  const list = lists[kind]
  const titles = t.processList.titles
  const title =
    kind === 'offer' ? titles.offer(lastStage ? stageLabel(lastStage) : '') : titles[kind]

  return (
    <Dialog
      open
      onOpenChange={(open) => !open && openProcessList(null)}
      title={title}
      description={t.processList.count(list.length)}
      className="w-[560px]"
    >
      {list.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-10 text-[13px] text-muted">
          <Inbox className="size-6 text-subtle" />
          {t.processList.empty}
        </div>
      ) : (
        <ul className="flex flex-col gap-1.5">
          {list.map((p) => {
            const ended = isEnded(p)
            const stage = stages.find((s) => s.id === p.stageId)
            const pay = formatPay(p, language)
            // Ended rows show when they last changed; active rows show when the process started.
            const date = ended
              ? t.processList.updated(formatDate(p.updatedAt.slice(0, 10), language) ?? '')
              : p.startDate
                ? t.card.started(formatDate(p.startDate, language) ?? '')
                : null
            return (
              <li key={p.id}>
                <button
                  type="button"
                  onClick={() => {
                    openProcessList(null)
                    openViewer(p.id)
                  }}
                  className="flex w-full items-center gap-3 rounded-xl border border-border bg-surface px-3 py-2.5 text-left transition-colors hover:border-border-strong hover:bg-surface-2/60 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                >
                  <div
                    className={cn(
                      'flex size-8 shrink-0 items-center justify-center rounded-lg text-[11px] font-semibold text-white',
                      ended && 'opacity-70',
                      avatarColor(p.company)
                    )}
                  >
                    {initials(p.company)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="truncate text-[13.5px] font-semibold text-fg">{p.company}</span>
                      {p.status === 'rejected' && <Badge tone="rose">{t.status.rejected}</Badge>}
                      {p.status === 'withdrawn' && <Badge>{t.status.withdrawn}</Badge>}
                    </div>
                    <div className="truncate text-[12.5px] text-muted">
                      {p.role}
                      {stage &&
                        ` · ${ended ? t.processList.lastStage(stageLabel(stage)) : stageLabel(stage)}`}
                    </div>
                    {ended && p.endReason && (
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
                    {date && <span>{date}</span>}
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
