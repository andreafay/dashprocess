import { create } from 'zustand'
import type { Process, ProcessInput, Stage } from '@shared/types'
import { errorMessage } from '@/lib/utils'

/** What the process dialog is showing: nothing, a new process (optionally in a stage), or an existing one. */
export type Editing = null | { mode: 'new'; stageId?: number } | { mode: 'edit'; id: number }

interface State {
  stages: Stage[]
  processes: Process[]
  loaded: boolean
  search: string
  editing: Editing
  stagesDialogOpen: boolean
  deletingStageId: number | null
  toast: string | null

  load(): Promise<void>
  setSearch(search: string): void
  openEditor(editing: Editing): void
  openStagesDialog(open: boolean): void
  askDeleteStage(id: number | null): void
  showError(err: unknown): void
  clearToast(): void

  createProcess(input: ProcessInput): Promise<boolean>
  updateProcess(id: number, input: ProcessInput): Promise<boolean>
  deleteProcess(id: number): Promise<void>
  /** `index` is the position among ALL processes of the target stage, not just the visible ones. */
  moveProcess(id: number, stageId: number, index: number): Promise<void>

  createStage(name: string): Promise<void>
  renameStage(id: number, name: string): Promise<void>
  reorderStages(ids: number[]): Promise<void>
  deleteStage(id: number, moveTo: number | null): Promise<void>
}

let toastTimer: ReturnType<typeof setTimeout> | undefined

export const useStore = create<State>((set, get) => {
  async function reload(): Promise<void> {
    const [stages, processes] = await Promise.all([
      window.api.stages.list(),
      window.api.processes.list()
    ])
    set({ stages, processes, loaded: true })
  }

  /** Runs an API call; on failure shows the error and reloads so the UI matches the database. */
  async function run(fn: () => Promise<unknown>): Promise<boolean> {
    try {
      await fn()
      return true
    } catch (err) {
      get().showError(err)
      await reload().catch(() => {})
      return false
    }
  }

  return {
    stages: [],
    processes: [],
    loaded: false,
    search: '',
    editing: null,
    stagesDialogOpen: false,
    deletingStageId: null,
    toast: null,

    load: () => run(reload).then(() => {}),
    setSearch: (search) => set({ search }),
    openEditor: (editing) => set({ editing }),
    openStagesDialog: (open) => set({ stagesDialogOpen: open }),
    askDeleteStage: (id) => set({ deletingStageId: id }),
    showError: (err) => {
      clearTimeout(toastTimer)
      set({ toast: errorMessage(err) })
      toastTimer = setTimeout(() => set({ toast: null }), 5000)
    },
    clearToast: () => set({ toast: null }),

    createProcess: (input) =>
      run(async () => {
        const created = await window.api.processes.create(input)
        set((s) => ({ processes: [...s.processes, created] }))
      }),

    updateProcess: (id, input) =>
      run(async () => {
        const stageChanged = get().processes.find((p) => p.id === id)?.stageId !== input.stageId
        const updated = await window.api.processes.update(id, input)
        if (stageChanged) await reload()
        else set((s) => ({ processes: s.processes.map((p) => (p.id === id ? updated : p)) }))
      }),

    deleteProcess: (id) =>
      run(async () => {
        await window.api.processes.remove(id)
        await reload()
      }).then(() => {}),

    moveProcess: async (id, stageId, index) => {
      // Update the board right away, then save.
      set((s) => ({ processes: applyMove(s.processes, id, stageId, index) }))
      await run(() => window.api.processes.move(id, stageId, index))
    },

    createStage: (name) =>
      run(async () => {
        await window.api.stages.create(name)
        await reload()
      }).then(() => {}),

    renameStage: async (id, name) => {
      set((s) => ({ stages: s.stages.map((st) => (st.id === id ? { ...st, name } : st)) }))
      await run(() => window.api.stages.rename(id, name))
    },

    reorderStages: async (ids) => {
      set((s) => ({
        stages: ids.map((id, i) => ({ ...s.stages.find((st) => st.id === id)!, position: i }))
      }))
      await run(() => window.api.stages.reorder(ids))
    },

    deleteStage: (id, moveTo) =>
      run(async () => {
        await window.api.stages.remove(id, moveTo)
        await reload()
      }).then(() => {})
  }
})

/** Same ordering logic as the main process's moveProcess, applied to local state. */
function applyMove(all: Process[], id: number, stageId: number, index: number): Process[] {
  const moving = all.find((p) => p.id === id)
  if (!moving) return all
  const target = byPosition(all.filter((p) => p.stageId === stageId && p.id !== id))
  target.splice(Math.max(0, Math.min(index, target.length)), 0, { ...moving, stageId })
  const positions = new Map<number, number>(target.map((p, i) => [p.id, i]))
  if (moving.stageId !== stageId) {
    byPosition(all.filter((p) => p.stageId === moving.stageId && p.id !== id)).forEach((p, i) =>
      positions.set(p.id, i)
    )
  }
  return all.map((p) => {
    const position = positions.get(p.id)
    if (position === undefined) return p
    return { ...p, position, stageId: p.id === id ? stageId : p.stageId }
  })
}

export function byPosition<T extends { position: number; id: number }>(list: T[]): T[] {
  return [...list].sort((a, b) => a.position - b.position || a.id - b.id)
}

export function isEnded(p: Process): boolean {
  return p.status !== 'active'
}

/** Ended (rejected/withdrawn) processes stay on the board, shown faded. */
export function matchesSearch(p: Process, search: string): boolean {
  const q = search.trim().toLowerCase()
  return !q || `${p.company} ${p.role} ${p.notes}`.toLowerCase().includes(q)
}
