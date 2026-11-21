import { useState } from 'react'
import { Monitor, Moon, Sun, type LucideIcon } from 'lucide-react'
import type { Theme } from '@shared/types'
import { cn } from '@/lib/utils'
import { applyTheme } from '@/lib/theme'
import { useStore } from '@/store'

const OPTIONS: { value: Theme; label: string; icon: LucideIcon }[] = [
  { value: 'light', label: 'Light theme', icon: Sun },
  { value: 'dark', label: 'Dark theme', icon: Moon },
  { value: 'system', label: 'Match system theme', icon: Monitor }
]

/**
 * Applies the theme to the page right away, and saves it in the database. The main process
 * also sets nativeTheme.themeSource so the title bar buttons match.
 */
export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>(window.api.settings.initialTheme)
  const showError = useStore((s) => s.showError)

  function choose(next: Theme) {
    setTheme(next)
    applyTheme(next)
    window.api.settings.setTheme(next).catch(showError)
  }

  return (
    <div
      role="radiogroup"
      aria-label="Theme"
      className="inline-flex h-9 items-center rounded-lg border border-border bg-surface-2 p-0.5"
    >
      {OPTIONS.map(({ value, label, icon: Icon }) => (
        <button
          key={value}
          type="button"
          role="radio"
          aria-checked={theme === value}
          aria-label={label}
          title={label}
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
