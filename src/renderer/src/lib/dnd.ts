import type { UniqueIdentifier } from '@dnd-kit/core'

export const cardDndId = (id: number): string => `p:${id}`
export const columnDndId = (id: number): string => `s:${id}`

export function parseDndId(id: UniqueIdentifier): { kind: 'p' | 's'; id: number } {
  const [kind, num] = String(id).split(':')
  return { kind: kind as 'p' | 's', id: Number(num) }
}
