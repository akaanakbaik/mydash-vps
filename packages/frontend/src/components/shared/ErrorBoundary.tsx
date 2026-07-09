import { Component, type ReactNode } from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<{ children: ReactNode }, ErrorBoundaryState> {
  override state: ErrorBoundaryState = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  override render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-96 flex-col items-center justify-center gap-4 p-8">
          <h2 className="text-lg font-semibold text-[hsl(var(--color-danger))]">Something went wrong</h2>
          <p className="text-sm text-[hsl(var(--color-muted))]">{this.state.error?.message}</p>
          <button
            onClick={() => { this.setState({ hasError: false, error: null }); }}
            className="rounded-lg bg-[hsl(var(--color-primary))] px-4 py-2 text-sm font-medium text-white hover:brightness-110"
          >
            Try Again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
