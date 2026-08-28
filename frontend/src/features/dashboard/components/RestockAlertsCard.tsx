import React from 'react';
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
import { useHouseholdStore } from '@/stores/useHouseholdStore';
import {
  usePantryItemsQuery,
  useToggleGroceryMutation,
} from '@/features/pantry/hooks/usePantryQueries';

const getItemIcon = (iconName: string) => {
  switch (iconName) {
    case 'coffee':
      return <IconCoffee size={15} />;
    case 'egg':
      return <IconEgg size={15} />;
    case 'droplet':
      return <IconDroplet size={15} />;
    case 'bread':
      return <IconBread size={15} />;
    case 'milk':
      return <IconMilk size={15} />;
    default:
      return <IconCoffee size={15} />;
  }
};

export const RestockAlertsCard: React.FC = () => {
  const activeHouseholdId = useHouseholdStore((s) => s.activeHouseholdId);
  const { data: pantryItems = [] } = usePantryItemsQuery(activeHouseholdId);
  const toggleGroceryMutation = useToggleGroceryMutation(activeHouseholdId);

  const urgentCount = pantryItems.filter((i) => i.status === 'out').length;

  const handleToggle = (id: string, currentStatus?: boolean) => {
    toggleGroceryMutation.mutate({ itemId: id, onList: !currentStatus });
  };

  return (
    <section className="card-custom card-interactive transition-all duration-200" aria-labelledby="stock-title">
      <div className="card-head">
        <div className="flex items-center gap-2">
          <h2 className="card-title-custom" id="stock-title">
            Restock alerts
          </h2>
          {urgentCount > 0 && (
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[var(--negative-bg)] text-[var(--negative-text)] pulse-subtle">
              <IconAlertTriangle size={11} />
              {urgentCount} Critical
            </span>
          )}
        </div>
        <div className="card-title-sub">{pantryItems.length} tracked items</div>
      </div>

      <div className="divide-y divide-[var(--border)]">
        {pantryItems.map((item) => {
          const isAdded = !!item.onGroceryList;
          const fillWidth = item.status === 'out' ? 5 : item.status === 'low' ? 30 : 75;
          const fillClass = item.status === 'out' ? 'low' : item.status === 'low' ? 'half' : 'full';

          return (
            <div className="stock-row" key={item.id}>
              <div className="row-icon-box shrink-0" aria-hidden="true">
                {getItemIcon(item.iconName)}
              </div>
              
              <div className="stock-name flex-1 min-w-0 pr-1">
                <div className="flex items-center justify-between text-[13px] font-medium text-[var(--text)] mb-1">
                  <span className="truncate">{item.name}</span>
                  <span className="text-[11px] text-[var(--muted)] font-normal ml-2 shrink-0">{item.category}</span>
                </div>
                <div className="stock-meter w-full">
                  <div 
                    className={`stock-meter-fill ${fillClass}`} 
                    style={{ width: `${fillWidth}%` }} 
                    title={`Stock: ${fillWidth}%`}
                  />
                </div>
              </div>

              <span
                className={`w-[76px] text-center inline-flex items-center justify-center py-1 rounded-md text-xs font-semibold shrink-0 select-none ${
                  item.status === 'out'
                    ? 'bg-[var(--negative-bg)] text-[var(--negative-text)] pulse-subtle'
                    : item.status === 'low'
                    ? 'bg-[var(--warn-bg)] text-[var(--warn-text)]'
                    : 'bg-[var(--positive-bg)] text-[var(--positive-text)]'
                }`}
              >
                {item.badgeLabel}
              </span>

              <button
                type="button"
                className={`btn-ghost-add btn-spring shrink-0 w-8 h-8 rounded-lg cursor-pointer flex items-center justify-center ${isAdded ? 'added bg-[var(--positive-bg)] text-[var(--positive-text)] border-[var(--positive-text)] shadow-xs' : ''}`}
                aria-label={`Add ${item.name} to grocery list`}
                title={isAdded ? 'Added to list' : 'Add to grocery list'}
                onClick={() => handleToggle(item.id, item.onGroceryList)}
              >
                {isAdded ? (
                  <IconCheck size={14} aria-hidden="true" className="animate-check-pop" />
                ) : (
                  <IconPlus size={14} aria-hidden="true" />
                )}
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
};
