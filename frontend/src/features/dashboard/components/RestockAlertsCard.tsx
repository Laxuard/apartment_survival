import { Button } from '@/components/ui/button';
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
    <section
      className="min-h-[140px] bg-[var(--card)] border border-[var(--border)] rounded-[var(--radius)] p-5 flex flex-col shadow-sm select-none"
      aria-labelledby="stock-title"
    >
      {/* 1. Header with Whisper Divider (Persistently rendered) */}
      <div className="flex justify-between items-center pb-4 mb-4 border-b border-[var(--border)]/40 dark:border-white/5">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-[var(--text)]" id="stock-title">
            Restock Alerts
          </h3>
          <span className="text-xs text-[var(--muted)] font-medium">
            {isLoading ? '...' : `${lowItems.length} items low`}
          </span>
        </div>
        <button
          type="button"
          onClick={() => navigate('/pantry')}
          className="text-xs text-[var(--oak)] hover:text-[var(--oak-hover)] font-medium cursor-pointer"
        >
          View Pantry &rarr;
        </button>
      </div>

      {/* 2. Horizontal Wrapping Chips Body with Matched Skeletons */}
      <div className="flex-1 flex flex-col justify-center">
        {isLoading ? (
          <div className="flex flex-wrap gap-2 py-1">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-8 w-24 rounded-md skeleton-warm" />
            ))}
          </div>
        ) : lowItems.length === 0 ? (
          // Positive Framing Empty State
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
              onClick={() => navigate('/pantry')}
              className="mt-4 btn-tactile bg-[var(--sage)] hover:bg-[var(--sage)]/90 text-white text-[11px] font-semibold px-3 py-1.5 h-7 rounded-lg shadow-sm cursor-pointer inline-flex items-center gap-1"
            >
              <IconPlus size={13} />
              <span>Add Supply</span>
            </Button>
          </div>
        ) : (
          // Horizontal Wrapping Chips Layout: Status Dot -> Emoji -> Item Name
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
                  className={`w-2 h-2 rounded-full shrink-0 ${item.status === 'out'
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
        )}
      </div>
    </section>
  );
};
