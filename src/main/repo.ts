import { getDb, transaction } from './db'
import {
  COMPANY_TYPES,
  CURRENCIES,
  FILTER_VALUES,
  NO_FILTERS,
  PAY_PERIODS,
  REGIONS,
  STAGE_PRESETS,
  STATUSES,
  THEMES,
  type Filters,
  type Process,
  type ProcessInput,
  type Stage,
  type StagePreset,
  type Theme
} from '@shared/types'
import { isLanguage, LANGUAGES, messages, type Language, type Messages } from '@shared/i18n'

// ---------- Stages ----------

interface StageRow {
  id: number
  name: string
  position: number
  color: string | null
  preset: StagePreset | null
  renamed: number
}

function toStage(r: StageRow): Stage {
  return { ...r, renamed: !!r.renamed }
}

export function listStages(): Stage[] {
  const rows = getDb()
    .prepare('SELECT id, name, position, color, preset, renamed FROM stages ORDER BY position, id')
    .all() as unknown as StageRow[]
  return rows.map(toStage)
}

export function createStage(name: string, preset: StagePreset | null): Stage {
  // A preset stage stores its English name too, so the column is never empty.
  const p = preset == null ? null : oneOf(preset, STAGE_PRESETS, t().errors.fields.stagePreset)
  const clean = p ? messages('en').stagePresets[p] : requireText(name, t().errors.fields.stageName)
  const db = getDb()
  const { next } = db
    .prepare('SELECT COALESCE(MAX(position), -1) + 1 AS next FROM stages')
    .get() as { next: number }
  const { lastInsertRowid } = db
    .prepare('INSERT INTO stages (name, position, preset) VALUES (?, ?, ?)')
    .run(clean, next, p)
  return { id: Number(lastInsertRowid), name: clean, position: next, color: null, preset: p, renamed: false }
}

/**
 * A preset stage renamed to its own preset name (in any language) goes back to being translated;
 * any other name is kept exactly as typed.
 */
export function renameStage(id: number, name: string): void {
  const clean = requireText(name, t().errors.fields.stageName)
  const db = getDb()
  const row = db.prepare('SELECT preset FROM stages WHERE id = ?').get(id) as
    | { preset: StagePreset | null }
    | undefined
  if (!row) throw new Error(t().errors.stageNotFound(id))
  const isPresetName =
    row.preset != null &&
    LANGUAGES.some((l) => messages(l).stagePresets[row.preset!].toLowerCase() === clean.toLowerCase())
  db.prepare('UPDATE stages SET name = ?, renamed = ? WHERE id = ?').run(
    isPresetName ? messages('en').stagePresets[row.preset!] : clean,
    isPresetName ? 0 : 1,
    id
  )
}

export function resetStageName(id: number): void {
  const db = getDb()
  const row = db.prepare('SELECT preset FROM stages WHERE id = ?').get(id) as
    | { preset: StagePreset | null }
    | undefined
  if (!row) throw new Error(t().errors.stageNotFound(id))
  if (!row.preset) return
  db.prepare('UPDATE stages SET name = ?, renamed = 0 WHERE id = ?').run(
    messages('en').stagePresets[row.preset],
    id
  )
}

export function reorderStages(ids: number[]): void {
  const db = getDb()
  const existing = listStages().map((s) => s.id)
  if (ids.length !== existing.length || !existing.every((id) => ids.includes(id))) {
    throw new Error(t().errors.stageOrder)
  }
  const update = db.prepare('UPDATE stages SET position = ? WHERE id = ?')
  transaction(db, () => ids.forEach((id, i) => update.run(i, id)))
}

export function deleteStage(id: number, moveTo: number | null): void {
  const db = getDb()
  transaction(db, () => {
    const { total } = db.prepare('SELECT COUNT(*) AS total FROM stages').get() as { total: number }
    if (total <= 1) throw new Error(t().errors.lastStage)

    const { count } = db
      .prepare('SELECT COUNT(*) AS count FROM processes WHERE stage_id = ?')
      .get(id) as { count: number }
    if (count > 0) {
      if (moveTo == null || moveTo === id) {
        throw new Error(t().errors.moveTarget)
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
  if (!row) throw new Error(t().errors.processNotFound(id))
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
    throw new Error(t().errors.stageNotFound(stageId))
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

/** Error texts in the language the user picked. */
function t(): Messages {
  return messages(getLanguage())
}

function requireText(value: unknown, label: string): string {
  const s = typeof value === 'string' ? value.trim() : ''
  if (!s) throw new Error(t().errors.required(label))
  return s
}

function optionalAmount(value: unknown, label: string): number | null {
  if (value == null || value === '') return null
  const n = Number(value)
  if (!Number.isFinite(n) || n < 0) throw new Error(t().errors.positive(label))
  return Math.round(n)
}

function oneOf<T extends string>(value: unknown, allowed: readonly T[], label: string): T {
  if (!allowed.includes(value as T)) throw new Error(t().errors.invalid(label))
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
    throw new Error(t().errors.jobUrl)
  }
  if ((url.protocol !== 'http:' && url.protocol !== 'https:') || !url.hostname.includes('.')) {
    throw new Error(t().errors.jobUrl)
  }
  return url.href
}

function validate(input: ProcessInput): ProcessInput {
  const payMin = optionalAmount(input.payMin, t().errors.fields.minPay)
  const payMax = optionalAmount(input.payMax, t().errors.fields.maxPay)
  if (payMin != null && payMax != null && payMin > payMax) {
    throw new Error(t().errors.payRange)
  }
  const startDate = input.startDate || null
  if (startDate && !/^\d{4}-\d{2}-\d{2}$/.test(startDate)) throw new Error(t().errors.startDate)
  const stageId = Number(input.stageId)
  if (!getDb().prepare('SELECT 1 FROM stages WHERE id = ?').get(stageId)) {
    throw new Error(t().errors.chooseStage)
  }
  return {
    company: requireText(input.company, t().errors.fields.company),
    role: requireText(input.role, t().errors.fields.role),
    stageId,
    status: oneOf(input.status, STATUSES, t().errors.fields.status),
    remote: !!input.remote,
    b2b: !!input.b2b,
    companyType: oneOf(input.companyType, COMPANY_TYPES, t().errors.fields.companyType),
    region: oneOf(input.region, REGIONS, t().errors.fields.region),
    startDate,
    payMin,
    payMax,
    payCurrency: oneOf(input.payCurrency, CURRENCIES, t().errors.fields.currency),
    payPeriod: oneOf(input.payPeriod, PAY_PERIODS, t().errors.fields.payPeriod),
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
    .run(oneOf(theme, THEMES, t().errors.fields.theme))
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

/** Keeps only known filter keys with allowed values; anything else falls back to 'any'. */
function cleanFilters(value: unknown): Filters {
  const input = (value && typeof value === 'object' ? value : {}) as Record<string, unknown>
  const result = { ...NO_FILTERS } as Record<keyof Filters, string>
  for (const key of Object.keys(FILTER_VALUES) as (keyof Filters)[]) {
    const allowed: readonly string[] = FILTER_VALUES[key]
    if (typeof input[key] === 'string' && allowed.includes(input[key])) result[key] = input[key]
  }
  return result as Filters
}

export function getFilters(): Filters {
  const row = getDb().prepare("SELECT value FROM settings WHERE key = 'filters'").get() as
    | { value: string }
    | undefined
  try {
    return cleanFilters(row ? JSON.parse(row.value) : null)
  } catch {
    return { ...NO_FILTERS }
  }
}

export function setFilters(filters: Filters): void {
  getDb()
    .prepare("INSERT INTO settings (key, value) VALUES ('filters', ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value")
    .run(JSON.stringify(cleanFilters(filters)))
}

export function getLanguage(): Language {
  const row = getDb().prepare("SELECT value FROM settings WHERE key = 'language'").get() as
    | { value: string }
    | undefined
  return isLanguage(row?.value) ? row.value : 'en'
}

export function setLanguage(language: Language): void {
  if (!isLanguage(language)) throw new Error(t().errors.invalid(t().errors.fields.language))
  getDb()
    .prepare("INSERT INTO settings (key, value) VALUES ('language', ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value")
    .run(language)
}
