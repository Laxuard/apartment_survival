import React from 'react';
import { IconWifi, IconHome, IconBolt, IconDroplet } from '@tabler/icons-react';
import { MOCK_BILLS } from '@/features/bills/mocks/billsData';

const getBillIcon = (iconName: string) => {
  switch (iconName) {
    case 'wifi':
      return <IconWifi size={16} />;
    case 'home':
      return <IconHome size={16} />;
    case 'bolt':
      return <IconBolt size={16} />;
    case 'water':
      return <IconDroplet size={16} />;
    default:
      return <IconHome size={16} />;
  }
};

export const UpcomingBillsCard: React.FC = () => {
  return (
    <section className="card-custom" aria-labelledby="bills-title">
      <div className="card-head">
        <h2 className="card-title-custom" id="bills-title">
          Upcoming bills
        </h2>
        <div className="card-title-sub">{MOCK_BILLS.length} due soon</div>
      </div>

      <div className="divide-y divide-[var(--border)]">
        {MOCK_BILLS.map((bill) => (
          <div className="row-item" key={bill.id}>
            <div className="row-icon-box" aria-hidden="true">
              {getBillIcon(bill.iconName)}
            </div>
            <div className="row-body">
              <div className="row-title">{bill.title}</div>
              <div className="row-meta">{bill.dueText}</div>
            </div>
            <div className="row-amount mono">
              {bill.amount.toFixed(2)}
              <span className="currency">{bill.currency}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
