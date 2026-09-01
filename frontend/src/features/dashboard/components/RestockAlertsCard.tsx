import { Button } from '@/components/ui/button';
import { DataCard } from '@/components/ui/DataCard';
import { Skeleton } from '@/components/ui/skeleton';
import { usePantryStock, type PantryItem } from '@/features/pantry';
import { IconPlus, IconSparkles } from '@tabler/icons-react';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export const RestockAlertsCard: React.FC = () => {
  const navigate = useNavigate();
  const { items: pantryItems = [], isLoading } = usePantryStock();

  const lowItems = pantryItems.filter((i) => i.status === 'out' || i.status === 'low');

  const handleChipClick = (item: PantryItem) => {
    toast.info(`Opening Pantry for ${item.name}`, {
      description: `Status: ${item.status === 'out' ? 'Out of stock' : 'Low stock'} · Restock in pantry`,
    });
    navigate('/pantry');
  };

  return (
    <DataCard
      title={
        <div className="flex items-center gap-2">
          <span>Restock Alerts</span>
          <span className="text-xs text-[var(--muted)] font-medium">
            {isLoading ? '...' : `${lowItems.length} items low`}
          </span>
        </div>
      }
      headerAction={
        <button
          type="button"
          onClick={() => navigate('/pantry')}
          className="text-xs text-[var(--muted)] hover:text-[var(--text)] transition-colors cursor-pointer"
        >
          View Pantry &rarr;
        </button>
      }
      isLoading={isLoading}
      isEmpty={lowItems.length === 0}
      className="min-h-[140px] shadow-sm select-none"
      skeleton={
        <div className="flex flex-wrap gap-2 py-1">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-8 w-24 rounded-md skeleton-warm" />
          ))}
        </div>
      }
      emptyState={
        <div className="animate-fade-up flex-1 flex flex-col items-center justify-center text-center space-y-2 my-auto py-2">
          <div className="w-12 h-12 rounded-xl bg-[var(--canvas)] border border-[var(--border)] text-[var(--muted)] flex items-center justify-center">
            <IconSparkles size={22} />
          </div>
          <div className="space-y-0.5">
            <div className="font-bold text-xs text-[var(--text)]">
              All shared essentials are stocked!
            </div>
            <p className="text-[11px] text-[var(--muted)]">
              No items marked Low or Out of Stock.
            </p>
          </div>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => navigate('/pantry')}
            className="mt-4"
          >
            <IconPlus size={13} />
            <span>Add Supply</span>
          </Button>
        </div>
      }
    >
      {/* Horizontal Wrapping Chips Layout: Status Dot -> Emoji -> Item Name */}
      <div className="flex flex-row flex-wrap gap-2 items-center">
        {lowItems.map((item, index) => (
          <button
            key={item.id}
            type="button"
            onClick={() => handleChipClick(item)}
            style={{ animationDelay: `${index * 35}ms` }}
            className="animate-fade-up inline-flex items-center gap-2 px-3 py-1.5 rounded-md border border-[var(--border)] text-xs bg-[var(--canvas)] hover:border-[var(--text)]/30 hover:bg-[var(--card)] dark:hover:bg-white/5 transition-all active:scale-95 cursor-pointer shadow-2xs group"
            title={`Click to manage ${item.name} in Pantry`}
          >
            {/* 1. Status Indicator Dot (Far Left): Red for OUT, Yellow for LOW */}
            <span
              className={`w-2 h-2 rounded-full shrink-0 ${
                item.status === 'out'
                  ? 'bg-[var(--negative-text)] animate-pulse'
                  : 'bg-[#FFB74D]'
              }`}
              title={item.status === 'out' ? 'Out of stock' : 'Low stock'}
            />
            {/* 2. Emoji / Icon */}
            <span className="text-xs">🛒</span>
            {/* 3. Text Name */}
            <span className="font-medium text-[var(--text)] group-hover:text-[var(--oak)] transition-colors">
              {item.name}
            </span>
          </button>
        ))}

        {/* Ghost Add Chip when fewer than 6 items */}
        {lowItems.length < 6 && (
          <button
            type="button"
            onClick={() => navigate('/pantry')}
            style={{ animationDelay: `${lowItems.length * 35}ms` }}
            className="animate-fade-up inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-dashed border-[var(--border-strong)] text-xs text-[var(--muted)] hover:text-[var(--text)] hover:border-[var(--oak)] hover:bg-[var(--oak-tint)]/20 dark:hover:bg-[var(--oak)]/5 transition-all cursor-pointer shadow-2xs group"
            title="Add new supply to pantry"
          >
            <IconPlus size={13} className="text-[var(--muted)] group-hover:text-[var(--oak)] transition-colors" />
            <span>Add supply</span>
          </button>
        )}
      </div>
    </DataCard>
  );
};
