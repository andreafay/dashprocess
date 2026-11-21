import { cn } from '@/lib/utils'

interface SegmentedProps<T extends string> {
  value: T
  onChange: (value: T) => void
  options: { value: T; label: string }[]
  className?: string
  size?: 'sm' | 'md'
}

export function Segmented<T extends string>({
  value,
  onChange,
  options,
  className,
  size = 'md'
}: SegmentedProps<T>) {
  return (
    <div
      role="radiogroup"
      className={cn('inline-flex rounded-lg border border-border bg-surface-2 p-0.5', className)}
    >
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          role="radio"
          aria-checked={value === o.value}
          onClick={() => onChange(o.value)}
          className={cn(
            'flex-1 rounded-md px-2.5 font-medium whitespace-nowrap text-muted transition-colors hover:text-fg',
            size === 'sm' ? 'h-7 text-[12px]' : 'h-8 text-[13px]',
            value === o.value && 'bg-surface text-fg shadow-[var(--shadow-card)]'
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}
