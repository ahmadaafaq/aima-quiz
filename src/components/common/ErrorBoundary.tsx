import React from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

interface Props {
  children: React.ReactNode;
  fallbackTitle?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends (React.Component as any) {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('Uncaught error inside ErrorBoundary:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 my-4 rounded-3xl bg-red-50/80 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 text-slate-800 dark:text-slate-200 max-w-2xl mx-auto shadow-sm">
          <div className="flex items-center gap-3 mb-3 text-red-600 dark:text-red-400">
            <AlertTriangle className="w-6 h-6 shrink-0" />
            <h3 className="text-base font-black">
              {this.props.fallbackTitle || 'Component Error'}
            </h3>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 mb-4">
            An unexpected error occurred while rendering this module:
          </p>
          <div className="p-3 rounded-xl bg-red-100/50 dark:bg-red-900/40 text-red-800 dark:text-red-200 text-xs font-mono break-all mb-4">
            {this.state.error?.message || 'Unknown error'}
          </div>
          <button
            type="button"
            onClick={this.handleReset}
            className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center gap-2 cursor-pointer shadow-xs transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Try Again</span>
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
