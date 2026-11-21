import * as DM from '@radix-ui/react-dropdown-menu'
import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export const DropdownMenu = DM.Root
export const DropdownTrigger = DM.Trigger

export function DropdownContent({
  children,
  align = 'end'
}: {
  children: ReactNode
  align?: 'start' | 'end'
}) {
  return (
    <DM.Portal>
      <DM.Content
        align={align}
        sideOffset={4}
        className="animate-menu-in z-50 min-w-44 rounded-lg border border-border bg-surface p-1 shadow-[var(--shadow-lift)]"
      >
        {children}
      </DM.Content>
    </DM.Portal>
  )
}

export function DropdownItem({
  children,
  onSelect,
  danger
}: {
  children: ReactNode
  onSelect: () => void
  danger?: boolean
}) {
  return (
    <DM.Item
      onSelect={onSelect}
      className={cn(
        'flex h-8 cursor-default items-center gap-2 rounded-md px-2.5 text-sm outline-none select-none data-[highlighted]:bg-surface-2 [&_svg]:size-4',
        danger ? 'text-danger' : 'text-fg [&_svg]:text-subtle'
      )}
    >
      {children}
    </DM.Item>
  )
}

export function DropdownSeparator() {
  return <DM.Separator className="my-1 h-px bg-border" />
}
