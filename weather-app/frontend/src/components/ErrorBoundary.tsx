import { Component, ErrorInfo, ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: undefined })
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #74b9ff 0%, #0984e3 100%)',
          padding: '2rem'
        }}>
          <div style={{
            background: 'white',
            padding: '2rem',
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            textAlign: 'center',
            maxWidth: '500px'
          }}>
            <h2 style={{ color: '#e74c3c', marginBottom: '1rem' }}>
              ⚠️ Something went wrong
            </h2>
            <p style={{ color: '#666', marginBottom: '1.5rem', lineHeight: 1.6 }}>
              The weather app encountered an unexpected error. This might be due to a 
              network issue or a temporary problem with our services.
            </p>
            <button
              onClick={this.handleReset}
              style={{
                background: '#74b9ff',
                color: 'white',
                border: 'none',
                padding: '0.75rem 1.5rem',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '1rem',
                fontWeight: '500'
              }}
            >
              Try Again
            </button>
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details style={{ marginTop: '1rem', textAlign: 'left' }}>
                <summary style={{ cursor: 'pointer', color: '#666' }}>
                  Error Details (Development)
                </summary>
                <pre style={{ 
                  background: '#f8f9fa', 
                  padding: '1rem', 
                  borderRadius: '4px',
                  fontSize: '0.8rem',
                  overflow: 'auto',
                  marginTop: '0.5rem'
                }}>
                  {this.state.error.message}
                  {'\n'}
                  {this.state.error.stack}
                </pre>
              </details>
            )}
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
