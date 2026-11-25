// "Sign in with Google" for a desktop app: OAuth 2.0 with PKCE and a loopback redirect (RFC 8252).
// Google doesn't allow sign-in inside embedded web views, so the consent page opens in the user's
// browser and Google redirects back to a one-off server on 127.0.0.1. Only the profile (name,
// email, photo) is kept; no tokens are stored, because the app only needs to know who you are.
import { createServer } from 'node:http'
import type { AddressInfo } from 'node:net'
import { createHash, randomBytes } from 'node:crypto'
import { app, BrowserWindow, shell } from 'electron'
import type { Account } from '@shared/types'
import { messages, type Messages } from '@shared/i18n'
import { getLanguage, setAccount } from './repo'

interface Config {
  clientId: string
  clientSecret: string
  authorize: string
  token: string
  userinfo: string
}

const TIMEOUT_MS = 5 * 60_000

/**
 * Client id and secret come from .env.local at build time (see .env.example). For a desktop app
 * Google doesn't treat the secret as confidential; it just mustn't be committed to git.
 * In development, DASH_AUTH_TEST (JSON) can override any of these, to test against a fake Google.
 */
function config(): Config {
  const base: Config = {
    clientId: import.meta.env.MAIN_VITE_GOOGLE_CLIENT_ID ?? '',
    clientSecret: import.meta.env.MAIN_VITE_GOOGLE_CLIENT_SECRET ?? '',
    authorize: 'https://accounts.google.com/o/oauth2/v2/auth',
    token: 'https://oauth2.googleapis.com/token',
    userinfo: 'https://openidconnect.googleapis.com/v1/userinfo'
  }
  if (app.isPackaged || !process.env.DASH_AUTH_TEST) return base
  try {
    return { ...base, ...JSON.parse(process.env.DASH_AUTH_TEST) }
  } catch {
    return base
  }
}

function base64url(buf: Buffer): string {
  return buf.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

/** The sign-in in progress, so it can be cancelled. Only one at a time. */
let pending: { cancel: () => void } | null = null

export function cancelSignIn(): void {
  pending?.cancel()
}

export function signIn(): Promise<Account> {
  const t = messages(getLanguage())
  const cfg = config()
  if (!cfg.clientId || !cfg.clientSecret) return Promise.reject(new Error(t.auth.notConfigured))
  if (pending) return Promise.reject(new Error(t.auth.inProgress))

  const verifier = base64url(randomBytes(32))
  const challenge = base64url(createHash('sha256').update(verifier).digest())
  const state = base64url(randomBytes(16))

  return new Promise<Account>((resolve, reject) => {
    const server = createServer()
    let redirectUri = ''
    let done = false

    const finish = (err: Error | null, account?: Account): void => {
      if (done) return
      done = true
      clearTimeout(timer)
      pending = null
      server.close()
      bringAppToFront()
      if (err) reject(err)
      else resolve(account!)
    }
    const timer = setTimeout(() => finish(new Error(t.auth.timeout)), TIMEOUT_MS)
    pending = { cancel: () => finish(new Error(t.auth.cancelled)) }

    server.on('request', async (req, res) => {
      const url = new URL(req.url ?? '/', 'http://127.0.0.1')
      if (url.pathname !== '/') {
        res.writeHead(404).end()
        return
      }
      const reply = (ok: boolean, text: string): void => {
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' })
        res.end(resultPage(t, ok, text))
      }
      try {
        const q = url.searchParams
        if (q.get('state') !== state) throw new Error(t.auth.failed)
        if (q.get('error')) throw new Error(q.get('error') === 'access_denied' ? t.auth.denied : t.auth.failed)
        const code = q.get('code')
        if (!code) throw new Error(t.auth.failed)
        const account = await fetchAccount(cfg, t, code, verifier, redirectUri)
        setAccount(account)
        reply(true, t.auth.doneBody)
        finish(null, account)
      } catch (err) {
        const error = err instanceof Error ? err : new Error(t.auth.failed)
        reply(false, error.message)
        finish(error)
      }
    })
    server.on('error', () => finish(new Error(t.auth.failed)))

    server.listen(0, '127.0.0.1', () => {
      redirectUri = `http://127.0.0.1:${(server.address() as AddressInfo).port}`
      const auth = new URL(cfg.authorize)
      auth.search = new URLSearchParams({
        client_id: cfg.clientId,
        redirect_uri: redirectUri,
        response_type: 'code',
        scope: 'openid email profile',
        code_challenge: challenge,
        code_challenge_method: 'S256',
        state,
        prompt: 'select_account'
      }).toString()
      shell.openExternal(auth.toString()).catch(() => finish(new Error(t.auth.failed)))
    })
  })
}

/** Swaps the one-time code for an access token, then reads the Google profile with it. */
async function fetchAccount(
  cfg: Config,
  t: Messages,
  code: string,
  verifier: string,
  redirectUri: string
): Promise<Account> {
  const tokenRes = await fetch(cfg.token, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      code_verifier: verifier,
      client_id: cfg.clientId,
      client_secret: cfg.clientSecret,
      redirect_uri: redirectUri
    })
  })
  const token = (await tokenRes.json().catch(() => ({}))) as { access_token?: string }
  if (!tokenRes.ok || !token.access_token) throw new Error(t.auth.failed)

  const infoRes = await fetch(cfg.userinfo, {
    headers: { Authorization: `Bearer ${token.access_token}` }
  })
  const info = (await infoRes.json().catch(() => ({}))) as Record<string, unknown>
  if (!infoRes.ok) throw new Error(t.auth.failed)
  const text = (v: unknown): string => (typeof v === 'string' ? v : '')
  return {
    name: text(info.name) || text(info.email),
    givenName: text(info.given_name),
    email: text(info.email),
    picture: text(info.picture)
  }
}

function bringAppToFront(): void {
  const win = BrowserWindow.getAllWindows()[0]
  if (!win) return
  if (win.isMinimized()) win.restore()
  win.focus()
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`)
}

/** The page shown in the browser tab after Google redirects back. */
function resultPage(t: Messages, ok: boolean, text: string): string {
  const title = ok ? t.auth.doneTitle : t.auth.failedTitle
  return `<!doctype html><html><head><meta charset="utf-8"><title>Dashprocess</title>
<style>
  body{margin:0;min-height:100vh;display:grid;place-items:center;font:15px system-ui,sans-serif;background:#f6f7f9;color:#1f2329}
  @media (prefers-color-scheme:dark){body{background:#1d2129;color:#e8ebf1}}
  main{text-align:center;max-width:420px;padding:24px}
  .logo{width:48px;height:48px;border-radius:12px;background:#facc15;color:#2b2f36;display:inline-grid;place-items:center;font:700 26px system-ui;margin-bottom:12px}
  h1{font-size:20px;margin:0 0 6px} p{margin:0;opacity:.75}
</style></head><body><main><div class="logo">D</div><h1>${escapeHtml(title)}</h1><p>${escapeHtml(text)}</p></main></body></html>`
}
