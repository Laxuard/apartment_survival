import React from 'react';

interface NotificationsSettingsTabProps {
  notifyLowStock: boolean;
  onToggleLowStock: () => void;
  notifyOverdue: boolean;
  onToggleOverdue: () => void;
  notifyBills: boolean;
  onToggleBills: () => void;
}

export const NotificationsSettingsTab: React.FC<NotificationsSettingsTabProps> = ({
  notifyLowStock,
  onToggleLowStock,
  notifyOverdue,
  onToggleOverdue,
  notifyBills,
  onToggleBills,
}) => {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="card-custom overflow-hidden">
        <div className="card-head">
          <div>
            <h3 className="card-title-custom">Apartment Nudges & Alerts</h3>
            <div className="card-title-sub">Automated alerts for low supplies, bills, and debt reminders</div>
          </div>
        </div>

        <div className="divide-y divide-[var(--border)] px-5 sm:px-6">
          {/* Custom Accessible Toggle Switch 1 */}
          <div className="flex items-center justify-between py-4.5">
            <div className="space-y-0.5 pr-4">
              <div className="text-xs font-bold text-[var(--text)]">Pantry Low Stock Warnings</div>
              <div className="text-[11px] text-[var(--muted)] leading-relaxed">
                Notify flatmates when essentials (milk, oil, dish soap) drop to 0 or 1 unit.
              </div>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={notifyLowStock}
              onClick={onToggleLowStock}
              className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer shrink-0 ${
                notifyLowStock ? 'bg-[var(--oak)]' : 'bg-[var(--border-strong)]'
              }`}
            >
              <span
                className={`block w-4 h-4 rounded-full bg-white transition-transform ${
                  notifyLowStock ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Custom Accessible Toggle Switch 2 */}
          <div className="flex items-center justify-between py-4.5">
            <div className="space-y-0.5 pr-4">
              <div className="text-xs font-bold text-[var(--text)]">Overdue Debt Reminders</div>
              <div className="text-[11px] text-[var(--muted)] leading-relaxed">
                Display overdue badges on dashboard cards when flatmate tabs exceed 7 days.
              </div>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={notifyOverdue}
              onClick={onToggleOverdue}
              className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer shrink-0 ${
                notifyOverdue ? 'bg-[var(--oak)]' : 'bg-[var(--border-strong)]'
              }`}
            >
              <span
                className={`block w-4 h-4 rounded-full bg-white transition-transform ${
                  notifyOverdue ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Custom Accessible Toggle Switch 3 */}
          <div className="flex items-center justify-between py-4.5">
            <div className="space-y-0.5 pr-4">
              <div className="text-xs font-bold text-[var(--text)]">Upcoming Utility Bills</div>
              <div className="text-[11px] text-[var(--muted)] leading-relaxed">
                Send ambient reminders 3 days before rent and internet bills are due.
              </div>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={notifyBills}
              onClick={onToggleBills}
              className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer shrink-0 ${
                notifyBills ? 'bg-[var(--oak)]' : 'bg-[var(--border-strong)]'
              }`}
            >
              <span
                className={`block w-4 h-4 rounded-full bg-white transition-transform ${
                  notifyBills ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

