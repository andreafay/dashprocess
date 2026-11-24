import { useEffect, useState } from 'react'
import { Dialog } from './ui/dialog'
import { Button } from './ui/button'
import { Label } from './ui/input'
import { Select } from './ui/select'
import { useStore } from '@/store'
import { useStageLabel, useT } from '@/lib/i18n'

export function DeleteStageDialog() {
  const stageId = useStore((s) => s.deletingStageId)
  const askDeleteStage = useStore((s) => s.askDeleteStage)
  const stages = useStore((s) => s.stages)
  const processes = useStore((s) => s.processes)
  const deleteStage = useStore((s) => s.deleteStage)

  const stage = stages.find((s) => s.id === stageId)
  const others = stages.filter((s) => s.id !== stageId)
  const count = processes.filter((p) => p.stageId === stageId).length
  const [moveTo, setMoveTo] = useState<number | null>(null)
  const t = useT()
  const label = useStageLabel()

  useEffect(() => {
    // Default to the stage just before the deleted one, or the first other stage.
    const i = stages.findIndex((s) => s.id === stageId)
    setMoveTo((stages[i - 1] ?? others[0])?.id ?? null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stageId])

  if (!stage) return null
  const close = () => askDeleteStage(null)
  const isLast = others.length === 0

  return (
    <Dialog
      open
      onOpenChange={(o) => !o && close()}
      title={t.deleteStage.title(label(stage))}
      className="w-[440px]"
      footer={
        <>
          <div className="flex-1" />
          <Button size="sm" onClick={close}>
            {t.common.cancel}
          </Button>
          <Button
            variant="danger"
            size="sm"
            disabled={isLast}
            onClick={async () => {
              close()
              await deleteStage(stage.id, count > 0 ? moveTo : null)
            }}
          >
            {t.deleteStage.confirm}
          </Button>
        </>
      }
    >
      {isLast ? (
        <p className="text-[13px] text-muted">{t.deleteStage.lastStage}</p>
      ) : count === 0 ? (
        <p className="text-[13px] text-muted">{t.deleteStage.empty}</p>
      ) : (
        <div className="flex flex-col gap-3">
          <p className="text-[13px] text-muted">
            {t.deleteStage.hasProcesses(count)}
          </p>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="move-to">{t.deleteStage.moveTo}</Label>
            <Select
              id="move-to"
              value={String(moveTo ?? '')}
              onChange={(v) => setMoveTo(Number(v))}
              options={others.map((s) => ({ value: String(s.id), label: label(s) }))}
            />
          </div>
        </div>
      )}
    </Dialog>
  )
}
