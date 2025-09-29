import React, { Component, ErrorInfo, ReactNode } from 'react'
import { AlertTriangle } from 'lucide-react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo)
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-purple-50 p-4">
          <div className="card max-w-md w-full">
            <div className="flex flex-col items-center text-center space-y-4">
              <AlertTriangle className="h-16 w-16 text-red-500" />
              <h2 className="text-2xl font-display font-bold text-secondary-900">
                Oops! Something went wrong
              </h2>
              <p className="text-secondary-600">
                We're sorry, but something unexpected happened. Please refresh the page to try again.
              </p>
              <button
                onClick={() => window.location.reload()}
                className="btn-primary"
              >
                Refresh Page
              </button>
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="mt-4 w-full">
                  <summary className="cursor-pointer text-sm text-secondary-500">
                    Error details
                  </summary>
                  <pre className="mt-2 text-xs text-left bg-secondary-100 p-2 rounded overflow-auto">
                    {this.state.error.toString()}
                  </pre>
                </details>
              )}
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary