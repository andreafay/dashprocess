import { en, type Messages } from './en'
import { it } from './it'
import type { Stage } from '../types'

export type { Messages }

export const LANGUAGES = ['en', 'it'] as const
export type Language = (typeof LANGUAGES)[number]

/** Each language's own name, shown in Settings. */
export const LANGUAGE_NAMES: Record<Language, string> = { en: 'English', it: 'Italiano' }

/** Locale used for dates and numbers. */
export const LOCALES: Record<Language, string> = { en: 'en-GB', it: 'it-IT' }

export const MESSAGES: Record<Language, Messages> = { en, it }

export function messages(language: Language): Messages {
  return MESSAGES[language] ?? en
}

export function isLanguage(value: unknown): value is Language {
  return LANGUAGES.includes(value as Language)
}

/** The name to show for a stage: the translated preset name, or the user's own name. */
export function stageLabel(stage: Pick<Stage, 'name' | 'preset' | 'renamed'>, t: Messages): string {
  return stage.preset && !stage.renamed ? t.stagePresets[stage.preset] : stage.name
}
