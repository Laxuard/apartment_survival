import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { IconBoltOff, IconRefresh } from '@tabler/icons-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in UI boundary:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return (
        <div className="flex min-h-[360px] flex-col items-center justify-center p-6 text-center space-y-4 animate-fade-in">
          <div className="w-14 h-14 rounded-2xl bg-red-500/15 border border-red-500/30 text-red-400 flex items-center justify-center shadow-md">
            <IconBoltOff size={28} />
          </div>
          <div className="space-y-1 max-w-sm">
            <h2 className="font-serif text-base font-bold text-[var(--text)]">
              Circuit Tripped in this Section
            </h2>
            <p className="text-xs text-[var(--muted)] leading-relaxed">
              {this.state.error?.message || 'A temporary glitch occurred while loading this view.'}
            </p>
          </div>
          <Button
            onClick={this.handleReset}
            size="sm"
            className="rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            <IconRefresh size={14} />
            <span>Reset & Reload</span>
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}
