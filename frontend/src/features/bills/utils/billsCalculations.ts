import { DEFAULT_CURRENCY, formatMoney } from '@/domain';
import type { Bill, RecurringBill } from '../types';

export interface BillsSummary {
  totalBills: number;
  totalAmount: number;
  urgentBills: RecurringBill[];
  urgentCount: number;
  hasOverdueOrUrgent: boolean;
  formattedTotalAmount: string;
}

export interface BillDueInfo {
  isPaidForCurrentCycle: boolean;
  isDue: boolean;
  isUrgent: boolean;
  daysRemaining: number;
  dueText: string;
  monthText: string;
  dayText: string;
  formattedPeriod: string;
}

const MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

const FULL_MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export const getCurrentPeriod = (date: Date = new Date()): string => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
};

export const getCurrentMonthName = (date: Date = new Date(), full: boolean = true): string => {
  const m = date.getMonth();
  return full ? FULL_MONTH_NAMES[m] : MONTH_NAMES[m];
};

export const getBillDueInfo = (
  bill: RecurringBill | Bill,
  referenceDate: Date = new Date()
): BillDueInfo => {
  const currentPeriod = getCurrentPeriod(referenceDate);
  const currentDay = referenceDate.getDate();
  const currentMonthIdx = referenceDate.getMonth();
  const isPaidForCurrentCycle =
    bill.lastPaidPeriod === currentPeriod || (bill as Bill).isPaid === true;

  // Determine the due day of month (1 to 31)
  let dueDay = bill.dueDayOfMonth;
  if (dueDay == null) {
    if ((bill as Bill).dueDays !== undefined) {
      dueDay = Math.min(31, Math.max(1, currentDay + (bill as Bill).dueDays));
    } else {
      dueDay = 1;
    }
  }

  const daysRemaining = dueDay - currentDay;
  const monthAbbr = MONTH_NAMES[currentMonthIdx];
  const fullMonth = FULL_MONTH_NAMES[currentMonthIdx];

  let dueText = '';
  let isDue = false;
  let isUrgent = false;

  if (isPaidForCurrentCycle) {
    dueText = `Paid for ${monthAbbr}`;
    isDue = false;
    isUrgent = false;
  } else {
    // Check if due in current cycle (within 7 days or overdue or today/tomorrow)
    if (daysRemaining < 0) {
      dueText = `Overdue by ${Math.abs(daysRemaining)}d`;
      isDue = true;
      isUrgent = true;
    } else if (daysRemaining === 0) {
      dueText = 'Due today';
      isDue = true;
      isUrgent = true;
    } else if (daysRemaining === 1) {
      dueText = 'Due tomorrow';
      isDue = true;
      isUrgent = true;
    } else if (daysRemaining <= 3) {
      dueText = `Due in ${daysRemaining} days`;
      isDue = true;
      isUrgent = true;
    } else if (daysRemaining <= 7) {
      dueText = `Due in ${daysRemaining} days`;
      isDue = true;
      isUrgent = false;
    } else {
      dueText = `Due ${monthAbbr} ${dueDay}`;
      isDue = false;
      isUrgent = false;
    }
  }

  return {
    isPaidForCurrentCycle,
    isDue,
    isUrgent,
    daysRemaining,
    dueText: (bill as Bill).dueText && !(bill as RecurringBill).dueDayOfMonth ? (bill as Bill).dueText : dueText,
    monthText: monthAbbr,
    dayText: String(dueDay).padStart(2, '0'),
    formattedPeriod: fullMonth,
  };
};

/**
 * Universal Bills Summary & Urgent Bill Aggregator
 */
export const calculateBillsSummary = (
  bills: RecurringBill[],
  currency: string = DEFAULT_CURRENCY
): BillsSummary => {
  const totalBills = bills.length;
  const totalAmount = bills.reduce((acc, b) => acc + (b.amount || 0), 0);

  const urgentBills = bills.filter((b) => {
    const info = getBillDueInfo(b);
    return !info.isPaidForCurrentCycle && (info.isDue || info.isUrgent);
  });

  return {
    totalBills,
    totalAmount,
    urgentBills,
    urgentCount: urgentBills.length,
    hasOverdueOrUrgent: urgentBills.length > 0,
    formattedTotalAmount: formatMoney(totalAmount, currency, { decimals: 0 }),
  };
};


