import type { Process, Stage } from '@shared/types'
import { byPosition, isEnded } from '@/store'

/** The four tiles above the board. Each one opens the list of processes it counts. */
export const LIST_KINDS = ['active', 'offer', 'recent', 'ended'] as const
export type ListKind = (typeof LIST_KINDS)[number]

export interface StatLists {
  lists: Record<ListKind, Process[]>
  /** The board's last column, which the "At …" tile counts. */
  lastStage: Stage | undefined
}

/** Which processes each tile counts, already sorted for its list. The tiles show the lengths. */
export function statLists(processes: Process[], stages: Stage[]): StatLists {
  const stageOrder = new Map(stages.map((s, i) => [s.id, i]))
  const lastStage = stages[stages.length - 1]
  const active = byPosition(processes.filter((p) => !isEnded(p))).sort(
    (a, b) => (stageOrder.get(a.stageId) ?? 0) - (stageOrder.get(b.stageId) ?? 0)
  )
  const monthAgo = new Date(Date.now() - 30 * 86_400_000).toISOString().slice(0, 10)
  return {
    lastStage,
    lists: {
      active,
      offer: lastStage ? active.filter((p) => p.stageId === lastStage.id) : [],
      // Newest first.
      recent: processes
        .filter((p) => p.startDate && p.startDate >= monthAgo)
        .sort((a, b) => b.startDate!.localeCompare(a.startDate!) || b.id - a.id),
      // Most recently changed first, which is usually when it ended.
      ended: processes
        .filter(isEnded)
        .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt) || b.id - a.id)
    }
  }
}
