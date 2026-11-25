import { useEffect, useState } from 'react'

export type PartOfDay = 'morning' | 'afternoon' | 'evening' | 'night'

/** Morning 5–12, afternoon 12–18, evening 18–22, night 22–5, in the computer's local time. */
export function partOfDay(date: Date): PartOfDay {
  const h = date.getHours()
  if (h >= 5 && h < 12) return 'morning'
  if (h >= 12 && h < 18) return 'afternoon'
  if (h >= 18 && h < 22) return 'evening'
  return 'night'
}

/** The current part of the day, re-checked every minute so the greeting changes while the app is open. */
export function usePartOfDay(): PartOfDay {
  const [part, setPart] = useState(() => partOfDay(new Date()))
  useEffect(() => {
    const timer = setInterval(() => setPart(partOfDay(new Date())), 60_000)
    return () => clearInterval(timer)
  }, [])
  return part
}
