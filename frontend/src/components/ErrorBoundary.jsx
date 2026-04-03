import React from 'react'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, errorMessage: '' }
  }

  static getDerivedStateFromError(error) {
    // Update state so the fallback UI is rendered after a runtime crash.
    return { hasError: true, errorMessage: error?.message || 'Unknown error' }
  }

  componentDidCatch(error, errorInfo) {
    // Keep console diagnostics for debugging in development.
    console.error('ErrorBoundary caught an error:', error, errorInfo)
  }

  handleReset = () => {
    this.setState({ hasError: false, errorMessage: '' })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            maxWidth: '780px',
            margin: '48px auto',
            padding: '24px',
            borderRadius: '8px',
            border: '1px solid #f5c2c7',
            background: '#fff5f5',
            color: '#7f1d1d',
          }}
        >
          <h1 style={{ marginTop: 0, marginBottom: '12px', fontSize: '24px' }}>
            Something went wrong
          </h1>
          <p style={{ margin: 0, lineHeight: 1.5 }}>
            The app hit an unexpected error. You can try again, and if it keeps happening,
            check the browser console for details.
          </p>
          {this.state.errorMessage && (
            <pre
              style={{
                marginTop: '16px',
                padding: '12px',
                borderRadius: '6px',
                background: '#fee2e2',
                whiteSpace: 'pre-wrap',
                fontSize: '13px',
              }}
            >
              {this.state.errorMessage}
            </pre>
          )}
          <button
            type="button"
            onClick={this.handleReset}
            style={{
              marginTop: '14px',
              padding: '10px 14px',
              border: 'none',
              borderRadius: '6px',
              background: '#7f1d1d',
              color: 'white',
              cursor: 'pointer',
              fontWeight: 600,
            }}
          >
            Try again
          </button>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
