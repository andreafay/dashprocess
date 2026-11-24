import { create } from 'zustand'
import {
  NO_FILTERS,
  type Filters,
  type Process,
  type ProcessInput,
  type Stage,
  type StagePreset,
  type Theme
} from '@shared/types'
import { isLanguage, MESSAGES, type Language } from '@shared/i18n'
import { applyTheme } from '@/lib/theme'
import { processTags } from '@/lib/tags'
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
  settingsOpen: boolean
  theme: Theme
  language: Language
  filtersSidebar: boolean
  filters: Filters

  load(): Promise<void>
  setSearch(search: string): void
  openSettings(open: boolean): void
  setTheme(theme: Theme): void
  setLanguage(language: Language): void
  setFiltersSidebar(on: boolean): void
  setFilter<K extends keyof Filters>(key: K, value: Filters[K]): void
  clearFilters(): void
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

  createStage(name: string, preset: StagePreset | null): Promise<void>
  renameStage(id: number, name: string): Promise<void>
  resetStageName(id: number): Promise<void>
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

  /**
   * Saves a setting in the background. Any failure, even a synchronous one, becomes a toast:
   * these run inside UI event handlers, where a thrown error would take the whole page down.
   */
  function save(fn: () => Promise<unknown>): void {
    Promise.resolve()
      .then(fn)
      .catch((err) => get().showError(err))
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
    settingsOpen: false,
    theme: window.api.settings.initialTheme,
    language: isLanguage(window.api.settings.initialLanguage)
      ? window.api.settings.initialLanguage
      : 'en',
    filtersSidebar: window.api.settings.initialFiltersSidebar === true,
    // `??` guards against a preload from before filters were saved (a stale `npm run dev`).
    filters: window.api.settings.initialFilters ?? NO_FILTERS,

    load: () => run(reload).then(() => {}),
    setSearch: (search) => set({ search }),
    openSettings: (open) => set({ settingsOpen: open }),
    // Applies the theme right away and saves it. The main process also sets
    // nativeTheme.themeSource so the title bar buttons match.
    setTheme: (theme) => {
      set({ theme })
      applyTheme(theme)
      save(() => window.api.settings.setTheme(theme))
    },
    setLanguage: (language) => {
      set({ language })
      document.documentElement.lang = language
      save(() => window.api.settings.setLanguage(language))
    },
    setFiltersSidebar: (on) => {
      set({ filtersSidebar: on })
      save(() => window.api.settings.setFiltersSidebar(on))
    },
    setFilter: (key, value) => {
      const filters = { ...get().filters, [key]: value }
      set({ filters })
      save(() => window.api.settings.setFilters(filters))
    },
    clearFilters: () => {
      set({ filters: NO_FILTERS })
      save(() => window.api.settings.setFilters(NO_FILTERS))
    },
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

    createStage: (name, preset) =>
      run(async () => {
        await window.api.stages.create(name, preset)
        await reload()
      }).then(() => {}),

    renameStage: async (id, name) => {
      // Show the new name right away; the reload then picks up whether a preset name was restored.
      set((s) => ({
        stages: s.stages.map((st) => (st.id === id ? { ...st, name, renamed: true } : st))
      }))
      await run(async () => {
        await window.api.stages.rename(id, name)
        await reload()
      })
    },

    resetStageName: (id) =>
      run(async () => {
        await window.api.stages.resetName(id)
        await reload()
      }).then(() => {}),

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
/**
 * Every typed word must appear somewhere in the card: company, role, notes, a badge label
 * (Product, B2B, Remote, Italian…) or the status. "product remote" finds remote product jobs.
 */
export function matchesSearch(p: Process, search: string): boolean {
  const words = search.toLowerCase().split(/\s+/).filter(Boolean)
  if (words.length === 0) return true
  // Badge and status words match in every language, so "consulting" and "consulenza" both work.
  const text = [
    p.company,
    p.role,
    p.notes,
    p.status,
    ...Object.values(MESSAGES).flatMap((m) => [
      m.status[p.status],
      ...processTags(p, m).map((t) => t.label)
    ]),
    p.remote ? '' : 'onsite'
  ]
    .join(' ')
    .toLowerCase()
  return words.every((w) => text.includes(w))
}

export type { Filters }

export function matchesFilters(p: Process, f: Filters): boolean {
  if (f.status === 'active' && isEnded(p)) return false
  if (f.status === 'ended' && !isEnded(p)) return false
  if (f.workplace !== 'any' && p.remote !== (f.workplace === 'remote')) return false
  if (f.contract !== 'any' && p.b2b !== (f.contract === 'b2b')) return false
  if (f.companyType !== 'any' && p.companyType !== f.companyType) return false
  if (f.region !== 'any' && p.region !== f.region) return false
  return true
}

export function activeFilterCount(f: Filters): number {
  return Object.values(f).filter((v) => v !== 'any').length
}

/** Whether a card is shown on the board. Filters only apply while the sidebar is open. */
export function isVisible(
  p: Process,
  s: Pick<State, 'search' | 'filters' | 'filtersSidebar'>
): boolean {
  return matchesSearch(p, s.search) && (!s.filtersSidebar || matchesFilters(p, s.filters))
}
