import React from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { queryClient } from '@/lib/query-client';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { TooltipProvider } from '@/components/ui/tooltip';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider delay={150}>
          {children}
          <Toaster
            position="bottom-right"
            richColors
            toastOptions={{
              style: {
                background: 'var(--card)',
                borderColor: 'var(--border-strong)',
                color: 'var(--text)',
                borderRadius: '16px',
                fontSize: '12px',
                boxShadow: 'var(--shadow-lg)',
              },
            }}
          />
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};
