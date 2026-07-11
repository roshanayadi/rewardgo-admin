import { Component, type ReactNode } from 'react'
import { AlertTriangle, RotateCw } from 'lucide-react'
import { Button } from '@/components/ui/Button'

interface Props {
  children: ReactNode
}
interface State {
  hasError: boolean
  message?: string
}

/** Catches render errors so a single crash never blanks the whole app. */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error.message }
  }

  componentDidCatch(error: Error) {
    // eslint-disable-next-line no-console
    console.error('UI crash caught by ErrorBoundary:', error)
  }

  reset = () => this.setState({ hasError: false, message: undefined })

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-[60vh] flex-col items-center justify-center p-6 text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-600 dark:bg-red-500/10">
            <AlertTriangle className="h-7 w-7" />
          </div>
          <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Something went wrong</h2>
          <p className="mt-1 max-w-md text-sm text-slate-500">
            {this.state.message || 'An unexpected error occurred while rendering this page.'}
          </p>
          <div className="mt-5 flex gap-2">
            <Button onClick={this.reset}>
              <RotateCw className="h-4 w-4" /> Try again
            </Button>
            <Button variant="secondary" onClick={() => (location.href = '/')}>
              Go to Dashboard
            </Button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
