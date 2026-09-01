import React from 'react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  IconBolt,
  IconHome2,
  IconTools,
  IconReceipt2,
  IconPlus,
  IconTrash,
  IconCheck,
  IconCalendar,
} from '@tabler/icons-react';
import { useUIStore } from '@/stores/useUIStore';
import { useBillsSummary } from '../hooks/useBillsSummary';
import { getBillDueInfo, getCurrentPeriod } from '../utils/billsCalculations';
import { formatMoney } from '@/domain';
import type { RecurringBill } from '../types';

export const ManageBillsModal: React.FC = () => {
  const { activeModal, closeModal, openBillModal, openMarkBillPaidModal } = useUIStore();
  const isOpen = activeModal === 'manageBills';

  const { bills = [], currency, deleteBill } = useBillsSummary();
  const currentPeriod = getCurrentPeriod();


  const handleDelete = async (bill: RecurringBill) => {
    if (confirm(`Remove recurring schedule for "${bill.title}"?`)) {
      try {
        await deleteBill(bill.id);
        toast.success(`Removed recurring bill: ${bill.title}`);
      } catch (err) {
        toast.error('Failed to remove bill');
      }
    }
  };

  const getCategoryIcon = (category: string, iconName?: string) => {
    if (category === 'RENT' || iconName === 'home') return IconHome2;
    if (category === 'MAINTENANCE' || iconName === 'tools') return IconTools;
    if (category === 'UTILITIES' || iconName === 'bolt') return IconBolt;
    return IconReceipt2;
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && closeModal()}>
      <DialogContent className="max-w-lg w-full p-0 bg-[var(--card)] border border-[var(--border-strong)] shadow-2xl rounded-2xl overflow-hidden">
        {/* Header */}
        <DialogHeader className="p-5 pb-4 border-b border-[var(--border)] bg-[var(--canvas)]/40 flex flex-row items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[var(--oak-tint)]/60 text-[var(--oak)] flex items-center justify-center border border-[var(--oak)]/30 shrink-0">
              <IconCalendar size={20} />
            </div>
            <div>
              <DialogTitle className="text-base font-semibold text-[var(--text)]">
                Manage Recurring Bills
              </DialogTitle>
              <p className="text-xs text-[var(--muted)] mt-0.5">
                {bills.length} active bill templates configured
              </p>
            </div>
          </div>
          <Button
            size="sm"
            onClick={() => {
              closeModal();
              openBillModal();
            }}
            className="text-xs rounded-xl flex items-center gap-1.5 shadow-2xs cursor-pointer"
          >
            <IconPlus size={14} />
            <span>Add Bill</span>
          </Button>
        </DialogHeader>

        {/* Content */}
        <div className="p-5 max-h-[60vh] overflow-y-auto space-y-3">
          {bills.length === 0 ? (
            <div className="py-10 text-center space-y-3">
              <div className="w-12 h-12 rounded-xl bg-[var(--canvas)] border border-[var(--border)] text-[var(--muted)] flex items-center justify-center mx-auto">
                <IconReceipt2 size={24} />
              </div>
              <div className="space-y-1">
                <div className="font-semibold text-sm text-[var(--text)]">No recurring bills set up</div>
                <p className="text-xs text-[var(--muted)] max-w-xs mx-auto">
                  Add monthly rent, Wi-Fi fiber, water, or electricity to automatically track cycles.
                </p>
              </div>
              <Button
                size="sm"
                onClick={() => {
                  closeModal();
                  openBillModal();
                }}
                className="mt-2 text-xs rounded-xl"
              >
                <IconPlus size={14} />
                <span>Set Up First Bill</span>
              </Button>
            </div>
          ) : (
            bills.map((bill) => {
              const Icon = getCategoryIcon(bill.category, bill.iconName);
              const dueInfo = getBillDueInfo(bill);
              const isPaidCurrent = bill.lastPaidPeriod === currentPeriod;

              return (
                <div
                  key={bill.id}
                  className="p-3.5 rounded-xl border border-[var(--border)] bg-[var(--canvas)]/50 hover:bg-[var(--canvas)] transition-all flex items-center justify-between gap-3 group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-[var(--card)] border border-[var(--border)] flex items-center justify-center text-[var(--text)] shrink-0 shadow-2xs">
                      <Icon size={20} className="text-[var(--oak)]" />
                    </div>
                    <div className="min-w-0 space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-xs text-[var(--text)] truncate">
                          {bill.title}
                        </span>
                        {isPaidCurrent ? (
                          <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-600 border-emerald-500/20 py-0 px-1.5">
                            Paid for {dueInfo.monthText}
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-[10px] text-[var(--muted)] border-[var(--border)] py-0 px-1.5">
                            {dueInfo.dueText}
                          </Badge>
                        )}
                      </div>
                      <div className="text-[11px] text-[var(--muted)] flex items-center gap-2">
                        <span>Day {bill.dueDayOfMonth} of month</span>
                        <span>•</span>
                        <span>Equal split</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <div className="text-right mr-1">
                      <div className="font-mono font-bold text-xs text-[var(--text)]">
                        {formatMoney(bill.amount, bill.currency || currency)}
                      </div>
                    </div>

                    {!isPaidCurrent ? (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          closeModal();
                          openMarkBillPaidModal(bill);
                        }}
                        className="h-8 text-xs px-2.5 rounded-lg border-[var(--oak)]/40 text-[var(--oak)] hover:bg-[var(--oak-tint)]/30 hover:border-[var(--oak)] cursor-pointer"
                      >
                        <IconCheck size={13} className="mr-1" />
                        <span>Mark Paid</span>
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          closeModal();
                          openMarkBillPaidModal(bill);
                        }}
                        className="h-8 text-[11px] text-[var(--muted)] hover:text-[var(--text)] px-2 rounded-lg"
                        title="Re-record another payment for this cycle"
                      >
                        Pay Again
                      </Button>
                    )}

                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleDelete(bill)}
                      className="h-8 w-8 text-[var(--muted)] hover:text-destructive hover:bg-destructive/10 rounded-lg cursor-pointer"
                      title="Delete recurring bill template"
                    >
                      <IconTrash size={14} />
                    </Button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

