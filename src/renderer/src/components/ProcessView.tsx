import type { ReactNode } from 'react'
import { Banknote, CalendarDays, ExternalLink, Pencil, StickyNote } from 'lucide-react'
import { Dialog } from './ui/dialog'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { avatarColor, initials } from './ProcessCard'
import { stageDot } from './StageColumn'
import { formatDate, formatPay, sinceDate } from '@/lib/format'
import { processTags } from '@/lib/tags'
import { useStageLabel, useT } from '@/lib/i18n'
import { cn } from '@/lib/utils'
import { useStore } from '@/store'

/**
 * A process shown for reading, like a short article: everything about it at a glance, no form.
 * "Edit" switches to the edit form; closing the form comes back here.
 */
export function ProcessView() {
  const id = useStore((s) => s.viewing)
  const openViewer = useStore((s) => s.openViewer)
  const openEditor = useStore((s) => s.openEditor)
  const process = useStore((s) => s.processes.find((p) => p.id === id))
  const stages = useStore((s) => s.stages)
  const language = useStore((s) => s.language)
  const t = useT()
  const stageLabel = useStageLabel()

  if (!process) return null
  const p = process
  const stage = stages.find((s) => s.id === p.stageId)
  const pay = formatPay(p, language)
  const ended = p.status !== 'active'
  const date = (iso: string | null) => formatDate(iso, language)

  return (
    <Dialog
      open
      onOpenChange={(o) => !o && openViewer(null)}
      title={p.company}
      description={p.role}
      className="w-[600px]"
      footer={
        <>
          <span className="text-[12px] text-subtle">
            {t.view.added(date(p.createdAt.slice(0, 10)) ?? '')} ·{' '}
            {t.view.updated(date(p.updatedAt.slice(0, 10)) ?? '')}
          </span>
          <div className="flex-1" />
          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              openViewer(null)
              openEditor({ mode: 'edit', id: p.id })
            }}
          >
            <Pencil /> {t.view.edit}
          </Button>
        </>
      }
    >
      <article className="flex flex-col gap-5">
        {/* Who and where it stands */}
        <div className="flex items-center gap-3">
          <div
            className={cn(
              'flex size-11 shrink-0 items-center justify-center rounded-xl text-[14px] font-semibold text-white',
              ended && 'opacity-70',
              avatarColor(p.company)
            )}
          >
            {initials(p.company)}
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            {stage && (
              <span className="inline-flex h-6 items-center gap-1.5 rounded-full border border-border bg-surface-2 px-2.5 text-[12px] font-medium text-fg">
                <span className="size-2 rounded-full" style={{ background: stageDot(stages, stage.id) }} />
                {stageLabel(stage)}
              </span>
            )}
            {p.status === 'active' && <Badge tone="green">{t.status.active}</Badge>}
            {p.status === 'rejected' && <Badge tone="rose">{t.status.rejected}</Badge>}
            {p.status === 'withdrawn' && <Badge>{t.status.withdrawn}</Badge>}
          </div>
        </div>

        {/* Why it ended, when it did */}
        {ended && p.endReason && (
          <blockquote className="rounded-xl border-l-4 border-border-strong bg-surface-2 px-4 py-3">
            <div className="mb-1 text-[11px] font-semibold tracking-wider text-subtle uppercase">
              {p.status === 'rejected' ? t.form.rejectionFeedback : t.form.withdrawReason}
            </div>
            <p className="text-[13.5px] leading-relaxed whitespace-pre-wrap text-fg italic">
              {p.endReason}
            </p>
          </blockquote>
        )}

        {/* Key facts */}
        <dl className="grid grid-cols-2 gap-x-6 gap-y-4 rounded-xl border border-border px-4 py-3.5">
          <Fact icon={Banknote} label={t.form.pay}>
            {pay ?? <Empty />}
          </Fact>
          <Fact icon={CalendarDays} label={t.form.startDate}>
            {p.startDate ? (
              <>
                {date(p.startDate)}
                <span className="text-muted"> · {sinceDate(p.startDate, language)}</span>
              </>
            ) : (
              <Empty />
            )}
          </Fact>
          <div className="col-span-2">
            <dt className="mb-1.5 text-[11px] font-semibold tracking-wider text-subtle uppercase">
              {t.form.details}
            </dt>
            <dd className="flex flex-wrap gap-1">
              {processTags(p, t).map((tag) => (
                <Badge key={tag.label} tone={tag.tone}>
                  {tag.label}
                </Badge>
              ))}
            </dd>
          </div>
          {p.jobUrl && (
            <div className="col-span-2">
              <dt className="mb-1 text-[11px] font-semibold tracking-wider text-subtle uppercase">
                {t.form.jobAdLink}
              </dt>
              <dd>
                <a
                  href={p.jobUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex max-w-full items-center gap-1.5 text-[13.5px] font-medium text-accent-text hover:underline"
                >
                  <ExternalLink className="size-3.5 shrink-0" />
                  <span className="truncate">{p.jobUrl}</span>
                </a>
              </dd>
            </div>
          )}
        </dl>

        {/* Notes, as written */}
        <section>
          <h3 className="mb-1.5 flex items-center gap-1.5 text-[11px] font-semibold tracking-wider text-subtle uppercase">
            <StickyNote className="size-3.5" />
            {t.form.notes}
          </h3>
          {p.notes ? (
            <p className="text-[14px] leading-relaxed whitespace-pre-wrap text-fg">{p.notes}</p>
          ) : (
            <p className="text-[13px] text-subtle italic">{t.view.noNotes}</p>
          )}
        </section>
      </article>
    </Dialog>
  )
}

function Fact({
  icon: Icon,
  label,
  children
}: {
  icon: typeof Banknote
  label: string
  children: ReactNode
}) {
  return (
    <div className="min-w-0">
      <dt className="mb-1 flex items-center gap-1.5 text-[11px] font-semibold tracking-wider text-subtle uppercase">
        <Icon className="size-3.5" />
        {label}
      </dt>
      <dd className="text-[14px] font-medium text-fg">{children}</dd>
    </div>
  )
}

function Empty() {
  return <span className="font-normal text-subtle">—</span>
}
