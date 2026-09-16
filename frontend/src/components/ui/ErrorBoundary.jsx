import { Component } from 'react'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch() {
    // Intentionally no logging side-effects in this MVP; hook up an error
    // reporting service here (e.g. Sentry) in production.
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
    this.props.onReset?.()
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 p-6 text-center">
            <h2 className="text-lg font-semibold text-slate-900">Something went wrong</h2>
            <p className="max-w-sm text-sm text-slate-500">
              An unexpected error occurred while rendering this section. You can try again below.
            </p>
            <button className="btn-primary" onClick={this.handleReset}>
              Try again
            </button>
          </div>
        )
      )
    }

    return this.props.children
  }
}
