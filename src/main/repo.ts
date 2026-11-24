import { getDb, transaction } from './db'
import {
  COMPANY_TYPES,
  CURRENCIES,
  PAY_PERIODS,
  REGIONS,
  STATUSES,
  THEMES,
  type Process,
  type ProcessInput,
  type Stage,
  type Theme
} from '@shared/types'

// ---------- Stages ----------

interface StageRow {
  id: number
  name: string
  position: number
  color: string | null
}

export function listStages(): Stage[] {
  const rows = getDb()
    .prepare('SELECT id, name, position, color FROM stages ORDER BY position, id')
    .all() as unknown as StageRow[]
  return rows.map((r) => ({ ...r }))
}

export function createStage(name: string): Stage {
  const clean = requireText(name, 'Stage name')
  const db = getDb()
  const { next } = db
    .prepare('SELECT COALESCE(MAX(position), -1) + 1 AS next FROM stages')
    .get() as { next: number }
  const { lastInsertRowid } = db
    .prepare('INSERT INTO stages (name, position) VALUES (?, ?)')
    .run(clean, next)
  return { id: Number(lastInsertRowid), name: clean, position: next, color: null }
}

export function renameStage(id: number, name: string): void {
  getDb().prepare('UPDATE stages SET name = ? WHERE id = ?').run(requireText(name, 'Stage name'), id)
}

export function reorderStages(ids: number[]): void {
  const db = getDb()
  const existing = listStages().map((s) => s.id)
  if (ids.length !== existing.length || !existing.every((id) => ids.includes(id))) {
    throw new Error('Stage order must contain every stage exactly once')
  }
  const update = db.prepare('UPDATE stages SET position = ? WHERE id = ?')
  transaction(db, () => ids.forEach((id, i) => update.run(i, id)))
}

export function deleteStage(id: number, moveTo: number | null): void {
  const db = getDb()
  transaction(db, () => {
    const { total } = db.prepare('SELECT COUNT(*) AS total FROM stages').get() as { total: number }
    if (total <= 1) throw new Error('You need at least one stage')

    const { count } = db
      .prepare('SELECT COUNT(*) AS count FROM processes WHERE stage_id = ?')
      .get(id) as { count: number }
    if (count > 0) {
      if (moveTo == null || moveTo === id) {
        throw new Error('Choose a stage to move this stage’s processes to')
      }
      // Append the moved processes after the ones already in the target stage.
      const { base } = db
        .prepare('SELECT COALESCE(MAX(position), -1) + 1 AS base FROM processes WHERE stage_id = ?')
        .get(moveTo) as { base: number }
      db.prepare(
        `UPDATE processes SET stage_id = ?, position = position + ?, updated_at = datetime('now')
         WHERE stage_id = ?`
      ).run(moveTo, base, id)
    }
    db.prepare('DELETE FROM stages WHERE id = ?').run(id)
    renumber('stages', null)
  })
}

// ---------- Processes ----------

interface ProcessRow {
  id: number
  company: string
  role: string
  stage_id: number
  position: number
  status: Process['status']
  remote: number
  b2b: number
  company_type: Process['companyType']
  region: Process['region']
  start_date: string | null
  pay_min: number | null
  pay_max: number | null
  pay_currency: string
  pay_period: Process['payPeriod']
  notes: string
  job_url: string
  created_at: string
  updated_at: string
}

function toProcess(r: ProcessRow): Process {
  return {
    id: r.id,
    company: r.company,
    role: r.role,
    stageId: r.stage_id,
    position: r.position,
    status: r.status,
    remote: !!r.remote,
    b2b: !!r.b2b,
    companyType: r.company_type,
    region: r.region,
    startDate: r.start_date,
    payMin: r.pay_min,
    payMax: r.pay_max,
    payCurrency: r.pay_currency,
    payPeriod: r.pay_period,
    notes: r.notes,
    jobUrl: r.job_url,
    createdAt: r.created_at,
    updatedAt: r.updated_at
  }
}

export function listProcesses(): Process[] {
  const rows = getDb()
    .prepare('SELECT * FROM processes ORDER BY stage_id, position, id')
    .all() as unknown as ProcessRow[]
  return rows.map(toProcess)
}

function getProcess(id: number): Process {
  const row = getDb().prepare('SELECT * FROM processes WHERE id = ?').get(id) as
    | ProcessRow
    | undefined
  if (!row) throw new Error(`Process ${id} not found`)
  return toProcess(row)
}

export function createProcess(input: ProcessInput): Process {
  const p = validate(input)
  const db = getDb()
  const { next } = db
    .prepare('SELECT COALESCE(MAX(position), -1) + 1 AS next FROM processes WHERE stage_id = ?')
    .get(p.stageId) as { next: number }
  const { lastInsertRowid } = db
    .prepare(
      `INSERT INTO processes (company, role, stage_id, position, status, remote, b2b, company_type,
         region, start_date, pay_min, pay_max, pay_currency, pay_period, notes, job_url)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      p.company, p.role, p.stageId, next, p.status, +p.remote, +p.b2b, p.companyType,
      p.region, p.startDate, p.payMin, p.payMax, p.payCurrency, p.payPeriod, p.notes, p.jobUrl
    )
  return getProcess(Number(lastInsertRowid))
}

export function updateProcess(id: number, input: ProcessInput): Process {
  const p = validate(input)
  const db = getDb()
  transaction(db, () => {
    const current = getProcess(id)
    db.prepare(
      `UPDATE processes SET company = ?, role = ?, status = ?, remote = ?, b2b = ?, company_type = ?,
         region = ?, start_date = ?, pay_min = ?, pay_max = ?, pay_currency = ?, pay_period = ?,
         notes = ?, job_url = ?, updated_at = datetime('now')
       WHERE id = ?`
    ).run(
      p.company, p.role, p.status, +p.remote, +p.b2b, p.companyType, p.region, p.startDate,
      p.payMin, p.payMax, p.payCurrency, p.payPeriod, p.notes, p.jobUrl, id
    )
    // Changing the stage from the form puts the card at the end of the new column.
    if (current.stageId !== p.stageId) {
      const count = (
        db.prepare('SELECT COUNT(*) AS n FROM processes WHERE stage_id = ?').get(p.stageId) as {
          n: number
        }
      ).n
      moveInTx(id, p.stageId, count)
    }
  })
  return getProcess(id)
}

export function deleteProcess(id: number): void {
  const db = getDb()
  transaction(db, () => {
    const { stageId } = getProcess(id)
    db.prepare('DELETE FROM processes WHERE id = ?').run(id)
    renumber('processes', stageId)
  })
}

export function moveProcess(id: number, stageId: number, index: number): void {
  const db = getDb()
  transaction(db, () => moveInTx(id, stageId, index))
}

function moveInTx(id: number, stageId: number, index: number): void {
  const db = getDb()
  const from = getProcess(id).stageId
  if (!db.prepare('SELECT 1 FROM stages WHERE id = ?').get(stageId)) {
    throw new Error(`Stage ${stageId} not found`)
  }
  const ids = (
    db
      .prepare('SELECT id FROM processes WHERE stage_id = ? AND id != ? ORDER BY position, id')
      .all(stageId, id) as { id: number }[]
  ).map((r) => r.id)
  ids.splice(Math.max(0, Math.min(index, ids.length)), 0, id)

  const update = db.prepare(
    `UPDATE processes SET stage_id = ?, position = ?,
       updated_at = CASE WHEN stage_id != ? THEN datetime('now') ELSE updated_at END
     WHERE id = ?`
  )
  ids.forEach((pid, i) => update.run(stageId, i, stageId, pid))
  if (from !== stageId) renumber('processes', from)
}

/** Rewrites positions as 0..n-1, keeping the current order. */
function renumber(table: 'stages' | 'processes', stageId: number | null): void {
  const db = getDb()
  const rows = (
    table === 'stages'
      ? db.prepare('SELECT id FROM stages ORDER BY position, id').all()
      : db.prepare('SELECT id FROM processes WHERE stage_id = ? ORDER BY position, id').all(stageId)
  ) as { id: number }[]
  const update = db.prepare(`UPDATE ${table} SET position = ? WHERE id = ?`)
  rows.forEach((r, i) => update.run(i, r.id))
}

// ---------- Validation ----------

function requireText(value: unknown, label: string): string {
  const s = typeof value === 'string' ? value.trim() : ''
  if (!s) throw new Error(`${label} is required`)
  return s
}

function optionalAmount(value: unknown, label: string): number | null {
  if (value == null || value === '') return null
  const n = Number(value)
  if (!Number.isFinite(n) || n < 0) throw new Error(`${label} must be a positive number`)
  return Math.round(n)
}

function oneOf<T extends string>(value: unknown, allowed: readonly T[], label: string): T {
  if (!allowed.includes(value as T)) throw new Error(`Invalid ${label}`)
  return value as T
}

/** Empty, or an http(s) web address. "acme.com/jobs/1" is accepted as https://acme.com/jobs/1. */
function optionalUrl(value: unknown): string {
  const text = typeof value === 'string' ? value.trim() : ''
  if (!text) return ''
  const withScheme = /^[a-z][a-z0-9+.-]*:/i.test(text) ? text : `https://${text}`
  let url: URL
  try {
    url = new URL(withScheme)
  } catch {
    throw new Error('Job ad link must be a web address')
  }
  if ((url.protocol !== 'http:' && url.protocol !== 'https:') || !url.hostname.includes('.')) {
    throw new Error('Job ad link must be a web address')
  }
  return url.href
}

function validate(input: ProcessInput): ProcessInput {
  const payMin = optionalAmount(input.payMin, 'Minimum pay')
  const payMax = optionalAmount(input.payMax, 'Maximum pay')
  if (payMin != null && payMax != null && payMin > payMax) {
    throw new Error('Minimum pay can’t be higher than maximum pay')
  }
  const startDate = input.startDate || null
  if (startDate && !/^\d{4}-\d{2}-\d{2}$/.test(startDate)) throw new Error('Invalid start date')
  const stageId = Number(input.stageId)
  if (!getDb().prepare('SELECT 1 FROM stages WHERE id = ?').get(stageId)) {
    throw new Error('Choose a stage')
  }
  return {
    company: requireText(input.company, 'Company'),
    role: requireText(input.role, 'Role'),
    stageId,
    status: oneOf(input.status, STATUSES, 'status'),
    remote: !!input.remote,
    b2b: !!input.b2b,
    companyType: oneOf(input.companyType, COMPANY_TYPES, 'company type'),
    region: oneOf(input.region, REGIONS, 'region'),
    startDate,
    payMin,
    payMax,
    payCurrency: oneOf(input.payCurrency, CURRENCIES, 'currency'),
    payPeriod: oneOf(input.payPeriod, PAY_PERIODS, 'pay period'),
    notes: typeof input.notes === 'string' ? input.notes.trim() : '',
    jobUrl: optionalUrl(input.jobUrl)
  }
}

// ---------- Settings ----------

export function getTheme(): Theme {
  const row = getDb().prepare("SELECT value FROM settings WHERE key = 'theme'").get() as
    | { value: string }
    | undefined
  return THEMES.includes(row?.value as Theme) ? (row!.value as Theme) : 'system'
}

export function setTheme(theme: Theme): void {
  getDb()
    .prepare("INSERT INTO settings (key, value) VALUES ('theme', ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value")
    .run(oneOf(theme, THEMES, 'theme'))
}

export function getFiltersSidebar(): boolean {
  const row = getDb().prepare("SELECT value FROM settings WHERE key = 'filtersSidebar'").get() as
    | { value: string }
    | undefined
  return row?.value === '1'
}

export function setFiltersSidebar(on: boolean): void {
  getDb()
    .prepare("INSERT INTO settings (key, value) VALUES ('filtersSidebar', ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value")
    .run(on === true ? '1' : '0')
}
