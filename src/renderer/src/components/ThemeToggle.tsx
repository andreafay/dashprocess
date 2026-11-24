import { Monitor, Moon, Sun, type LucideIcon } from 'lucide-react'
import type { Theme } from '@shared/types'
import { cn } from '@/lib/utils'
import { useStore } from '@/store'
import { useT } from '@/lib/i18n'

const OPTIONS: { value: Theme; label: 'light' | 'dark' | 'system'; icon: LucideIcon }[] = [
  { value: 'light', label: 'light', icon: Sun },
  { value: 'dark', label: 'dark', icon: Moon },
  { value: 'system', label: 'system', icon: Monitor }
]

export function ThemeToggle() {
  const theme = useStore((s) => s.theme)
  const choose = useStore((s) => s.setTheme)
  const t = useT()

  return (
    <div
      role="radiogroup"
      aria-label={t.settings.theme}
      className="inline-flex h-9 items-center rounded-lg border border-border bg-surface-2 p-0.5"
    >
      {OPTIONS.map(({ value, label, icon: Icon }) => (
        <button
          key={value}
          type="button"
          role="radio"
          aria-checked={theme === value}
          aria-label={t.settings[label]}
          title={t.settings[label]}
          onClick={() => choose(value)}
          className={cn(
            'flex h-full w-8 items-center justify-center rounded-md text-subtle transition-colors hover:text-fg',
            theme === value && 'bg-surface text-fg shadow-[var(--shadow-card)]'
          )}
        >
          <Icon className="size-4" />
        </button>
      ))}
    </div>
  )
}
