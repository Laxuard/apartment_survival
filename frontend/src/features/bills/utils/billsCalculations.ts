import type { Bill } from '../types';

export interface BillsSummary {
  totalBills: number;
  totalAmount: number;
  urgentBills: Bill[];
  urgentCount: number;
  hasOverdueOrUrgent: boolean;
  formattedTotalAmount: string;
}

/**
 * Universal Bills Summary & Urgent Bill Aggregator
 */
export const calculateBillsSummary = (bills: Bill[], currency: string = 'MAD'): BillsSummary => {
  const totalBills = bills.length;
  const totalAmount = bills.reduce((acc, b) => acc + b.amount, 0);

  // Urgent: Due in <= 3 days or text includes "tomorrow" or "today"
  const urgentBills = bills.filter((b) => {
    const dueDays = b.dueDays ?? 99;
    const dueText = b.dueText.toLowerCase();
    return dueDays <= 3 || dueText.includes('tomorrow') || dueText.includes('today') || dueText.includes('overdue');
  });

  return {
    totalBills,
    totalAmount,
    urgentBills,
    urgentCount: urgentBills.length,
    hasOverdueOrUrgent: urgentBills.length > 0,
    formattedTotalAmount: `${totalAmount.toLocaleString()} ${currency}`,
  };
};

