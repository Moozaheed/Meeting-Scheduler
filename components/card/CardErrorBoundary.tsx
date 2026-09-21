'use client';

import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';

interface CardErrorBoundaryProps {
  children: ReactNode;
}

interface CardErrorBoundaryState {
  hasError: boolean;
}

/**
 * Isolates the card preview/export subtree so a rendering exception inside
 * a third-party PDF/QR library cannot crash the rest of the scheduling UI
 * (team.md Error handling / reliability-design.md's "Card-generation
 * failure design").
 */
export class CardErrorBoundary extends Component<CardErrorBoundaryProps, CardErrorBoundaryState> {
  state: CardErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): CardErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    // eslint-disable-next-line no-console -- observability-design.md: console.error/warn is the affirmed built-in-only observability approach.
    console.error('Invitation card preview/export crashed:', error, info.componentStack);
  }

  private handleReset = (): void => {
    this.setState({ hasError: false });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 p-6 text-sm text-red-700"
          data-testid="card-error-boundary-fallback"
        >
          <p className="font-semibold">Something went wrong rendering the invitation card.</p>
          <button
            type="button"
            onClick={this.handleReset}
            className="mt-3 rounded-md border border-red-300 bg-white px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-100"
            data-testid="card-error-boundary-retry"
          >
            Try again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
