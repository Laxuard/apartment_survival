import React from 'react';

interface EmptyStateProps {
  icon?: React.ComponentType<{ size?: number; className?: string }>;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  action,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center text-[var(--muted)]">
      {Icon && (
        <div className="mb-3 text-[var(--sage)]">
          <Icon size={32} />
        </div>
      )}
      <h3 className="text-sm font-semibold text-[var(--text)]">{title}</h3>
      {description && <p className="mt-1 text-xs max-w-xs">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
};
