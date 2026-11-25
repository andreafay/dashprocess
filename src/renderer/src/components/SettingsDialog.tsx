import { useState, type ReactNode } from 'react'
import { Button } from './ui/button'
import { avatarColor, initials } from './ProcessCard'
import { cn } from '@/lib/utils'
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
  const showStats = useStore((s) => s.showStats)
  const setShowStats = useStore((s) => s.setShowStats)
  const language = useStore((s) => s.language)
  const setLanguage = useStore((s) => s.setLanguage)
  const t = useT()

  return (
    <Dialog open={open} onOpenChange={openSettings} title={t.settings.title} className="w-[480px]">
      <div className="flex flex-col divide-y divide-border rounded-xl border border-border">
        <AccountRow />
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
        <Row title={t.settings.showStats} htmlFor="show-stats">
          <Switch id="show-stats" checked={showStats} onChange={setShowStats} />
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

/** Signed out: a Google sign-in button. Signed in: photo, name, email and Sign out. */
function AccountRow() {
  const account = useStore((s) => s.account)
  const signingIn = useStore((s) => s.signingIn)
  const signIn = useStore((s) => s.signIn)
  const cancelSignIn = useStore((s) => s.cancelSignIn)
  const signOut = useStore((s) => s.signOut)
  const t = useT()
  const [photoFailed, setPhotoFailed] = useState(false)

  if (account) {
    return (
      <div className="flex min-h-14 items-center gap-3 px-4 py-2.5">
        {account.picture && !photoFailed ? (
          <img
            src={account.picture}
            alt=""
            referrerPolicy="no-referrer"
            onError={() => setPhotoFailed(true)}
            className="size-9 shrink-0 rounded-full"
          />
        ) : (
          <div
            className={cn(
              'flex size-9 shrink-0 items-center justify-center rounded-full text-[12px] font-semibold text-white',
              avatarColor(account.name)
            )}
          >
            {initials(account.name)}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <div className="truncate text-[13.5px] font-medium text-fg">{account.name}</div>
          <div className="truncate text-[12.5px] text-muted">{account.email}</div>
        </div>
        <Button size="sm" onClick={signOut}>
          {t.settings.signOut}
        </Button>
      </div>
    )
  }

  return (
    <Row title={t.settings.account}>
      {signingIn ? (
        <div className="flex items-center gap-2">
          <span className="text-[12.5px] text-muted">{t.settings.signingIn}</span>
          <Button size="sm" onClick={cancelSignIn}>
            {t.common.cancel}
          </Button>
        </div>
      ) : (
        <Button size="sm" onClick={signIn}>
          <GoogleLogo />
          {t.settings.signIn}
        </Button>
      )}
    </Row>
  )
}

/** The multicolour Google "G", as used on Sign in with Google buttons. */
function GoogleLogo() {
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
    </svg>
  )
}

