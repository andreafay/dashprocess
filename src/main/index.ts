import { app, BrowserWindow, nativeTheme, shell } from 'electron'
import { join } from 'node:path'
import { registerIpc } from './ipc'
import { closeDb, getDb } from './db'
import { getLanguage, getTheme } from './repo'

// Must match --bg in src/renderer/src/index.css.
const BG = { light: '#f6f7f9', dark: '#1d2129' }

function overlayColors(): { color: string; symbolColor: string } {
  return nativeTheme.shouldUseDarkColors
    ? { color: BG.dark, symbolColor: '#c3cad6' }
    : { color: BG.light, symbolColor: '#334155' }
}

function createWindow(): void {
  const win = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 960,
    minHeight: 600,
    show: false,
    title: 'Dashprocess',
    backgroundColor: nativeTheme.shouldUseDarkColors ? BG.dark : BG.light,
    titleBarStyle: 'hidden',
    titleBarOverlay: { ...overlayColors(), height: 40 },
    autoHideMenuBar: true,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    }
  })

  const onThemeUpdated = (): void => {
    win.setTitleBarOverlay(overlayColors())
    win.setBackgroundColor(nativeTheme.shouldUseDarkColors ? BG.dark : BG.light)
  }
  nativeTheme.on('updated', onThemeUpdated)
  win.on('closed', () => nativeTheme.off('updated', onThemeUpdated))

  win.once('ready-to-show', () => win.show())

  // Open external links in the user's browser, never inside the app.
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (/^https?:\/\//.test(url)) shell.openExternal(url)
    return { action: 'deny' }
  })

  if (!app.isPackaged && process.env['ELECTRON_RENDERER_URL']) {
    win.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    win.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// Chromium's own UI (the date picker's calendar, for example) follows this switch. It must be set
// before the app is ready, so a language change applies to those parts after a restart.
app.commandLine.appendSwitch('lang', getLanguage() === 'it' ? 'it' : 'en-GB')

app.whenReady().then(() => {
  getDb()
  // Applying the saved theme here makes the renderer's prefers-color-scheme follow it.
  nativeTheme.themeSource = getTheme()
  registerIpc()
  createWindow()
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

app.on('will-quit', () => closeDb())
