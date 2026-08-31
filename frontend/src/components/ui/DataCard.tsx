import React, { type ReactNode } from 'react';

interface DataCardProps {
  title: string;
  headerAction?: ReactNode;
  isLoading: boolean;
  isEmpty: boolean;
  skeleton: ReactNode;
  emptyState: ReactNode;
  children: ReactNode;
  className?: string;
}

export const DataCard: React.FC<DataCardProps> = ({
  title,
  headerAction,
  isLoading,
  isEmpty,
  skeleton,
  emptyState,
  children,
  className = '',
}) => {
  return (
    <div className={`bg-[var(--card)] border border-[var(--border)] rounded-[var(--radius)] p-5 flex flex-col ${className}`}>
      <div className="flex justify-between items-center pb-4 mb-4 border-b border-[var(--border)]/40 dark:border-white/5">
        <h3 className="text-sm font-semibold text-[var(--text)]">{title}</h3>
        {headerAction && (
          <div className="text-xs text-[var(--oak)] hover:text-[var(--oak-hover)] cursor-pointer">
            {headerAction}
          </div>
        )}
      </div>
      <div className="flex-1 flex flex-col">
        {isLoading ? skeleton : isEmpty ? emptyState : children}
      </div>
    </div>
  );
};
