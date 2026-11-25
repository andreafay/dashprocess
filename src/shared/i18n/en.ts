/**
 * English texts. This file defines the shape every language must match (see `Messages`), so a
 * missing Italian entry is a type error. Texts that depend on a number are small functions.
 */
export const en = {
  common: {
    cancel: 'Cancel',
    close: 'Close',
    dismiss: 'Dismiss',
    done: 'Done',
    add: 'Add'
  },

  app: {
    pipeline: 'Hiring pipeline',
    loading: 'Loading…',
    onBoard: (n: number) => `${n} ${n === 1 ? 'process' : 'processes'} on the board`,
    shown: (n: number, total: number) => `${n} of ${total} processes shown`,
    search: 'Search',
    settings: 'Settings',
    manageStages: 'Manage stages',
    newProcess: 'New process',
    /** Greeting for the signed-in user, by time of day. */
    greeting: {
      morning: (name: string) => `Good morning, ${name} 👋`,
      afternoon: (name: string) => `Good afternoon, ${name} 👋`,
      evening: (name: string) => `Good evening, ${name} 👋`,
      night: (name: string) => `Good night, ${name} 👋`
    }
  },

  stats: {
    active: 'Active processes',
    atStage: (stage: string) => `At ${stage}`,
    startedRecently: 'Started in last 30 days',
    ended: 'Ended',
    showList: 'Show the list'
  },

  processList: {
    titles: {
      active: 'Active processes',
      offer: (stage: string) => `At ${stage}`,
      recent: 'Started in the last 30 days',
      ended: 'Ended processes'
    },
    count: (n: number) => (n === 1 ? '1 process' : `${n} processes`),
    empty: 'No processes here yet.',
    lastStage: (stage: string) => `Last stage: ${stage}`,
    updated: (date: string) => `Updated ${date}`
  },

  status: {
    active: 'Active',
    rejected: 'Rejected',
    withdrawn: 'Withdrawn'
  },

  tags: {
    remote: 'Remote',
    onsite: 'On-site',
    b2b: 'B2B',
    employee: 'Employee',
    consulting: 'Consulting',
    product: 'Product',
    italian: 'Italian',
    european: 'European'
  },

  view: {
    edit: 'Edit',
    noNotes: 'No notes yet.',
    added: (date: string) => `Added ${date}`,
    updated: (date: string) => `updated ${date}`
  },

  card: {
    hasNotes: 'Has notes',
    endReason: (reason: string) => `Feedback: ${reason}`,
    openJobAd: 'Open job ad',
    openJobAdTitle: (url: string) => `Open job ad: ${url}`,
    started: (date: string) => `Started ${date}`
  },

  /** Short time since a date, shown on cards. */
  since: {
    today: 'today',
    days: (n: number) => `${n}d`,
    weeks: (n: number) => `${n}w`,
    months: (n: number) => `${n}mo`,
    inDays: (n: number) => `in ${n}d`
  },

  pay: {
    from: (amount: string) => `from ${amount}`,
    upTo: (amount: string) => `up to ${amount}`,
    periodShort: { year: 'yr', month: 'mo', day: 'day', hour: 'hr' },
    periodLabel: { year: 'per year', month: 'per month', day: 'per day', hour: 'per hour' }
  },

  stagePresets: {
    applied: 'Applied',
    screening: 'Screening',
    hr_interview: 'HR interview',
    technical_interview: 'Technical interview',
    home_assignment: 'Home assignment',
    final_interview: 'Final interview',
    reference_check: 'Reference check',
    offer: 'Offer'
  },

  column: {
    renameHint: 'Double-click to rename',
    options: (stage: string) => `${stage} options`,
    addHere: 'Add process here',
    rename: 'Rename stage',
    resetName: 'Reset to default name',
    delete: 'Delete stage',
    noMatches: 'No matches',
    dropHere: 'Drop a process here',
    addProcess: 'Add process'
  },

  stagesDialog: {
    title: 'Manage stages',
    description: 'Stages are the board’s columns. Drag to reorder, click a name to rename.',
    newStage: 'New stage name',
    addStage: 'Add a stage',
    custom: 'Or type a custom name',
    resetName: (stage: string) => `Reset ${stage} to its default name`,
    cards: (n: number) => `${n} ${n === 1 ? 'card' : 'cards'}`,
    reorder: (stage: string) => `Reorder ${stage}`,
    delete: (stage: string) => `Delete ${stage}`
  },

  deleteStage: {
    title: (stage: string) => `Delete “${stage}”?`,
    lastStage: 'The board needs at least one stage.',
    empty: 'This stage is empty. Deleting it can’t be undone.',
    hasProcesses: (n: number) =>
      n === 1
        ? 'This stage has 1 process. Choose where to move it.'
        : `This stage has ${n} processes. Choose where to move them.`,
    moveTo: 'Move processes to',
    confirm: 'Delete stage'
  },

  form: {
    newTitle: 'New process',
    editTitle: 'Edit process',
    newDescription: 'Track a new hiring process.',
    company: 'Company',
    companyPlaceholder: 'Acme Corp',
    role: 'Role',
    rolePlaceholder: 'Senior Backend Engineer',
    stage: 'Stage',
    status: 'Status',
    details: 'Details',
    remote: 'Remote',
    b2b: 'B2B',
    companyType: 'Company type',
    region: 'Region',
    startDate: 'Start date',
    pay: 'Pay',
    min: 'Min',
    max: 'Max',
    currency: 'Currency',
    period: 'Period',
    notes: 'Notes',
    notesPlaceholder: 'Recruiter, tech stack, impressions…',
    jobAdLink: 'Job ad link',
    jobAdPlaceholder: 'https://company.com/careers/backend-engineer',
    rejectionFeedback: 'Rejection feedback',
    rejectionPlaceholder: 'What did they say? Anything to improve next time…',
    withdrawReason: 'Reason for withdrawing',
    withdrawPlaceholder: 'Why did you step out? Pay, role, company…',
    delete: 'Delete',
    confirmDelete: 'Confirm delete',
    save: 'Save changes',
    create: 'Create process',
    required: 'Company and role are required.',
    payRange: 'Minimum pay can’t be higher than maximum pay.'
  },

  filters: {
    title: 'Filters',
    clear: 'Clear',
    all: 'All',
    status: 'Status',
    active: 'Active',
    ended: 'Ended',
    workplace: 'Workplace',
    contract: 'Contract',
    companyType: 'Company type',
    region: 'Region'
  },

  settings: {
    title: 'Settings',
    theme: 'Theme',
    light: 'Light theme',
    dark: 'Dark theme',
    system: 'Match system theme',
    filtersSidebar: 'Filters sidebar',
    showEnded: 'Show ended processes',
    showStats: 'Show summary counters',
    language: 'Language',
    account: 'Account',
    signIn: 'Sign in with Google',
    signingIn: 'Continue in your browser…',
    signOut: 'Sign out'
  },

  auth: {
    notConfigured: 'Google sign-in isn’t set up yet. See “Google sign-in” in the README.',
    inProgress: 'A sign-in is already in progress.',
    cancelled: 'Sign-in cancelled.',
    timeout: 'Sign-in timed out. Please try again.',
    denied: 'Sign-in was cancelled in the browser.',
    failed: 'Google sign-in failed. Please try again.',
    doneTitle: 'You’re signed in to Dashprocess',
    doneBody: 'You can close this tab and go back to the app.',
    failedTitle: 'Sign-in failed'
  },

  crash: {
    title: 'Something went wrong',
    body: 'The app hit an unexpected error. Your data is safe in the database. Reload to continue.',
    reload: 'Reload'
  },

  /** Errors raised by the main process when saving. */
  errors: {
    required: (field: string) => `${field} is required`,
    positive: (field: string) => `${field} must be a positive number`,
    invalid: (field: string) => `Invalid ${field}`,
    jobUrl: 'Job ad link must be a web address',
    payRange: 'Minimum pay can’t be higher than maximum pay',
    startDate: 'Invalid start date',
    chooseStage: 'Choose a stage',
    processNotFound: (id: number) => `Process ${id} not found`,
    stageNotFound: (id: number) => `Stage ${id} not found`,
    stageOrder: 'Stage order must contain every stage exactly once',
    lastStage: 'You need at least one stage',
    moveTarget: 'Choose a stage to move this stage’s processes to',
    fields: {
      stageName: 'Stage name',
      stagePreset: 'stage preset',
      company: 'Company',
      role: 'Role',
      minPay: 'Minimum pay',
      maxPay: 'Maximum pay',
      status: 'status',
      companyType: 'company type',
      region: 'region',
      currency: 'currency',
      payPeriod: 'pay period',
      theme: 'theme',
      language: 'language'
    }
  }
}

export type Messages = typeof en
