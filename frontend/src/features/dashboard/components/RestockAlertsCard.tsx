import React, { useState } from 'react';
import {
  IconCoffee,
  IconEgg,
  IconDroplet,
  IconPlus,
  IconCheck,
  IconBread,
  IconMilk,
} from '@tabler/icons-react';
import { MOCK_PANTRY_ITEMS } from '@/features/pantry/mocks/pantryData';

const getItemIcon = (iconName: string) => {
  switch (iconName) {
    case 'coffee':
      return <IconCoffee size={16} />;
    case 'egg':
      return <IconEgg size={16} />;
    case 'droplet':
      return <IconDroplet size={16} />;
    case 'bread':
      return <IconBread size={16} />;
    case 'milk':
      return <IconMilk size={16} />;
    default:
      return <IconCoffee size={16} />;
  }
};

export const RestockAlertsCard: React.FC = () => {
  const [addedItems, setAddedItems] = useState<Record<string, boolean>>({});

  const handleToggle = (id: string) => {
    setAddedItems((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <section className="card-custom" aria-labelledby="stock-title">
      <div className="card-head">
        <h2 className="card-title-custom" id="stock-title">
          Restock alerts
        </h2>
        <div className="card-title-sub">{MOCK_PANTRY_ITEMS.length} items</div>
      </div>

      <div className="divide-y divide-[var(--border)]">
        {MOCK_PANTRY_ITEMS.map((item) => {
          const isAdded = !!addedItems[item.id];

          return (
            <div className="stock-row" key={item.id}>
              <div className="row-icon-box" aria-hidden="true">
                {getItemIcon(item.iconName)}
              </div>
              <div className="stock-name">{item.name}</div>
              <span className={`badge-tag ${item.status === 'out' ? 'out' : 'low'}`}>
                {item.badgeLabel}
              </span>
              <button
                type="button"
                className={`btn-ghost-add ${isAdded ? 'added' : ''}`}
                aria-label={`Add ${item.name} to grocery list`}
                title="Add to grocery list"
                onClick={() => handleToggle(item.id)}
              >
                {isAdded ? (
                  <IconCheck size={14} aria-hidden="true" />
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
