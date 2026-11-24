import { useEffect, useState, type FormEvent } from 'react'
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy
} from '@dnd-kit/sortable'
import { restrictToParentElement, restrictToVerticalAxis } from '@dnd-kit/modifiers'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, Plus, RotateCcw, Trash2 } from 'lucide-react'
import { STAGE_PRESETS, type Stage } from '@shared/types'
import { Dialog } from './ui/dialog'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { stageDot } from './StageColumn'
import { useStore } from '@/store'
import { useStageLabel, useT } from '@/lib/i18n'

export function StagesDialog() {
  const open = useStore((s) => s.stagesDialogOpen)
  const setOpen = useStore((s) => s.openStagesDialog)
  const stages = useStore((s) => s.stages)
  const createStage = useStore((s) => s.createStage)
  const reorderStages = useStore((s) => s.reorderStages)
  const [newName, setNewName] = useState('')
  const t = useT()
  // Presets not on the board yet, offered as one-click buttons.
  const unused = STAGE_PRESETS.filter((p) => !stages.some((s) => s.preset === p))

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  function onDragEnd({ active, over }: DragEndEvent) {
    if (!over || active.id === over.id) return
    const ids = stages.map((s) => s.id)
    reorderStages(arrayMove(ids, ids.indexOf(Number(active.id)), ids.indexOf(Number(over.id))))
  }

  async function add(e: FormEvent) {
    e.preventDefault()
    const name = newName.trim()
    if (!name) return
    await createStage(name, null)
    setNewName('')
  }

  return (
    <Dialog
      open={open}
      onOpenChange={setOpen}
      title={t.stagesDialog.title}
      description={t.stagesDialog.description}
      className="w-[480px]"
      footer={
        <>
          <div className="flex-1" />
          <Button size="sm" variant="primary" onClick={() => setOpen(false)}>
            {t.common.done}
          </Button>
        </>
      }
    >
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        modifiers={[restrictToVerticalAxis, restrictToParentElement]}
        onDragEnd={onDragEnd}
      >
        <SortableContext items={stages.map((s) => s.id)} strategy={verticalListSortingStrategy}>
          <ul className="flex flex-col gap-1.5">
            {stages.map((s) => (
              <StageRow key={s.id} stage={s} />
            ))}
          </ul>
        </SortableContext>
      </DndContext>

      <div className="mt-5 flex flex-col gap-2 border-t border-border pt-4">
        <h3 className="text-[11px] font-semibold tracking-wider text-subtle uppercase">
          {t.stagesDialog.addStage}
        </h3>
        {unused.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {unused.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => createStage('', preset)}
                className="inline-flex h-7 items-center gap-1 rounded-full border border-border bg-surface px-2.5 text-[12.5px] font-medium text-fg shadow-[var(--shadow-card)] hover:border-accent-text/50 hover:bg-accent-soft/50"
              >
                <Plus className="size-3.5 text-subtle" />
                {t.stagePresets[preset]}
              </button>
            ))}
          </div>
        )}
      </div>

      <form onSubmit={add} className="mt-3 flex gap-2">
        <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder={t.stagesDialog.custom} />
        <Button type="submit" variant="primary" disabled={!newName.trim()}>
          <Plus /> {t.common.add}
        </Button>
      </form>
    </Dialog>
  )
}

function StageRow({ stage }: { stage: Stage }) {
  const stages = useStore((s) => s.stages)
  const processes = useStore((s) => s.processes)
  const renameStage = useStore((s) => s.renameStage)
  const askDeleteStage = useStore((s) => s.askDeleteStage)
  const resetStageName = useStore((s) => s.resetStageName)
  const label = useStageLabel()(stage)
  const [name, setName] = useState(label)
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: stage.id
  })
  const count = processes.filter((p) => p.stageId === stage.id).length
  const t = useT()
  useEffect(() => setName(label), [label])

  function save() {
    const clean = name.trim()
    if (!clean) setName(label)
    else if (clean !== label) renameStage(stage.id, clean)
  }

  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`flex items-center gap-2 rounded-lg border border-border bg-surface py-1 pr-1 pl-1.5 ${
        isDragging ? 'relative z-10 shadow-[var(--shadow-lift)]' : ''
      }`}
    >
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab rounded p-1 text-subtle hover:text-fg active:cursor-grabbing"
        aria-label={t.stagesDialog.reorder(label)}
      >
        <GripVertical className="size-4" />
      </button>
      <span className="size-2 shrink-0 rounded-full" style={{ background: stageDot(stages, stage.id) }} />
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        onBlur={save}
        onKeyDown={(e) => e.key === 'Enter' && (e.target as HTMLInputElement).blur()}
        className="h-8 min-w-0 flex-1 rounded-md border border-transparent bg-transparent px-2 text-sm font-medium outline-none hover:border-border focus:border-accent-text"
      />
      <span className="w-16 text-right text-[12px] text-subtle tabular-nums">
        {t.stagesDialog.cards(count)}
      </span>
      {stage.preset && stage.renamed && (
        <Button
          size="icon"
          variant="ghost"
          onClick={() => resetStageName(stage.id)}
          aria-label={t.stagesDialog.resetName(label)}
          title={t.column.resetName}
        >
          <RotateCcw />
        </Button>
      )}
      <Button
        size="icon"
        variant="ghost"
        className="hover:text-danger"
        onClick={() => askDeleteStage(stage.id)}
        aria-label={t.stagesDialog.delete(label)}
      >
        <Trash2 />
      </Button>
    </li>
  )
}
