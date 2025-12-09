import React, { ReactNode } from 'react';
import { logger } from '@/lib/logger';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * Global Error Boundary Component
 *
 * Catches React rendering errors and prevents the entire app from crashing.
 * Logs errors for debugging and displays a fallback UI.
 *
 * Usage:
 * <ErrorBoundary>
 *   <YourComponent />
 * </ErrorBoundary>
 */
export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    logger.error('ErrorBoundary', 'Uncaught React error in component tree', error);
    console.error('ErrorInfo:', errorInfo.componentStack);
  }

  handleReset = (): void => {
    this.setState({ hasError: false, error: null });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', backgroundColor: '#f8f9fa', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
          <div style={{ maxWidth: '600px', padding: '40px', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', textAlign: 'center' }}>
            <h1 style={{ color: '#d32f2f', marginBottom: '16px' }}>Something went wrong</h1>
            <p style={{ color: '#666', marginBottom: '24px', fontSize: '16px' }}>
              An unexpected error occurred. We have logged the details for debugging.
            </p>

            {import.meta.env.DEV && this.state.error && (
              <details style={{ marginBottom: '24px', padding: '16px', backgroundColor: '#f5f5f5', borderRadius: '4px', textAlign: 'left', cursor: 'pointer' }}>
                <summary style={{ fontWeight: 'bold', marginBottom: '8px' }}>Error details (dev only)</summary>
                <pre style={{ margin: '8px 0 0 0', padding: '12px', backgroundColor: '#e0e0e0', borderRadius: '4px', overflow: 'auto', fontSize: '12px' }}>
                  {this.state.error.toString()}
                  {this.state.error.stack && `\n\n${this.state.error.stack}`}
                </pre>
              </details>
            )}

            <button
              onClick={this.handleReset}
              style={{ padding: '12px 24px', backgroundColor: '#1976d2', color: 'white', border: 'none', borderRadius: '4px', fontSize: '16px', cursor: 'pointer', marginRight: '12px' }}
            >
              Try Again
            </button>

            <button
              onClick={() => {
                window.location.href = '/';
              }}
              style={{ padding: '12px 24px', backgroundColor: '#757575', color: 'white', border: 'none', borderRadius: '4px', fontSize: '16px', cursor: 'pointer' }}
            >
              Go Home
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
