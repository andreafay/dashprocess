import { useEffect, useMemo } from 'react'
import { AlertCircle, Briefcase, Columns3, Plus, Search, Settings, X } from 'lucide-react'
import { StatsBar } from './components/StatsBar'
import { Board } from './components/Board'
import { ProcessDialog } from './components/ProcessDialog'
import { StagesDialog } from './components/StagesDialog'
import { DeleteStageDialog } from './components/DeleteStageDialog'
import { Button } from './components/ui/button'
import { Input } from './components/ui/input'
import { SettingsDialog } from './components/SettingsDialog'
import { FiltersSidebar } from './components/FiltersSidebar'
import { activeFilterCount, isVisible, useStore } from './store'
import { useT } from './lib/i18n'

export default function App() {
  const t = useT()
  const load = useStore((s) => s.load)
  const loaded = useStore((s) => s.loaded)
  const processes = useStore((s) => s.processes)
  const search = useStore((s) => s.search)
  const setSearch = useStore((s) => s.setSearch)
  const openStagesDialog = useStore((s) => s.openStagesDialog)
  const openEditor = useStore((s) => s.openEditor)
  const openSettings = useStore((s) => s.openSettings)
  const filters = useStore((s) => s.filters)
  const filtersSidebar = useStore((s) => s.filtersSidebar)

  useEffect(() => {
    load()
  }, [load])

  const visibleCount = useMemo(
    () => processes.filter((p) => isVisible(p, { search, filters, filtersSidebar })).length,
    [processes, search, filters, filtersSidebar]
  )
  const narrowed = search.trim() !== '' || (filtersSidebar && activeFilterCount(filters) > 0)

  return (
    <div className="flex h-full flex-col">
      {/* Title bar: draggable, leaves room on the right for the window controls. */}
      <header className="drag flex h-10 shrink-0 items-center gap-2.5 pr-40 pl-7">
        <div className="flex size-5 items-center justify-center rounded-md bg-accent text-accent-fg">
          <Briefcase className="size-3" />
        </div>
        <span className="text-[13px] font-semibold tracking-tight text-muted">Dashprocess</span>
      </header>

      <div className="flex min-h-0 flex-1">
        {filtersSidebar && <FiltersSidebar />}
        <main className="flex min-w-0 flex-1 flex-col">
          <div className="flex items-end justify-between gap-4 px-7 pt-3 pb-5">
            <div>
              <h1 className="text-xl font-semibold tracking-tight text-fg">{t.app.pipeline}</h1>
              <p className="mt-0.5 text-[13px] text-muted">
                {loaded
                  ? narrowed
                    ? t.app.shown(visibleCount, processes.length)
                    : t.app.onBoard(visibleCount)
                  : t.app.loading}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative w-72">
                <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-subtle" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => e.key === 'Escape' && setSearch('')}
                  placeholder={t.app.search}
                  className="pl-9"
                />
              </div>
              <Button
                size="icon"
                className="size-9"
                onClick={() => openSettings(true)}
                aria-label={t.app.settings}
                title={t.app.settings}
              >
                <Settings />
              </Button>
              <Button onClick={() => openStagesDialog(true)}>
                <Columns3 />
                {t.app.manageStages}
              </Button>
              <Button variant="primary" onClick={() => openEditor({ mode: 'new' })}>
                <Plus />
                {t.app.newProcess}
              </Button>
            </div>
          </div>
          <StatsBar />
          {loaded && <Board />}
        </main>
      </div>

      <ProcessDialog />
      <StagesDialog />
      <DeleteStageDialog />
      <SettingsDialog />
      <Toast />
    </div>
  )
}

function Toast() {
  const toast = useStore((s) => s.toast)
  const clear = useStore((s) => s.clearToast)
  const t = useT()
  if (!toast) return null
  return (
    <div
      role="alert"
      className="animate-menu-in fixed right-5 bottom-5 z-[60] flex max-w-sm items-start gap-3 rounded-xl border border-border bg-surface px-4 py-3 shadow-[var(--shadow-lift)]"
    >
      <AlertCircle className="mt-0.5 size-4 shrink-0 text-danger" />
      <p className="text-[13px] text-fg">{toast}</p>
      <button onClick={clear} className="text-subtle hover:text-fg" aria-label={t.common.dismiss}>
        <X className="size-4" />
      </button>
    </div>
  )
}
