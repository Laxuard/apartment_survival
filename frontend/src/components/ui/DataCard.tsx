import React, { type ReactNode } from 'react';
import { Card, CardHeader, CardTitle, CardAction, CardContent } from './card';

interface DataCardProps {
  title: ReactNode;
  headerAction?: ReactNode;
  isLoading: boolean;
  isEmpty: boolean;
  skeleton: ReactNode;
  emptyState: ReactNode;
  children: ReactNode;
  className?: string;
  noPadding?: boolean;
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
  noPadding = false,
}) => {
  return (
    <Card className={`flex flex-col ${className}`}>
      <CardHeader className="border-b border-[var(--border)]/60">
        <CardTitle>{title}</CardTitle>
        {headerAction && <CardAction>{headerAction}</CardAction>}
      </CardHeader>
      <CardContent noPadding={noPadding} className="flex-1 flex flex-col pt-4">
        {isLoading ? skeleton : isEmpty ? emptyState : children}
      </CardContent>
    </Card>
  );
};
