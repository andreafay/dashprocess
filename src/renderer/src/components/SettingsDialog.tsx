import type { ReactNode } from 'react'
import { Dialog } from './ui/dialog'
import { Switch } from './ui/switch'
import { ThemeToggle } from './ThemeToggle'
import { LANGUAGE_NAMES, LANGUAGES } from '@shared/i18n'
import { Segmented } from './ui/segmented'
import { useStore } from '@/store'
import { useT } from '@/lib/i18n'

export function SettingsDialog() {
  const open = useStore((s) => s.settingsOpen)
  const openSettings = useStore((s) => s.openSettings)
  const filtersSidebar = useStore((s) => s.filtersSidebar)
  const setFiltersSidebar = useStore((s) => s.setFiltersSidebar)
  const showEnded = useStore((s) => s.showEnded)
  const setShowEnded = useStore((s) => s.setShowEnded)
  const language = useStore((s) => s.language)
  const setLanguage = useStore((s) => s.setLanguage)
  const t = useT()

  return (
    <Dialog open={open} onOpenChange={openSettings} title={t.settings.title} className="w-[480px]">
      <div className="flex flex-col divide-y divide-border rounded-xl border border-border">
        <Row title={t.settings.language}>
          <Segmented
            className="w-52"
            value={language}
            onChange={setLanguage}
            options={LANGUAGES.map((l) => ({ value: l, label: LANGUAGE_NAMES[l] }))}
          />
        </Row>
        <Row title={t.settings.theme}>
          <ThemeToggle />
        </Row>
        <Row title={t.settings.filtersSidebar} htmlFor="filters-sidebar">
          <Switch id="filters-sidebar" checked={filtersSidebar} onChange={setFiltersSidebar} />
        </Row>
        <Row title={t.settings.showEnded} htmlFor="show-ended">
          <Switch id="show-ended" checked={showEnded} onChange={setShowEnded} />
        </Row>
      </div>
    </Dialog>
  )
}

function Row({
  title,
  htmlFor,
  children
}: {
  title: string
  htmlFor?: string
  children: ReactNode
}) {
  return (
    <div className="flex min-h-14 items-center justify-between gap-4 px-4 py-2.5">
      <label htmlFor={htmlFor} className="min-w-0 text-[13.5px] font-medium text-fg">
        {title}
      </label>
      {children}
    </div>
  )
}
