import type { Language } from './i18n'

/** Built-in stages. Their names come from the language files, so they are translated. */
export const STAGE_PRESETS = [
  'applied',
  'screening',
  'hr_interview',
  'technical_interview',
  'home_assignment',
  'final_interview',
  'reference_check',
  'offer'
] as const
export type StagePreset = (typeof STAGE_PRESETS)[number]

export const STATUSES = ['active', 'rejected', 'withdrawn'] as const
export type Status = (typeof STATUSES)[number]

export const REGIONS = ['italian', 'european'] as const
export type Region = (typeof REGIONS)[number]

export const COMPANY_TYPES = ['consulting', 'product'] as const
export type CompanyType = (typeof COMPANY_TYPES)[number]

/** Allowed values for each sidebar filter. 'any' means the filter is off. */
export const FILTER_VALUES = {
  status: ['any', 'active', 'ended'],
  workplace: ['any', 'remote', 'onsite'],
  contract: ['any', 'b2b', 'employee'],
  companyType: ['any', ...COMPANY_TYPES],
  region: ['any', ...REGIONS]
} as const

export type Filters = { [K in keyof typeof FILTER_VALUES]: (typeof FILTER_VALUES)[K][number] }

export const NO_FILTERS: Filters = {
  status: 'any',
  workplace: 'any',
  contract: 'any',
  companyType: 'any',
  region: 'any'
}

export const PAY_PERIODS = ['year', 'month', 'day', 'hour'] as const
export type PayPeriod = (typeof PAY_PERIODS)[number]

export const THEMES = ['system', 'light', 'dark'] as const
export type Theme = (typeof THEMES)[number]

export const CURRENCIES = ['EUR', 'USD', 'GBP', 'CHF'] as const

export interface Stage {
  id: number
  /** The name typed by the user. For a preset stage that hasn't been renamed, see `stageLabel`. */
  name: string
  position: number
  color: string | null
  /** Which built-in stage this is, or null for a stage with a custom name. */
  preset: StagePreset | null
  /** True when a preset stage was given its own name; then `name` is shown instead. */
  renamed: boolean
}

export interface ProcessInput {
  company: string
  role: string
  stageId: number
  status: Status
  remote: boolean
  b2b: boolean
  companyType: CompanyType
  region: Region
  startDate: string | null
  payMin: number | null
  payMax: number | null
  payCurrency: string
  payPeriod: PayPeriod
  notes: string
  /** Link to the job ad, or '' when there is none. */
  jobUrl: string
  /** Rejection feedback or reason for withdrawing; '' when none. Kept if the status goes back to active. */
  endReason: string
}

export interface Process extends ProcessInput {
  id: number
  position: number
  createdAt: string
  updatedAt: string
}

export interface Api {
  stages: {
    list(): Promise<Stage[]>
    /** Adds a preset stage (`preset` set, `name` ignored) or a custom one (`preset` null). */
    create(name: string, preset: StagePreset | null): Promise<Stage>
    rename(id: number, name: string): Promise<void>
    /** Gives a renamed preset stage back its translated name. */
    resetName(id: number): Promise<void>
    reorder(ids: number[]): Promise<void>
    /** Deletes a stage. If it has processes, they are moved to `moveTo` first. */
    remove(id: number, moveTo: number | null): Promise<void>
  }
  processes: {
    list(): Promise<Process[]>
    create(input: ProcessInput): Promise<Process>
    update(id: number, input: ProcessInput): Promise<Process>
    remove(id: number): Promise<void>
    /** Moves a process to `stageId` at `index` within that stage. */
    move(id: number, stageId: number, index: number): Promise<void>
  }
  settings: {
    /** Saved theme, read synchronously when the window loads so the first paint is right. */
    initialTheme: Theme
    getTheme(): Promise<Theme>
    setTheme(theme: Theme): Promise<void>
    /** Whether the filters sidebar is shown, read synchronously like the theme. Off by default. */
    initialFiltersSidebar: boolean
    setFiltersSidebar(on: boolean): Promise<void>
    /** Whether rejected and withdrawn processes are shown on the board. Off by default. */
    initialShowEnded: boolean
    setShowEnded(on: boolean): Promise<void>
    /** Whether the summary counters above the board are shown. On by default. */
    initialShowStats: boolean
    setShowStats(on: boolean): Promise<void>
    /** Saved sidebar filters, read synchronously so the board is filtered from the first paint. */
    initialFilters: Filters
    setFilters(filters: Filters): Promise<void>
    /** Interface language, read synchronously so the first paint is in the right language. */
    initialLanguage: Language
    setLanguage(language: Language): Promise<void>
  }
}
