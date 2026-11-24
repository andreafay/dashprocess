import { useCallback, useMemo, useRef, useState } from 'react'
import {
  closestCenter,
  closestCorners,
  pointerWithin,
  type CollisionDetection,
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
  type UniqueIdentifier
} from '@dnd-kit/core'
import { arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable'
import { StageColumn } from './StageColumn'
import { ProcessCard } from './ProcessCard'
import { byPosition, isVisible, onBoard, useStore } from '@/store'
import { parseDndId as parseId } from '@/lib/dnd'

/** Visible process ids per stage id. */
type Columns = Record<number, number[]>

export function Board() {
  const stages = useStore((s) => s.stages)
  const processes = useStore((s) => s.processes)
  const search = useStore((s) => s.search)
  const filters = useStore((s) => s.filters)
  const filtersSidebar = useStore((s) => s.filtersSidebar)
  const showEnded = useStore((s) => s.showEnded)
  const moveProcess = useStore((s) => s.moveProcess)

  const columns = useMemo<Columns>(() => {
    const result: Columns = {}
    for (const st of stages) result[st.id] = []
    for (const p of byPosition(processes)) {
      if (isVisible(p, { search, filters, filtersSidebar, showEnded })) result[p.stageId]?.push(p.id)
    }
    return result
  }, [stages, processes, search, filters, filtersSidebar, showEnded])

  // While dragging, the board renders this local copy so cards can hop between columns.
  const [dragColumns, setDragColumns] = useState<Columns | null>(null)
  const [activeId, setActiveId] = useState<number | null>(null)
  const shown = dragColumns ?? columns
  const byId = useMemo(() => new Map(processes.map((p) => [p.id, p])), [processes])

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  // Prefer the card nearest the pointer inside the column under the pointer, so drops land
  // on a card (precise index) rather than on the column container.
  const shownRef = useRef(shown)
  shownRef.current = shown
  const collisionDetection = useCallback<CollisionDetection>((args) => {
    const column = pointerWithin(args).find((c) => parseId(c.id).kind === 's')
    if (!column) return closestCorners(args)
    const ids = shownRef.current[parseId(column.id).id] ?? []
    const cards = args.droppableContainers.filter((c) => {
      const parsed = parseId(c.id)
      return parsed.kind === 'p' && ids.includes(parsed.id)
    })
    return cards.length ? closestCenter({ ...args, droppableContainers: cards }) : [column]
  }, [])

  function findColumn(cols: Columns, dndId: UniqueIdentifier): number | undefined {
    const { kind, id } = parseId(dndId)
    if (kind === 's') return id
    const key = Object.keys(cols).find((k) => cols[Number(k)].includes(id))
    return key === undefined ? undefined : Number(key)
  }

  function onDragStart(e: DragStartEvent) {
    setActiveId(parseId(e.active.id).id)
    setDragColumns(columns)
  }

  function onDragOver({ active, over }: DragOverEvent) {
    if (!over || !dragColumns) return
    const from = findColumn(dragColumns, active.id)
    const to = findColumn(dragColumns, over.id)
    if (from === undefined || to === undefined || from === to) return

    const cardId = parseId(active.id).id
    setDragColumns((cols) => {
      if (!cols) return cols
      const target = cols[to].filter((id) => id !== cardId)
      const overParsed = parseId(over.id)
      let index = overParsed.kind === 'p' ? target.indexOf(overParsed.id) : target.length
      if (index < 0) index = target.length
      // Dropping on the lower half of a card puts it below that card.
      const activeRect = active.rect.current.translated
      if (overParsed.kind === 'p' && activeRect && activeRect.top > over.rect.top + over.rect.height / 2) {
        index += 1
      }
      target.splice(index, 0, cardId)
      return { ...cols, [from]: cols[from].filter((id) => id !== cardId), [to]: target }
    })
  }

  function onDragEnd({ active, over }: DragEndEvent) {
    const cols = dragColumns
    setActiveId(null)
    setDragColumns(null)
    if (!over || !cols) return

    const cardId = parseId(active.id).id
    const stageId = findColumn(cols, active.id)
    if (stageId === undefined) return

    let visible = cols[stageId]
    const overParsed = parseId(over.id)
    if (overParsed.kind === 'p' && overParsed.id !== cardId && visible.includes(overParsed.id)) {
      visible = arrayMove(visible, visible.indexOf(cardId), visible.indexOf(overParsed.id))
    }

    const original = byId.get(cardId)
    if (!original) return
    if (original.stageId === stageId && sameOrder(columns[stageId], visible)) return

    // Translate the position among visible cards into a position among all cards in the stage.
    const full = byPosition(processes.filter((p) => p.stageId === stageId && p.id !== cardId)).map(
      (p) => p.id
    )
    const i = visible.indexOf(cardId)
    const next = visible[i + 1]
    const prev = visible[i - 1]
    const index =
      next !== undefined
        ? full.indexOf(next)
        : prev !== undefined
          ? full.indexOf(prev) + 1
          : full.length
    moveProcess(cardId, stageId, index)
  }

  const active = activeId != null ? byId.get(activeId) : undefined

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={collisionDetection}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragEnd={onDragEnd}
      onDragCancel={() => {
        setActiveId(null)
        setDragColumns(null)
      }}
    >
      <div className="flex min-h-0 flex-1 gap-3.5 overflow-x-auto px-7 pb-6">
        {stages.map((stage) => (
          <StageColumn
            key={stage.id}
            stage={stage}
            processes={(shown[stage.id] ?? []).map((id) => byId.get(id)!).filter(Boolean)}
            totalCount={
              processes.filter((p) => p.stageId === stage.id && onBoard(p, showEnded)).length
            }
          />
        ))}
      </div>
      <DragOverlay dropAnimation={{ duration: 180, easing: 'cubic-bezier(0.2, 0, 0, 1)' }}>
        {active ? <ProcessCard process={active} overlay /> : null}
      </DragOverlay>
    </DndContext>
  )
}

function sameOrder(a: number[], b: number[]): boolean {
  return a.length === b.length && a.every((v, i) => v === b[i])
}
