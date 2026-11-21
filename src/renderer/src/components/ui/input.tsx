import {
  forwardRef,
  type InputHTMLAttributes,
  type LabelHTMLAttributes,
  type TextareaHTMLAttributes
} from 'react'
import { cn } from '@/lib/utils'

const base =
  'w-full rounded-lg border border-border bg-surface px-3 text-sm text-fg placeholder:text-subtle shadow-[var(--shadow-card)] transition-colors focus:border-accent-text focus:outline-none focus:ring-2 focus:ring-ring/30 disabled:opacity-50'

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input ref={ref} className={cn(base, 'h-9', className)} {...props} />
  )
)
Input.displayName = 'Input'

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea ref={ref} className={cn(base, 'min-h-20 resize-y py-2', className)} {...props} />
))
Textarea.displayName = 'Textarea'

export function Label({ className, ...props }: LabelHTMLAttributes<HTMLLabelElement>) {
  return <label className={cn('text-[13px] font-medium text-fg', className)} {...props} />
}
