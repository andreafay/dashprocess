import { messages, stageLabel, type Messages } from '@shared/i18n'
import type { Stage } from '@shared/types'
import { useStore } from '@/store'

/** The texts for the language picked in Settings. Components re-render when it changes. */
export function useT(): Messages {
  return useStore((s) => messages(s.language))
}

/** Returns a function giving each stage's name in the current language. */
export function useStageLabel(): (stage: Stage) => string {
  const t = useT()
  return (stage) => stageLabel(stage, t)
}
