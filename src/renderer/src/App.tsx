import { useEffect, useMemo } from 'react'
import { AlertCircle, Briefcase, Columns3, Plus, Search, X } from 'lucide-react'
import { StatsBar } from './components/StatsBar'
import { Board } from './components/Board'
import { ProcessDialog } from './components/ProcessDialog'
import { StagesDialog } from './components/StagesDialog'
import { DeleteStageDialog } from './components/DeleteStageDialog'
import { Button } from './components/ui/button'
import { Input } from './components/ui/input'
import { ThemeToggle } from './components/ThemeToggle'
import { matchesSearch, useStore } from './store'

export default function App() {
  const load = useStore((s) => s.load)
  const loaded = useStore((s) => s.loaded)
  const processes = useStore((s) => s.processes)
  const search = useStore((s) => s.search)
  const setSearch = useStore((s) => s.setSearch)
  const openStagesDialog = useStore((s) => s.openStagesDialog)
  const openEditor = useStore((s) => s.openEditor)

  useEffect(() => {
    load()
  }, [load])

  const visibleCount = useMemo(
    () => processes.filter((p) => matchesSearch(p, search)).length,
    [processes, search]
  )

  return (
    <div className="flex h-full">
      <main className="flex min-w-0 flex-1 flex-col">
        {/* Title bar: draggable, leaves room on the right for the window controls. */}
        <header className="drag flex h-10 shrink-0 items-center gap-2.5 pr-40 pl-7">
          <div className="flex size-5 items-center justify-center rounded-md bg-accent text-accent-fg">
            <Briefcase className="size-3" />
          </div>
          <span className="text-[13px] font-semibold tracking-tight text-muted">Dashprocess</span>
        </header>

        <div className="flex items-end justify-between gap-4 px-7 pt-3 pb-5">
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-fg">Hiring pipeline</h1>
            <p className="mt-0.5 text-[13px] text-muted">
              {loaded
                ? `${visibleCount} ${visibleCount === 1 ? 'process' : 'processes'}${search.trim() ? ' match your search' : ' on the board'}`
                : 'Loading…'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative w-72">
              <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-subtle" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Escape' && setSearch('')}
                placeholder="Search"
                className="pl-9"
              />
            </div>
            <ThemeToggle />
            <Button onClick={() => openStagesDialog(true)}>
              <Columns3 />
              Manage stages
            </Button>
            <Button variant="primary" onClick={() => openEditor({ mode: 'new' })}>
              <Plus />
              New process
            </Button>
          </div>
        </div>
        <StatsBar />
        {loaded && <Board />}
      </main>

      <ProcessDialog />
      <StagesDialog />
      <DeleteStageDialog />
      <Toast />
    </div>
  )
}

function Toast() {
  const toast = useStore((s) => s.toast)
  const clear = useStore((s) => s.clearToast)
  if (!toast) return null
  return (
    <div
      role="alert"
      className="animate-menu-in fixed right-5 bottom-5 z-[60] flex max-w-sm items-start gap-3 rounded-xl border border-border bg-surface px-4 py-3 shadow-[var(--shadow-lift)]"
    >
      <AlertCircle className="mt-0.5 size-4 shrink-0 text-danger" />
      <p className="text-[13px] text-fg">{toast}</p>
      <button onClick={clear} className="text-subtle hover:text-fg" aria-label="Dismiss">
        <X className="size-4" />
      </button>
    </div>
  )
}
