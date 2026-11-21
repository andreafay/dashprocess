import * as Sw from '@radix-ui/react-switch'
import { cn } from '@/lib/utils'

interface SwitchProps {
  checked: boolean
  onChange: (checked: boolean) => void
  id?: string
  className?: string
}

export function Switch({ checked, onChange, id, className }: SwitchProps) {
  return (
    <Sw.Root
      id={id}
      checked={checked}
      onCheckedChange={onChange}
      className={cn(
        'relative inline-flex h-5 w-9 shrink-0 items-center rounded-full bg-border-strong transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring data-[state=checked]:bg-accent',
        className
      )}
    >
      <Sw.Thumb className="block size-4 translate-x-0.5 rounded-full bg-white shadow transition-transform data-[state=checked]:translate-x-[18px]" />
    </Sw.Root>
  )
}
