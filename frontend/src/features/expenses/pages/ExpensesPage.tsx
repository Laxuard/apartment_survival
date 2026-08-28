import React, { useState, useMemo } from 'react';
import {
  IconPlus,
  IconReceipt2,
  IconReceiptOff,
  IconSearch,
  IconShoppingCart,
  IconBolt,
  IconHome2,
  IconCup,
  IconWallet,
  IconPigMoney,
  IconScale,
} from '@tabler/icons-react';
import { Button } from '@/components/ui/button';
import { useUIStore } from '@/stores/useUIStore';
import { useHouseholdStore } from '@/stores/useHouseholdStore';
import { useExpensesQuery } from '../hooks/useExpensesQueries';
import { EmptyState } from '@/components/common/EmptyState';
import { Skeleton } from '@/components/ui/skeleton';

const CATEGORIES = ['ALL', 'GROCERIES', 'UTILITIES', 'RENT', 'HOUSEHOLD', 'FOOD'];

const getCategoryInfo = (category: string) => {
  const cat = (category || '').toUpperCase();
  switch (cat) {
    case 'GROCERIES':
      return { icon: <IconShoppingCart size={15} />, badgeClass: 'groceries', label: 'Groceries' };
    case 'UTILITIES':
      return { icon: <IconBolt size={15} />, badgeClass: 'utilities', label: 'Utilities' };
    case 'RENT':
      return { icon: <IconHome2 size={15} />, badgeClass: 'rent', label: 'Rent' };
    case 'FOOD':
    case 'DINING':
      return { icon: <IconCup size={15} />, badgeClass: 'food', label: 'Food & Dining' };
    case 'HOUSEHOLD':
      return { icon: <IconHome2 size={15} />, badgeClass: 'household', label: 'Household' };
    default:
      return { icon: <IconReceipt2 size={15} />, badgeClass: 'other', label: category || 'General' };
  }
};

export const ExpensesPage: React.FC = () => {
  const { openModal, openReceipt } = useUIStore();
  const activeHouseholdId = useHouseholdStore((s) => s.activeHouseholdId);

  const { data: expenses = [], isLoading } = useExpensesQuery(activeHouseholdId);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter expenses based on search and category
  const filteredExpenses = useMemo(() => {
    return expenses.filter((e) => {
      const matchesCategory =
        selectedCategory === 'ALL' || e.category?.toUpperCase() === selectedCategory;
      const matchesSearch =
        e.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.payerName.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [expenses, selectedCategory, searchQuery]);

  // Compute summary stats
  const totalSpent = expenses.reduce((acc, curr) => acc + (curr.amount || 0), 0);
  const totalUserShare = expenses.reduce((acc, curr) => acc + (curr.userShare || 0), 0);
  const { getActiveCurrency } = useHouseholdStore();
  const currency = getActiveCurrency();

  return (
    <div className="space-y-6">
      {/* 3 Prominent Summary Metric Cards (Elevated & spacious, saving vertical header space) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[var(--card)] border border-[var(--border)] hover:border-[var(--border-strong)] rounded-2xl p-4 sm:p-5 shadow-sm space-y-1.5 transition-all">
          <div className="flex items-center justify-between text-xs font-medium text-[var(--muted)]">
            <span>Total Apartment Spend</span>
            <IconWallet size={18} className="text-[var(--oak)]" />
          </div>
          <div className="mono font-bold text-2xl text-[var(--text)]">
            {totalSpent.toFixed(2)} <span className="currency text-xs font-normal text-[var(--muted)]">{currency}</span>
          </div>
        </div>

        <div className="bg-[var(--card)] border border-[var(--border)] hover:border-[var(--border-strong)] rounded-2xl p-4 sm:p-5 shadow-sm space-y-1.5 transition-all">
          <div className="flex items-center justify-between text-xs font-medium text-[var(--muted)]">
            <span>Your Total Share</span>
            <IconPigMoney size={18} className="text-[var(--sage)]" />
          </div>
          <div className="mono font-bold text-2xl text-[var(--sage)]">
            {totalUserShare.toFixed(2)} <span className="currency text-xs font-normal text-[var(--muted)]">{currency}</span>
          </div>
        </div>

        <div className="bg-[var(--card)] border border-[var(--border)] hover:border-[var(--border-strong)] rounded-2xl p-4 sm:p-5 shadow-sm space-y-1.5 transition-all">
          <div className="flex items-center justify-between text-xs font-medium text-[var(--muted)]">
            <span>Total Transactions</span>
            <IconScale size={18} className="text-[var(--muted)]" />
          </div>
          <div className="mono font-bold text-2xl text-[var(--text)]">
            {expenses.length} <span className="text-xs font-normal text-[var(--muted)]">entries</span>
          </div>
        </div>
      </div>

      {/* Main Ledger Card */}
      <div className="card-custom">
        {/* Search & Category Filter Header */}
        <div className="p-4 border-b border-[var(--border)] space-y-3">
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
            {/* Search Input */}
            <div className="relative flex-1 max-w-sm">
              <IconSearch size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
              <input
                type="text"
                placeholder="Search transactions or payers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[var(--canvas)] text-[var(--text)] text-xs rounded-xl pl-9 pr-3 py-2 border border-[var(--border)] focus:outline-none focus:border-[var(--oak)] transition-colors"
              />
            </div>

            <div className="flex items-center gap-3 self-center sm:self-auto">
              <div className="text-xs text-[var(--muted)]">
                Showing <span className="font-semibold text-[var(--text)]">{filteredExpenses.length}</span> of {expenses.length}
              </div>
              <Button
                onClick={() => openModal('expense')}
                className="btn-tactile bg-[var(--oak)] hover:bg-[var(--oak-hover)] text-white text-xs cursor-pointer shadow-sm px-3.5 py-1.5 rounded-xl"
              >
                <IconPlus size={14} className="mr-1" />
                Log Expense
              </Button>
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`text-xs px-3 py-1 rounded-full font-medium transition-all cursor-pointer whitespace-nowrap ${
                  selectedCategory === cat
                    ? 'bg-[var(--oak)] text-white shadow-sm'
                    : 'bg-[var(--canvas)] text-[var(--muted)] hover:text-[var(--text)] border border-[var(--border)]'
                }`}
              >
                {cat === 'ALL' ? 'All Categories' : cat.charAt(0) + cat.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Expense Rows */}
        <div className="divide-y divide-[var(--border)]">
          {isLoading ? (
            <div className="space-y-3 py-4 px-5">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center gap-3 py-2">
                  <Skeleton className="h-9 w-9 rounded-lg" />
                  <div className="flex-1 space-y-1.5">
                    <Skeleton className="h-4 w-1/3" />
                    <Skeleton className="h-3 w-1/4" />
                  </div>
                  <Skeleton className="h-4 w-16" />
                </div>
              ))}
            </div>
          ) : filteredExpenses.length === 0 ? (
            <div className="p-8">
              <EmptyState
                icon={IconReceiptOff}
                title={searchQuery ? 'No matching expenses' : 'No transactions logged'}
                description={
                  searchQuery
                    ? `No transactions found matching "${searchQuery}" in ${selectedCategory.toLowerCase()}.`
                    : 'Log your first household expense to start building your ledger.'
                }
                action={
                  !searchQuery && (
                    <Button
                      onClick={() => openModal('expense')}
                      className="btn-tactile bg-[var(--oak)] hover:bg-[var(--oak-hover)] text-white text-xs cursor-pointer"
                    >
                      <IconPlus size={14} className="mr-1" /> Log Expense
                    </Button>
                  )
                }
              />
            </div>
          ) : (
            filteredExpenses.map((expense) => {
              const { icon, badgeClass, label } = getCategoryInfo(expense.category);

              return (
                <button
                  type="button"
                  key={expense.id}
                  onClick={() => openReceipt(expense.id)}
                  className="row-clickable flex items-center justify-between py-3.5 px-4 sm:px-5 w-full text-left cursor-pointer hover:bg-[var(--sage-tint)] transition-colors"
                  title="Click to view receipt breakdown"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="row-icon-box shrink-0">
                      {icon}
                    </div>
                    <div className="truncate flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="row-title font-medium text-[13px] text-[var(--text)] truncate">
                          {expense.description}
                        </span>
                        <span className={`cat-badge ${badgeClass} hidden sm:inline-flex`}>
                          {label}
                        </span>
                      </div>
                      <div className="row-meta text-xs text-[var(--muted)] mt-0.5">
                        Paid by <strong className="font-medium text-[var(--text)]">{expense.payerName}</strong> · {expense.createdAt}
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0 ml-3">
                    <div className="row-amount mono font-semibold text-sm text-[var(--text)]">
                      {expense.amount.toFixed(2)}
                      <span className="currency font-normal text-xs ml-0.5 text-[var(--muted)]">{expense.currency}</span>
                    </div>
                    {expense.userShare !== undefined && (
                      <div className="row-share text-[11px] text-[var(--muted)] font-medium">
                        Your share: {expense.userShare.toFixed(2)} {expense.currency}
                      </div>
                    )}
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
