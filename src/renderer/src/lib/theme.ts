import type { Theme } from '@shared/types'

const systemDark = window.matchMedia('(prefers-color-scheme: dark)')
let current: Theme = 'system'

function paint(): void {
  const dark = current === 'dark' || (current === 'system' && systemDark.matches)
  document.documentElement.dataset.theme = dark ? 'dark' : 'light'
}

// "System" follows Windows as it changes.
systemDark.addEventListener('change', () => current === 'system' && paint())

/** Sets <html data-theme>, which the CSS tokens and Tailwind's `dark:` variant read. */
export function applyTheme(theme: Theme): void {
  current = theme
  paint()
}
