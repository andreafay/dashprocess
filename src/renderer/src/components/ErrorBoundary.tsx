import { Component, type ErrorInfo, type ReactNode } from 'react'
import { AlertTriangle, RotateCw } from 'lucide-react'
import { Button } from './ui/button'

interface State {
  error: Error | null
}

/** Shows the error and a Reload button instead of a blank window if the UI crashes. */
export class ErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('UI crashed:', error, info.componentStack)
  }

  render(): ReactNode {
    const { error } = this.state
    if (!error) return this.props.children
    return (
      <div className="flex h-full flex-col">
        <div className="drag h-10 shrink-0" />
        <div className="flex flex-1 items-center justify-center p-8">
          <div className="flex max-w-md flex-col items-center gap-3 text-center">
            <div className="flex size-10 items-center justify-center rounded-xl bg-danger-soft text-danger">
              <AlertTriangle className="size-5" />
            </div>
            <h1 className="text-base font-semibold text-fg">Something went wrong</h1>
            <p className="text-[13px] text-muted">
              The app hit an unexpected error. Your data is safe in the database. Reload to continue.
            </p>
            <pre className="max-h-32 w-full overflow-auto rounded-lg bg-surface-2 px-3 py-2 text-left text-[12px] whitespace-pre-wrap text-muted">
              {error.message}
            </pre>
            <Button variant="primary" onClick={() => window.location.reload()}>
              <RotateCw />
              Reload
            </Button>
          </div>
        </div>
      </div>
    )
  }
}
