import type { Messages } from './en'

/** Italian texts. Must have exactly the same entries as `en.ts`. */
export const it: Messages = {
  common: {
    cancel: 'Annulla',
    close: 'Chiudi',
    dismiss: 'Chiudi',
    done: 'Fatto',
    add: 'Aggiungi'
  },

  app: {
    pipeline: 'Pipeline di selezione',
    loading: 'Caricamento…',
    onBoard: (n) => `${n} ${n === 1 ? 'processo' : 'processi'} sulla bacheca`,
    shown: (n, total) => `${n} di ${total} processi mostrati`,
    search: 'Cerca',
    settings: 'Impostazioni',
    manageStages: 'Gestisci fasi',
    newProcess: 'Nuovo processo'
  },

  stats: {
    active: 'Processi attivi',
    atStage: (stage) => `In ${stage}`,
    startedRecently: 'Iniziati negli ultimi 30 giorni',
    ended: 'Conclusi',
    showEndedList: 'Mostra i processi conclusi'
  },

  endedList: {
    title: 'Processi conclusi',
    description: (n) =>
      n === 1 ? '1 processo rifiutato o ritirato.' : `${n} processi rifiutati o ritirati.`,
    empty: 'Ancora nessun processo concluso.',
    lastStage: (stage) => `Ultima fase: ${stage}`,
    updated: (date) => `Aggiornato il ${date}`
  },

  status: {
    active: 'Attivo',
    rejected: 'Rifiutato',
    withdrawn: 'Ritirato'
  },

  tags: {
    remote: 'Da remoto',
    onsite: 'In sede',
    b2b: 'B2B',
    employee: 'Dipendente',
    consulting: 'Consulenza',
    product: 'Prodotto',
    italian: 'Italiana',
    european: 'Europea'
  },

  card: {
    hasNotes: 'Ha delle note',
    openJobAd: 'Apri annuncio',
    openJobAdTitle: (url) => `Apri annuncio: ${url}`,
    started: (date) => `Iniziato il ${date}`
  },

  since: {
    today: 'oggi',
    days: (n) => `${n}g`,
    weeks: (n) => `${n} sett.`,
    months: (n) => `${n} mesi`,
    inDays: (n) => `tra ${n}g`
  },

  pay: {
    from: (amount) => `da ${amount}`,
    upTo: (amount) => `fino a ${amount}`,
    periodShort: { year: 'anno', month: 'mese', day: 'giorno', hour: 'ora' },
    periodLabel: { year: 'all’anno', month: 'al mese', day: 'al giorno', hour: 'all’ora' }
  },

  stagePresets: {
    applied: 'Candidatura inviata',
    screening: 'Screening',
    hr_interview: 'Colloquio HR',
    technical_interview: 'Colloquio tecnico',
    home_assignment: 'Esercizio a casa',
    final_interview: 'Colloquio finale',
    reference_check: 'Verifica referenze',
    offer: 'Offerta'
  },

  column: {
    renameHint: 'Doppio clic per rinominare',
    options: (stage) => `Opzioni di ${stage}`,
    addHere: 'Aggiungi processo qui',
    rename: 'Rinomina fase',
    resetName: 'Ripristina nome predefinito',
    delete: 'Elimina fase',
    noMatches: 'Nessun risultato',
    dropHere: 'Trascina qui un processo',
    addProcess: 'Aggiungi processo'
  },

  stagesDialog: {
    title: 'Gestisci fasi',
    description:
      'Le fasi sono le colonne della bacheca. Trascina per riordinarle, clicca un nome per rinominarlo.',
    newStage: 'Nome della nuova fase',
    addStage: 'Aggiungi una fase',
    custom: 'Oppure scrivi un nome personalizzato',
    resetName: (stage) => `Ripristina il nome predefinito di ${stage}`,
    cards: (n) => `${n} ${n === 1 ? 'scheda' : 'schede'}`,
    reorder: (stage) => `Riordina ${stage}`,
    delete: (stage) => `Elimina ${stage}`
  },

  deleteStage: {
    title: (stage) => `Eliminare “${stage}”?`,
    lastStage: 'La bacheca deve avere almeno una fase.',
    empty: 'Questa fase è vuota. L’eliminazione non può essere annullata.',
    hasProcesses: (n) =>
      n === 1
        ? 'Questa fase contiene 1 processo. Scegli dove spostarlo.'
        : `Questa fase contiene ${n} processi. Scegli dove spostarli.`,
    moveTo: 'Sposta i processi in',
    confirm: 'Elimina fase'
  },

  form: {
    newTitle: 'Nuovo processo',
    editTitle: 'Modifica processo',
    newDescription: 'Tieni traccia di un nuovo processo di selezione.',
    company: 'Azienda',
    companyPlaceholder: 'Acme S.p.A.',
    role: 'Ruolo',
    rolePlaceholder: 'Senior Backend Engineer',
    stage: 'Fase',
    status: 'Stato',
    details: 'Dettagli',
    remote: 'Da remoto',
    b2b: 'B2B',
    companyType: 'Tipo di azienda',
    region: 'Area',
    startDate: 'Data di inizio',
    pay: 'Retribuzione',
    min: 'Min',
    max: 'Max',
    currency: 'Valuta',
    period: 'Periodo',
    notes: 'Note',
    notesPlaceholder: 'Recruiter, stack tecnologico, impressioni…',
    jobAdLink: 'Link all’annuncio',
    jobAdPlaceholder: 'https://azienda.it/lavora-con-noi/backend-engineer',
    delete: 'Elimina',
    confirmDelete: 'Conferma eliminazione',
    save: 'Salva modifiche',
    create: 'Crea processo',
    required: 'Azienda e ruolo sono obbligatori.',
    payRange: 'La retribuzione minima non può superare la massima.'
  },

  filters: {
    title: 'Filtri',
    clear: 'Azzera',
    all: 'Tutti',
    status: 'Stato',
    active: 'Attivi',
    ended: 'Conclusi',
    workplace: 'Modalità',
    contract: 'Contratto',
    companyType: 'Tipo di azienda',
    region: 'Area'
  },

  settings: {
    title: 'Impostazioni',
    theme: 'Tema',
    light: 'Tema chiaro',
    dark: 'Tema scuro',
    system: 'Usa il tema di sistema',
    filtersSidebar: 'Barra dei filtri',
    showEnded: 'Mostra processi conclusi',
    language: 'Lingua'
  },

  crash: {
    title: 'Qualcosa è andato storto',
    body: 'L’app ha riscontrato un errore imprevisto. I tuoi dati sono al sicuro nel database. Ricarica per continuare.',
    reload: 'Ricarica'
  },

  errors: {
    required: (field) => `${field}: campo obbligatorio`,
    positive: (field) => `${field} deve essere un numero positivo`,
    invalid: (field) => `Valore non valido: ${field}`,
    jobUrl: 'Il link all’annuncio deve essere un indirizzo web',
    payRange: 'La retribuzione minima non può superare la massima',
    startDate: 'Data di inizio non valida',
    chooseStage: 'Scegli una fase',
    processNotFound: (id) => `Processo ${id} non trovato`,
    stageNotFound: (id) => `Fase ${id} non trovata`,
    stageOrder: 'L’ordine delle fasi deve contenere ogni fase una sola volta',
    lastStage: 'Serve almeno una fase',
    moveTarget: 'Scegli una fase in cui spostare i processi di questa fase',
    fields: {
      stageName: 'Nome della fase',
      stagePreset: 'fase predefinita',
      company: 'Azienda',
      role: 'Ruolo',
      minPay: 'Retribuzione minima',
      maxPay: 'Retribuzione massima',
      status: 'stato',
      companyType: 'tipo di azienda',
      region: 'area',
      currency: 'valuta',
      payPeriod: 'periodo di retribuzione',
      theme: 'tema',
      language: 'lingua'
    }
  }
}
