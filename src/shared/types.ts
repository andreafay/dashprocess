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
  name: string
  position: number
  color: string | null
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
    create(name: string): Promise<Stage>
    rename(id: number, name: string): Promise<void>
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
    /** Saved sidebar filters, read synchronously so the board is filtered from the first paint. */
    initialFilters: Filters
    setFilters(filters: Filters): Promise<void>
  }
}
