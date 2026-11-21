import * as S from '@radix-ui/react-select'
import { Check, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SelectProps {
  value: string
  onChange: (value: string) => void
  options: { value: string; label: string }[]
  className?: string
  id?: string
}

export function Select({ value, onChange, options, className, id }: SelectProps) {
  return (
    <S.Root value={value} onValueChange={onChange}>
      <S.Trigger
        id={id}
        className={cn(
          'inline-flex h-9 w-full items-center justify-between gap-2 rounded-lg border border-border bg-surface px-3 text-sm text-fg shadow-[var(--shadow-card)] focus:border-accent-text focus:outline-none focus:ring-2 focus:ring-ring/30',
          className
        )}
      >
        <S.Value />
        <S.Icon>
          <ChevronDown className="size-4 text-subtle" />
        </S.Icon>
      </S.Trigger>
      <S.Portal>
        <S.Content
          position="popper"
          sideOffset={4}
          className="animate-menu-in z-50 max-h-72 min-w-[var(--radix-select-trigger-width)] overflow-hidden rounded-lg border border-border bg-surface p-1 shadow-[var(--shadow-lift)]"
        >
          <S.Viewport>
            {options.map((o) => (
              <S.Item
                key={o.value}
                value={o.value}
                className="relative flex h-8 cursor-default items-center rounded-md pr-8 pl-2.5 text-sm text-fg outline-none select-none data-[highlighted]:bg-surface-2"
              >
                <S.ItemText>{o.label}</S.ItemText>
                <S.ItemIndicator className="absolute right-2">
                  <Check className="size-4 text-accent-text" />
                </S.ItemIndicator>
              </S.Item>
            ))}
          </S.Viewport>
        </S.Content>
      </S.Portal>
    </S.Root>
  )
}
