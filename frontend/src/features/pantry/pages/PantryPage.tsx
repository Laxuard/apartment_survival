import { Button } from '@/components/ui/button';
import {
  IconAlertTriangle,
  IconCheck,
  IconCircleCheck,
  IconMinus,
  IconPlus,
  IconSearch,
  IconShoppingCart,
  IconX,
} from '@tabler/icons-react';
import React, { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { usePantryStock } from '../hooks/usePantryStock';
import type { PantryItem } from '../types';

export const PantryPage: React.FC = () => {
  const {
    items,
    isLoading,
    totalCount,
    criticalCount,
    groceryCount,
    adjustQuantity,
    toggleGrocery,
    addItem,
    isAddingItem,
    getStockProgress,
    getStockBadge,
  } = usePantryStock();

  const [filter, setFilter] = useState<'ALL' | 'CRITICAL' | 'STOCKED'>('ALL');
  const [search, setSearch] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New Item Form State
  const [newItemName, setNewItemName] = useState('');
  const [newItemCategory, setNewItemCategory] = useState('Groceries');
  const [newItemQuantity, setNewItemQuantity] = useState(3);
  const [newItemUnit] = useState('units');

  const filteredItems = useMemo(() => {
    return items.filter((item: PantryItem) => {
      const matchesSearch =
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.category.toLowerCase().includes(search.toLowerCase());
      if (!matchesSearch) return false;
      if (filter === 'CRITICAL') return item.status === 'out' || item.status === 'low';
      if (filter === 'STOCKED') return item.status === 'in_stock';
      return true;
    });
  }, [items, filter, search]);

  const handleToggleGrocery = (id: string, currentStatus?: boolean) => {
    const item = items.find((i: PantryItem) => i.id === id);
    toggleGrocery(id, currentStatus);
    if (!currentStatus) {
      toast.success(`Added ${item?.name || 'item'} to Grocery Checklist`, {
        icon: '🛒',
      });
    } else {
      toast.info(`Removed ${item?.name || 'item'} from Grocery Checklist`);
    }
  };

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) return;

    try {
      await addItem({
        name: newItemName.trim(),
        category: newItemCategory,
        quantity: newItemQuantity,
        unit: newItemUnit,
      });
      toast.success(`Added "${newItemName.trim()}" to pantry inventory`);
      setNewItemName('');
      setIsAddModalOpen(false);
    } catch {
      toast.error('Failed to add pantry item');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* 3 Prominent Summary Metrics (Elevated & spacious, saving vertical header space) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div
          onClick={() => setFilter('ALL')}
          className={`bg-[var(--card)] border rounded-2xl p-4 sm:p-5 shadow-sm space-y-1.5 cursor-pointer ${filter === 'ALL'
              ? 'border-[var(--oak)] ring-1 ring-[var(--oak)]/20'
              : 'border-[var(--border)]'
            }`}
        >
          <div className="flex items-center justify-between text-xs font-medium text-[var(--muted)]">
            <span>Tracked Items</span>
            <IconShoppingCart size={18} className="text-[var(--oak)]" />
          </div>
          <div className="mono font-bold text-2xl text-[var(--text)]">
            {totalCount} <span className="text-xs font-normal text-[var(--muted)]">supplies</span>
          </div>
        </div>

        <div
          onClick={() => setFilter('CRITICAL')}
          className={`bg-[var(--card)] border rounded-2xl p-4 sm:p-5 shadow-sm space-y-1.5 cursor-pointer ${filter === 'CRITICAL'
              ? 'border-[var(--warn-text)] ring-1 ring-[var(--warn-text)]/20'
              : 'border-[var(--border)]'
            }`}
        >
          <div className="flex items-center justify-between text-xs font-medium text-[var(--muted)]">
            <span>Needs Restocking</span>
            <IconAlertTriangle size={18} className="text-[var(--warn-text)]" />
          </div>
          <div className="mono font-bold text-2xl text-[var(--warn-text)]">
            {criticalCount} <span className="text-xs font-normal text-[var(--muted)]">low / out</span>
          </div>
        </div>

        <div
          onClick={() => setFilter('ALL')}
          className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-4 sm:p-5 shadow-sm space-y-1.5 cursor-pointer"
        >
          <div className="flex items-center justify-between text-xs font-medium text-[var(--muted)]">
            <span>On Grocery List</span>
            <IconCircleCheck size={18} className="text-[var(--sage)]" />
          </div>
          <div className="mono font-bold text-2xl text-[var(--sage)]">
            {groceryCount} <span className="text-xs font-normal text-[var(--muted)]">marked</span>
          </div>
        </div>
      </div>

      {/* Main Stock Card */}
      <div className="card-custom">
        {/* Controls & Filter bar */}
        <div className="p-4 border-b border-[var(--border)] space-y-3">
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
            {/* Search Input */}
            <div className="relative flex-1 max-w-sm">
              <IconSearch size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
              <input
                type="text"
                placeholder="Search pantry supplies..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-[var(--canvas)] text-[var(--text)] text-xs rounded-xl pl-9 pr-3 py-2 border border-[var(--border)] focus:outline-none focus:border-[var(--oak)] transition-colors"
              />
            </div>

            {/* Filter Tabs & Quick Add Button */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setFilter('ALL')}
                  className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${filter === 'ALL'
                      ? 'bg-[var(--oak)] text-white shadow-sm'
                      : 'bg-[var(--canvas)] text-[var(--muted)] hover:text-[var(--text)] border border-[var(--border)]'
                    }`}
                >
                  All ({totalCount})
                </button>
                <button
                  type="button"
                  onClick={() => setFilter('CRITICAL')}
                  className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${filter === 'CRITICAL'
                      ? 'bg-[var(--negative-text)] text-white shadow-sm'
                      : 'bg-[var(--canvas)] text-[var(--muted)] hover:text-[var(--text)] border border-[var(--border)]'
                    }`}
                >
                  Low / Out ({criticalCount})
                </button>
                <button
                  type="button"
                  onClick={() => setFilter('STOCKED')}
                  className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${filter === 'STOCKED'
                      ? 'bg-[var(--sage)] text-white shadow-sm'
                      : 'bg-[var(--canvas)] text-[var(--muted)] hover:text-[var(--text)] border border-[var(--border)]'
                    }`}
                >
                  Stocked
                </button>
              </div>

              <Button
                onClick={() => setIsAddModalOpen(true)}
                className="btn-tactile bg-[var(--oak)] hover:bg-[var(--oak-hover)] text-white text-xs cursor-pointer shadow-sm px-3 py-1.5 rounded-xl ml-1"
              >
                <IconPlus size={14} className="mr-1" />
                Add Item
              </Button>
            </div>
          </div>
        </div>

        {/* Item List */}
        <div className="divide-y divide-[var(--border)]">
          {isLoading ? (
            <div className="text-center py-8 text-xs text-[var(--muted)]">Loading pantry inventory...</div>
          ) : filteredItems.length === 0 ? (
            <div className="text-center py-8 text-xs text-[var(--muted)]">
              No pantry items found matching your filter.
            </div>
          ) : (
            filteredItems.map((item: PantryItem) => {
              const isAdded = !!item.onGroceryList;
              const qty = item.quantity ?? (item.status === 'out' ? 0 : 2);
              const progress = getStockProgress(item.status);
              const badge = getStockBadge(item);

              return (
                <div key={item.id} className="stock-row py-3.5 px-4 sm:px-5 flex items-center justify-between gap-3 hover:bg-[var(--sage-tint)] transition-colors">
                  {/* Left Icon */}
                  <div className="row-icon-box shrink-0">
                    <IconShoppingCart size={16} />
                  </div>

                  {/* Name & Progress Meter */}
                  <div className="flex-1 min-w-0 space-y-1.5 pr-1">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-[13px] text-[var(--text)] truncate">{item.name}</span>
                      <span className="text-xs text-[var(--muted)] shrink-0 ml-2">{item.category}</span>
                    </div>

                    {/* Stock meter */}
                    <div className="stock-meter w-full">
                      <div className={`stock-meter-fill ${progress.fillClass}`} style={{ width: `${progress.percentage}%` }} />
                    </div>
                  </div>

                  {/* Fixed-width Quantity Stepper: Fixed 82px container */}
                  <div className="w-[82px] h-8 flex items-center justify-between bg-[var(--canvas)] border border-[var(--border)] rounded-xl px-1 shrink-0 select-none">
                    <button
                      type="button"
                      onClick={() => adjustQuantity(item.id, -1)}
                      className="btn-spring w-6 h-6 rounded-lg flex items-center justify-center hover:bg-[var(--card)] text-[var(--text)] cursor-pointer text-xs font-bold shrink-0"
                      aria-label="Decrease quantity"
                    >
                      <IconMinus size={12} />
                    </button>
                    <span
                      key={`${item.id}-${qty}`}
                      className="tabular-nums mono text-xs font-bold text-center text-[var(--text)] w-6 inline-block shrink-0 animate-number-pop"
                    >
                      {qty}
                    </span>
                    <button
                      type="button"
                      onClick={() => adjustQuantity(item.id, 1)}
                      className="btn-spring w-6 h-6 rounded-lg flex items-center justify-center hover:bg-[var(--card)] text-[var(--text)] cursor-pointer text-xs font-bold shrink-0"
                      aria-label="Increase quantity"
                    >
                      <IconPlus size={12} />
                    </button>
                  </div>

                  {/* Fixed-width Status Badge: Fixed 76px container */}
                  <span
                    className={`w-[76px] text-center inline-flex items-center justify-center py-1 rounded-md text-xs font-semibold shrink-0 select-none ${badge.badgeClass}`}
                  >
                    {badge.label}
                  </span>

                  {/* Grocery List Toggle Button: Fixed 32px */}
                  <button
                    type="button"
                    onClick={() => handleToggleGrocery(item.id, item.onGroceryList)}
                    className={`btn-ghost-add btn-spring shrink-0 w-8 h-8 rounded-lg cursor-pointer flex items-center justify-center ${isAdded ? 'added bg-[var(--positive-bg)] text-[var(--positive-text)] border-[var(--positive-text)] shadow-xs' : ''
                      }`}
                    aria-label={`Toggle ${item.name} on grocery list`}
                    title={isAdded ? 'On grocery list' : 'Add to grocery list'}
                  >
                    {isAdded ? <IconCheck size={14} className="animate-check-pop" /> : <IconPlus size={14} />}
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Add Pantry Item Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-5 w-full max-w-md shadow-lg space-y-4">
            <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
              <h3 className="font-serif text-lg font-semibold text-[var(--text)]">Add Pantry Item</h3>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="text-[var(--muted)] hover:text-[var(--text)] cursor-pointer"
              >
                <IconX size={18} />
              </button>
            </div>

            <form onSubmit={handleAddItem} className="space-y-3.5">
              <div>
                <label className="text-xs font-medium text-[var(--muted)] block mb-1">Item Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Oat Milk, Dish Soap, Rice"
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  className="w-full bg-[var(--canvas)] text-[var(--text)] text-xs rounded-lg px-3 py-2 border border-[var(--border)] focus:outline-none focus:border-[var(--oak)]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-[var(--muted)] block mb-1">Category</label>
                  <select
                    value={newItemCategory}
                    onChange={(e) => setNewItemCategory(e.target.value)}
                    className="w-full bg-[var(--canvas)] text-[var(--text)] text-xs rounded-lg px-3 py-2 border border-[var(--border)] focus:outline-none focus:border-[var(--oak)] cursor-pointer"
                  >
                    <option value="Groceries">Groceries</option>
                    <option value="Dairy & Eggs">Dairy & Eggs</option>
                    <option value="Beverages">Beverages</option>
                    <option value="Cleaning">Cleaning</option>
                    <option value="Snacks">Snacks</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-medium text-[var(--muted)] block mb-1">Initial Quantity</label>
                  <input
                    type="number"
                    min="0"
                    max="99"
                    value={newItemQuantity}
                    onChange={(e) => setNewItemQuantity(parseInt(e.target.value) || 0)}
                    className="w-full bg-[var(--canvas)] text-[var(--text)] text-xs rounded-lg px-3 py-2 border border-[var(--border)] focus:outline-none focus:border-[var(--oak)]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[var(--border)]">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAddModalOpen(false)}
                  className="text-xs cursor-pointer"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isAddingItem}
                  className="btn-tactile bg-[var(--oak)] hover:bg-[var(--oak-hover)] text-white text-xs cursor-pointer px-4"
                >
                  {isAddingItem ? 'Saving...' : 'Save Item'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
