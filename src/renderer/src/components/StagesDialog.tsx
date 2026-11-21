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
import { GripVertical, Plus, Trash2 } from 'lucide-react'
import type { Stage } from '@shared/types'
import { Dialog } from './ui/dialog'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { stageDot } from './StageColumn'
import { useStore } from '@/store'

export function StagesDialog() {
  const open = useStore((s) => s.stagesDialogOpen)
  const setOpen = useStore((s) => s.openStagesDialog)
  const stages = useStore((s) => s.stages)
  const createStage = useStore((s) => s.createStage)
  const reorderStages = useStore((s) => s.reorderStages)
  const [newName, setNewName] = useState('')

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
    await createStage(name)
    setNewName('')
  }

  return (
    <Dialog
      open={open}
      onOpenChange={setOpen}
      title="Manage stages"
      description="Stages are the board’s columns. Drag to reorder, click a name to rename."
      className="w-[480px]"
      footer={
        <>
          <div className="flex-1" />
          <Button size="sm" variant="primary" onClick={() => setOpen(false)}>
            Done
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

      <form onSubmit={add} className="mt-4 flex gap-2">
        <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="New stage name" />
        <Button type="submit" variant="primary" disabled={!newName.trim()}>
          <Plus /> Add
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
  const [name, setName] = useState(stage.name)
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: stage.id
  })
  const count = processes.filter((p) => p.stageId === stage.id).length
  useEffect(() => setName(stage.name), [stage.name])

  function save() {
    const clean = name.trim()
    if (!clean) setName(stage.name)
    else if (clean !== stage.name) renameStage(stage.id, clean)
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
        aria-label={`Reorder ${stage.name}`}
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
      <span className="w-14 text-right text-[12px] text-subtle tabular-nums">
        {count} {count === 1 ? 'card' : 'cards'}
      </span>
      <Button
        size="icon"
        variant="ghost"
        className="hover:text-danger"
        onClick={() => askDeleteStage(stage.id)}
        aria-label={`Delete ${stage.name}`}
      >
        <Trash2 />
      </Button>
    </li>
  )
}
