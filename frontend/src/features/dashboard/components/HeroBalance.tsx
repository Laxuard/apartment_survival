import React from 'react';
import { IconPlus } from '@tabler/icons-react';
import { Button } from '@/components/ui/button';
import { useUIStore } from '@/stores/useUIStore';

interface HeroBalanceProps {
  amount?: number;
  currency?: string;
  isOwed?: boolean;
  nudgeText?: string;
}

export const HeroBalance: React.FC<HeroBalanceProps> = ({
  amount = 450.0,
  currency = 'MAD',
  isOwed = true,
  nudgeText = 'Bob owes 300.00 MAD (14 days overdue) · Alice owes 150.00 MAD',
}) => {
  const { openModal } = useUIStore();
  const formattedAmount = `${amount > 0 ? '+' : ''}${amount.toFixed(2)}`;

  return (
    <div className="hero-card">
      <div className="hero-left">
        <div className="hero-label">Net balance</div>
        <div className="hero-amount mono">
          {formattedAmount}
          <span className="currency">{currency}</span>
        </div>
        <div className="hero-sub">
          <span className="dot" aria-hidden="true">
            ●
          </span>{' '}
          {isOwed ? 'You are owed money in total' : 'You owe money in total'}
        </div>
        {nudgeText && <div className="hero-nudge">{nudgeText}</div>}
      </div>

      <div className="hero-actions">
        <Button
          onClick={() => openModal('expense')}
          className="bg-[var(--oak)] hover:bg-[var(--oak-hover)] text-white font-semibold cursor-pointer"
        >
          <IconPlus size={16} aria-hidden="true" className="mr-1" />
          <span>Log expense</span>
        </Button>

        <Button
          variant="outline"
          onClick={() => openModal('settle')}
          className="border-[var(--border-strong)] bg-[var(--card)] hover:bg-[var(--sage-tint)] cursor-pointer"
        >
          <span>Settle up</span>
        </Button>
      </div>
    </div>
  );
};
