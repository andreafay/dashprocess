export const STATUSES = ['active', 'rejected', 'withdrawn'] as const
export type Status = (typeof STATUSES)[number]

export const REGIONS = ['italian', 'european'] as const
export type Region = (typeof REGIONS)[number]

export const COMPANY_TYPES = ['consulting', 'product'] as const
export type CompanyType = (typeof COMPANY_TYPES)[number]

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
  }
}
