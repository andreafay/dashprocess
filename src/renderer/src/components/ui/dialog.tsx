import * as D from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { useT } from '@/lib/i18n'

interface DialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  children: ReactNode
  footer?: ReactNode
  className?: string
}

export function Dialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  className
}: DialogProps) {
  const t = useT()
  return (
    <D.Root open={open} onOpenChange={onOpenChange}>
      <D.Portal>
        <D.Overlay className="animate-fade-in fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-[2px]" />
        <D.Content
          className={cn(
            'animate-pop-in fixed top-1/2 left-1/2 z-50 flex max-h-[88vh] w-[560px] max-w-[calc(100vw-32px)] -translate-x-1/2 -translate-y-1/2 flex-col rounded-2xl border border-border bg-surface shadow-[var(--shadow-lift)] focus:outline-none',
            className
          )}
        >
          <div className="flex items-start justify-between gap-4 px-6 pt-5 pb-4">
            <div>
              <D.Title className="text-base font-semibold text-fg">{title}</D.Title>
              <D.Description className={description ? 'mt-1 text-[13px] text-muted' : 'sr-only'}>
                {description ?? title}
              </D.Description>
            </div>
            <D.Close className="-mr-2 rounded-md p-1.5 text-subtle hover:bg-surface-2 hover:text-fg">
              <X className="size-4" />
              <span className="sr-only">{t.common.close}</span>
            </D.Close>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-5">{children}</div>
          {footer && (
            <div className="flex items-center gap-2 rounded-b-2xl border-t border-border bg-surface-2/60 px-6 py-3.5">
              {footer}
            </div>
          )}
        </D.Content>
      </D.Portal>
    </D.Root>
  )
}
