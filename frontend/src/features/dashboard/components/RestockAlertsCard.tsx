import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  IconCoffee,
  IconEgg,
  IconDroplet,
  IconPlus,
  IconCheck,
  IconBread,
  IconMilk,
  IconAlertTriangle,
} from '@tabler/icons-react';
import { usePantryStock, type PantryItem } from '@/features/pantry';

const getItemIcon = (iconName: string) => {
  switch (iconName) {
    case 'coffee':
      return <IconCoffee size={17} />;
    case 'egg':
      return <IconEgg size={17} />;
    case 'droplet':
      return <IconDroplet size={17} />;
    case 'bread':
      return <IconBread size={17} />;
    case 'milk':
      return <IconMilk size={17} />;
    default:
      return <IconCoffee size={17} />;
  }
};

export const RestockAlertsCard: React.FC = () => {
  const navigate = useNavigate();
  const {
    items: pantryItems,
    criticalCount,
    totalCount,
    toggleGrocery,
    getStockBadge,
  } = usePantryStock();

  // Show top 3 critical/low supplies
  const displayItems = [...pantryItems]
    .sort((a, b) => {
      const order: Record<string, number> = { out: 0, low: 1, medium: 2, high: 3, in_stock: 4 };
      return (order[a.status] ?? 5) - (order[b.status] ?? 5);
    })
    .slice(0, 3);

  return (
    <section className="card-custom flex flex-col shadow-sm" aria-labelledby="stock-title">
      <div className="p-3.5 sm:p-4 border-b border-[var(--border)] flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <h2 className="card-title-custom text-sm sm:text-base font-bold text-[var(--text)]" id="stock-title">
            Restock alerts
          </h2>
          {criticalCount > 0 ? (
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-[var(--negative-bg)] text-[var(--negative-text)]">
              <IconAlertTriangle size={12} />
              {criticalCount} Critical
            </span>
          ) : (
            <span className="text-xs text-[var(--muted)]">{totalCount} items</span>
          )}
        </div>
        <button
          type="button"
          onClick={() => navigate('/pantry')}
          className="text-xs sm:text-sm font-semibold text-[var(--oak)] hover:underline cursor-pointer"
        >
          View Pantry &rarr;
        </button>
      </div>

      <div className="p-3.5 sm:p-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
        {displayItems.map((item: PantryItem) => {
          const isAdded = !!item.onGroceryList;
          const badge = getStockBadge(item);

          return (
            <div
              key={item.id}
              onClick={() => navigate('/pantry')}
              className="p-3.5 rounded-2xl bg-[var(--canvas)] border border-[var(--border)] flex flex-col justify-between space-y-3 hover:border-[var(--border-strong)] transition-all cursor-pointer group"
              title="Click to view item in Pantry"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-[var(--card)] text-[var(--oak)] flex items-center justify-center text-xs shrink-0 border border-[var(--border)]">
                  {getItemIcon(item.iconName)}
                </div>
                <div className="min-w-0">
                  <div className="text-xs sm:text-sm font-bold text-[var(--text)] truncate group-hover:text-[var(--oak)] transition-colors">
                    {item.name}
                  </div>
                  <div className="text-xs text-[var(--muted)] truncate mt-0.5">
                    {item.category}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between gap-2 pt-1 border-t border-[var(--border)]/60">
                <span className={`px-2 py-0.5 rounded-md text-[10.5px] font-bold select-none ${badge.badgeClass}`}>
                  {badge.label}
                </span>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleGrocery(item.id, item.onGroceryList);
                  }}
                  className={`btn-spring px-2.5 py-1 rounded-lg border text-xs font-semibold cursor-pointer flex items-center gap-1 transition-all ${
                    isAdded
                      ? 'bg-[var(--positive-bg)] text-[var(--positive-text)] border-[var(--positive-text)] shadow-xs'
                      : 'border-[var(--border-strong)] bg-[var(--card)] hover:bg-[var(--oak)] hover:border-[var(--oak)] hover:text-white text-[var(--text)] shadow-2xs'
                  }`}
                  aria-label={`Add ${item.name} to grocery checklist`}
                  title={isAdded ? 'Added to checklist' : 'Add to grocery checklist'}
                >
                  {isAdded ? (
                    <>
                      <IconCheck size={12} aria-hidden="true" />
                      <span>Added</span>
                    </>
                  ) : (
                    <>
                      <IconPlus size={12} aria-hidden="true" />
                      <span>List</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
