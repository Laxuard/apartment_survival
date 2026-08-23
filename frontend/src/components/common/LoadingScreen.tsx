import React from 'react';

export const LoadingScreen: React.FC<{ message?: string }> = ({
  message = 'Loading Apartment Survival...',
}) => {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--oak-tint)] border-t-[var(--oak)]" />
      <p className="text-xs font-medium text-[var(--muted)]">{message}</p>
    </div>
  );
};
