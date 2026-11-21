import { useEffect, useRef, useState } from 'react'
import { useDroppable } from '@dnd-kit/core'
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { MoreHorizontal, Pencil, Plus, Trash2 } from 'lucide-react'
import type { Process, Stage } from '@shared/types'
import { ProcessCard } from './ProcessCard'
import { cardDndId, columnDndId } from '@/lib/dnd'
import { DropdownContent, DropdownItem, DropdownMenu, DropdownSeparator, DropdownTrigger } from './ui/dropdown'
import { cn } from '@/lib/utils'
import { useStore } from '@/store'

const STAGE_DOTS = ['#8b5cf6', '#3b82f6', '#f59e0b', '#ec4899', '#10b981', '#06b6d4', '#f97316', '#64748b']

export function stageDot(stages: Stage[], stageId: number): string {
  const i = stages.findIndex((s) => s.id === stageId)
  return STAGE_DOTS[Math.max(0, i) % STAGE_DOTS.length]
}

interface Props {
  stage: Stage
  processes: Process[]
  totalCount: number
}

export function StageColumn({ stage, processes, totalCount }: Props) {
  const stages = useStore((s) => s.stages)
  const openEditor = useStore((s) => s.openEditor)
  const askDeleteStage = useStore((s) => s.askDeleteStage)
  const renameStage = useStore((s) => s.renameStage)
  const { setNodeRef, isOver } = useDroppable({ id: columnDndId(stage.id) })
  const [editing, setEditing] = useState(false)

  return (
    <section className="flex w-[292px] shrink-0 flex-col rounded-2xl border border-border/70 bg-column">
      <header className="flex h-12 items-center gap-2 pr-2 pl-4">
        <span className="size-2 shrink-0 rounded-full" style={{ background: stageDot(stages, stage.id) }} />
        {editing ? (
          <RenameInput
            initial={stage.name}
            onDone={(name) => {
              setEditing(false)
              if (name && name !== stage.name) renameStage(stage.id, name)
            }}
          />
        ) : (
          <h3
            className="min-w-0 truncate text-[13px] font-semibold text-fg"
            onDoubleClick={() => setEditing(true)}
            title="Double-click to rename"
          >
            {stage.name}
          </h3>
        )}
        <span className="rounded-full bg-surface px-1.5 text-[11px] font-medium text-muted tabular-nums ring-1 ring-border">
          {processes.length === totalCount ? totalCount : `${processes.length}/${totalCount}`}
        </span>
        <div className="flex-1" />
        <DropdownMenu>
          <DropdownTrigger
            className="rounded-md p-1 text-subtle hover:bg-surface-2 hover:text-fg data-[state=open]:bg-surface-2"
            aria-label={`${stage.name} options`}
          >
            <MoreHorizontal className="size-4" />
          </DropdownTrigger>
          <DropdownContent>
            <DropdownItem onSelect={() => openEditor({ mode: 'new', stageId: stage.id })}>
              <Plus /> Add process here
            </DropdownItem>
            <DropdownItem onSelect={() => setEditing(true)}>
              <Pencil /> Rename stage
            </DropdownItem>
            <DropdownSeparator />
            <DropdownItem danger onSelect={() => askDeleteStage(stage.id)}>
              <Trash2 /> Delete stage
            </DropdownItem>
          </DropdownContent>
        </DropdownMenu>
      </header>

      <SortableContext items={processes.map((p) => cardDndId(p.id))} strategy={verticalListSortingStrategy}>
        <div
          ref={setNodeRef}
          className={cn(
            'mx-2 flex min-h-24 flex-1 flex-col gap-2 overflow-y-auto rounded-xl p-0.5 pb-2 transition-colors',
            isOver && 'bg-accent-soft/60'
          )}
        >
          {processes.map((p) => (
            <SortableCard key={p.id} process={p} />
          ))}
          {processes.length === 0 && (
            <div className="flex h-20 items-center justify-center rounded-xl border border-dashed border-border-strong text-[12px] text-subtle">
              {totalCount > 0 ? 'No matches' : 'Drop a process here'}
            </div>
          )}
        </div>
      </SortableContext>

      <button
        onClick={() => openEditor({ mode: 'new', stageId: stage.id })}
        className="mx-2 mb-2 flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-[13px] font-medium text-muted hover:bg-surface hover:text-fg"
      >
        <Plus className="size-4" />
        Add process
      </button>
    </section>
  )
}

function SortableCard({ process }: { process: Process }) {
  const openEditor = useStore((s) => s.openEditor)
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: cardDndId(process.id)
  })
  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      {...attributes}
      {...listeners}
      onClick={() => openEditor({ mode: 'edit', id: process.id })}
      onKeyDown={(e) => {
        if (e.key === 'Enter') openEditor({ mode: 'edit', id: process.id })
        else listeners?.onKeyDown?.(e)
      }}
      className="rounded-xl focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
    >
      <ProcessCard process={process} placeholder={isDragging} />
    </div>
  )
}

function RenameInput({ initial, onDone }: { initial: string; onDone: (name: string) => void }) {
  const [value, setValue] = useState(initial)
  const ref = useRef<HTMLInputElement>(null)
  useEffect(() => ref.current?.select(), [])
  return (
    <input
      ref={ref}
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onBlur={() => onDone(value.trim())}
      onKeyDown={(e) => {
        if (e.key === 'Enter') onDone(value.trim())
        if (e.key === 'Escape') onDone(initial)
      }}
      className="h-7 min-w-0 flex-1 rounded-md border border-accent-text bg-surface px-2 text-[13px] font-semibold outline-none"
    />
  )
}
