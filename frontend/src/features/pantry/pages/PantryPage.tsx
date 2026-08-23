import React from 'react';
import { IconPlus, IconShoppingCart } from '@tabler/icons-react';
import { Button } from '@/components/ui/button';
import { MOCK_PANTRY_ITEMS } from '../mocks/pantryData';

export const PantryPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-semibold text-[var(--text)]">Pantry & Stock</h1>
          <p className="text-xs text-[var(--muted)] mt-1">
            Monitor shared apartment inventory, grocery lists, and restock alerts.
          </p>
        </div>
        <Button className="bg-[var(--oak)] hover:bg-[var(--oak-hover)] text-white w-full sm:w-auto">
          <IconPlus size={16} className="mr-1.5" />
          Add Pantry Item
        </Button>
      </div>

      <div className="card-custom">
        <div className="card-head">
          <h2 className="card-title-custom">Inventory Status</h2>
          <div className="card-title-sub">{MOCK_PANTRY_ITEMS.length} tracked items</div>
        </div>

        <div className="divide-y divide-[var(--border)]">
          {MOCK_PANTRY_ITEMS.map((item) => (
            <div key={item.id} className="stock-row py-3">
              <div className="row-icon-box">
                <IconShoppingCart size={16} />
              </div>
              <div className="stock-name">
                <div>{item.name}</div>
                <div className="text-[11px] text-[var(--muted)]">{item.category}</div>
              </div>
              <span className={`badge-tag ${item.status === 'out' ? 'out' : 'low'}`}>
                {item.badgeLabel}
              </span>
              <button
                type="button"
                className="btn-ghost-add"
                aria-label={`Add ${item.name} to grocery list`}
              >
                <IconPlus size={14} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
