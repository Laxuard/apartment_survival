import React, { useState } from 'react';
import { useRouteError, isRouteErrorResponse, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  IconBoltOff,
  IconRefresh,
  IconBuildingCommunity,
  IconChevronDown,
  IconChevronUp,
} from '@tabler/icons-react';
import { NotFoundPage } from './NotFoundPage';

export const RouteErrorPage: React.FC = () => {
  const error = useRouteError();
  const navigate = useNavigate();
  const [showStack, setShowStack] = useState(false);

  // If the router threw a 404, render the themed NotFoundPage
  if (isRouteErrorResponse(error) && error.status === 404) {
    return <NotFoundPage />;
  }

  let errorMessage = 'An unexpected malfunction occurred in the living space.';
  let errorStatus: number | string = 'Error';
  let stackDetails = '';

  if (isRouteErrorResponse(error)) {
    errorStatus = error.status;
    errorMessage = error.data?.message || error.statusText || errorMessage;
  } else if (error instanceof Error) {
    errorMessage = error.message;
    stackDetails = error.stack || '';
  }

  return (
    <div className="min-h-screen bg-[var(--canvas)] flex flex-col justify-between p-4 sm:p-8 select-none animate-fade-in">
      {/* Header bar */}
      <header className="flex items-center justify-between max-w-4xl w-full mx-auto py-2">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-destructive text-white flex items-center justify-center font-bold shadow-xs">
            <IconBoltOff size={16} />
          </div>
          <span className="font-serif font-bold text-sm text-[var(--text)]">Apartment Survival</span>
        </div>
      </header>

      {/* Main Error Hero Card */}
      <main className="flex-1 flex items-center justify-center my-auto py-8">
        <div className="max-w-md w-full text-center space-y-6">
          {/* Circuit Tripped Icon Badge */}
          <div className="relative inline-flex items-center justify-center">
            <div className="w-20 h-20 rounded-3xl bg-red-500/15 border border-red-500/30 text-red-400 flex items-center justify-center shadow-lg relative z-10">
              <IconBoltOff size={38} strokeWidth={1.75} />
            </div>
            <div className="absolute -bottom-2 -right-2 px-2.5 py-0.5 rounded-full bg-[var(--card)] border border-[var(--border-strong)] text-[11px] font-mono font-bold text-red-400 shadow-sm z-20">
              {errorStatus}
            </div>
          </div>

          {/* Heading & Themed Copy */}
          <div className="space-y-2">
            <h1 className="text-xl sm:text-2xl font-serif font-bold text-[var(--text)] tracking-tight">
              Circuit Tripped in the Living Space
            </h1>
            <p className="text-xs sm:text-sm text-[var(--muted)] leading-relaxed max-w-sm mx-auto">
              Something tripped the fuse in our shared apartment. We&apos;ve caught the surge before it affected your ledger.
            </p>
          </div>

          {/* Primary Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 pt-2">
            <Button
              onClick={() => window.location.reload()}
              size="sm"
              className="w-full sm:w-auto px-5 rounded-xl text-xs font-semibold shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <IconRefresh size={14} />
              <span>Flip Circuit Breaker (Reload)</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/hub')}
              className="w-full sm:w-auto px-5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <IconBuildingCommunity size={14} />
              <span>Command Hub</span>
            </Button>
          </div>

          {/* Technical Diagnostics Expander */}
          <div className="pt-2 text-left">
            <button
              type="button"
              onClick={() => setShowStack((s) => !s)}
              className="mx-auto flex items-center gap-1.5 text-[11px] text-[var(--muted)] hover:text-[var(--text)] transition-colors cursor-pointer"
            >
              <span>Maintenance Diagnostics</span>
              {showStack ? <IconChevronUp size={13} /> : <IconChevronDown size={13} />}
            </button>

            {showStack && (
              <div className="mt-3 p-3.5 rounded-2xl bg-[var(--card)] border border-[var(--border)] space-y-2 text-left animate-fade-in font-mono">
                <div className="text-xs text-red-400 font-semibold break-words">
                  {errorMessage}
                </div>
                {stackDetails && (
                  <pre className="text-[10px] text-[var(--muted)] max-h-40 overflow-y-auto whitespace-pre-wrap leading-tight">
                    {stackDetails}
                  </pre>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center text-[11px] text-[var(--muted)] py-2">
        <span>Apartment Survival Building Maintenance</span>
      </footer>
    </div>
  );
};

