// Turns the logo SVGs into the app's icon files. Run with `npm run icons` after editing them.
//   resources/icon.ico  16–256px: the Windows window/taskbar icon, the .exe and the installer
//   resources/icon.png  512px: the window icon on other systems
// Small sizes come from versions drawn on a pixel grid, so they stay sharp in the taskbar:
//   icon-16.svg → 16 and 32px, icon-24.svg → 24 and 48px, icon.svg → everything larger.
// It runs inside Electron so Chromium does the rendering; no image tools need to be installed.
const { app, BrowserWindow } = require('electron')
const fs = require('node:fs')
const path = require('node:path')

const root = path.join(__dirname, '..')
const ICO_SIZES = [16, 24, 32, 48, 64, 128, 256]

const SOURCES = [
  { file: 'icon-16.svg', sizes: [16, 32] },
  { file: 'icon-24.svg', sizes: [24, 48] },
  { file: 'icon.svg', sizes: [64, 128, 256, 512] }
]

/** Renders one SVG at the given sizes in `win`; returns { size: PNG buffer }. */
async function render(win, svg, sizes) {
  const pngs = await win.webContents.executeJavaScript(`(async () => {
    const img = new Image()
    img.src = 'data:image/svg+xml;base64,' + ${JSON.stringify(Buffer.from(svg).toString('base64'))}
    await img.decode()
    const out = {}
    for (const s of ${JSON.stringify(sizes)}) {
      const c = document.createElement('canvas')
      c.width = c.height = s
      c.getContext('2d').drawImage(img, 0, 0, s, s)
      out[s] = c.toDataURL('image/png').split(',')[1]
    }
    return out
  })()`)
  return Object.fromEntries(Object.entries(pngs).map(([s, b64]) => [s, Buffer.from(b64, 'base64')]))
}

/** An .ico file holding PNG images, which Windows Vista and later read directly. */
function ico(images) {
  const header = Buffer.alloc(6)
  header.writeUInt16LE(1, 2) // type: icon
  header.writeUInt16LE(images.length, 4)
  let offset = 6 + 16 * images.length
  const entries = images.map(({ size, png }) => {
    const e = Buffer.alloc(16)
    e.writeUInt8(size >= 256 ? 0 : size, 0) // 0 means 256
    e.writeUInt8(size >= 256 ? 0 : size, 1)
    e.writeUInt16LE(1, 4) // colour planes
    e.writeUInt16LE(32, 6) // bits per pixel
    e.writeUInt32LE(png.length, 8)
    e.writeUInt32LE(offset, 12)
    offset += png.length
    return e
  })
  return Buffer.concat([header, ...entries, ...images.map((i) => i.png)])
}

app.whenReady().then(async () => {
  try {
    const win = new BrowserWindow({ show: false })
    await win.loadURL('about:blank')
    const pngs = {}
    for (const { file, sizes } of SOURCES) {
      const svg = fs.readFileSync(path.join(root, 'resources', file), 'utf8')
      Object.assign(pngs, await render(win, svg, sizes))
    }
    win.destroy()
    fs.writeFileSync(path.join(root, 'resources/icon.png'), pngs[512])
    fs.writeFileSync(
      path.join(root, 'resources/icon.ico'),
      ico(ICO_SIZES.map((size) => ({ size, png: pngs[size] })))
    )
    console.log('Wrote resources/icon.ico and resources/icon.png')
    app.exit(0)
  } catch (err) {
    console.error(err)
    app.exit(1)
  }
})
