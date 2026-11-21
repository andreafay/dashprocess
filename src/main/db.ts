import { DatabaseSync } from 'node:sqlite'
import { join } from 'node:path'
import { mkdirSync } from 'node:fs'
import { app } from 'electron'

const DEFAULT_STAGES = [
  'Screening',
  'Technical Interview',
  'Home Assignment',
  'Final Interview',
  'Offer'
]

/** Each entry upgrades the schema by one version. Never edit an entry once shipped; add a new one. */
const MIGRATIONS: ((db: DatabaseSync) => void)[] = [
  (db) => {
    db.exec(`
      CREATE TABLE stages (
        id         INTEGER PRIMARY KEY,
        name       TEXT    NOT NULL,
        position   INTEGER NOT NULL,
        color      TEXT,
        created_at TEXT    NOT NULL DEFAULT (datetime('now'))
      );
      CREATE TABLE processes (
        id           INTEGER PRIMARY KEY,
        company      TEXT    NOT NULL,
        role         TEXT    NOT NULL,
        stage_id     INTEGER NOT NULL REFERENCES stages(id),
        position     INTEGER NOT NULL,
        status       TEXT    NOT NULL DEFAULT 'active'
                     CHECK (status IN ('active', 'rejected', 'withdrawn')),
        remote       INTEGER NOT NULL DEFAULT 0,
        b2b          INTEGER NOT NULL DEFAULT 0,
        consulting   INTEGER NOT NULL DEFAULT 0,
        region       TEXT    NOT NULL CHECK (region IN ('italian', 'european')),
        start_date   TEXT,
        pay_min      INTEGER,
        pay_max      INTEGER,
        pay_currency TEXT    NOT NULL DEFAULT 'EUR',
        pay_period   TEXT    NOT NULL DEFAULT 'year'
                     CHECK (pay_period IN ('year', 'month', 'day', 'hour')),
        notes        TEXT    NOT NULL DEFAULT '',
        created_at   TEXT    NOT NULL DEFAULT (datetime('now')),
        updated_at   TEXT    NOT NULL DEFAULT (datetime('now'))
      );
      CREATE INDEX processes_stage ON processes (stage_id, position);
    `)
    const insert = db.prepare('INSERT INTO stages (name, position) VALUES (?, ?)')
    DEFAULT_STAGES.forEach((name, i) => insert.run(name, i))
  },
  (db) => {
    db.exec('CREATE TABLE settings (key TEXT PRIMARY KEY, value TEXT NOT NULL)')
  }
]

let db: DatabaseSync | null = null

export function getDb(): DatabaseSync {
  if (db) return db
  const dir = app.getPath('userData')
  mkdirSync(dir, { recursive: true })
  db = new DatabaseSync(join(dir, 'hpdashboard.db'))
  db.exec('PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;')
  migrate(db)
  return db
}

export function closeDb(): void {
  db?.close()
  db = null
}

function migrate(db: DatabaseSync): void {
  const { user_version: current } = db.prepare('PRAGMA user_version').get() as {
    user_version: number
  }
  for (let v = current; v < MIGRATIONS.length; v++) {
    transaction(db, () => {
      MIGRATIONS[v](db)
      db.exec(`PRAGMA user_version = ${v + 1}`)
    })
  }
}

export function transaction<T>(db: DatabaseSync, fn: () => T): T {
  db.exec('BEGIN')
  try {
    const result = fn()
    db.exec('COMMIT')
    return result
  } catch (err) {
    db.exec('ROLLBACK')
    throw err
  }
}
