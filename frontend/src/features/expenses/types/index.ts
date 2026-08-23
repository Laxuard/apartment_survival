/**
 * Expense & Balance Domain Types & DTOs
 */

export type ExpenseCategory =
  | 'GROCERIES'
  | 'UTILITIES'
  | 'RENT'
  | 'HOUSEHOLD'
  | 'OTHER';

export type SplitMethod = 'EQUAL' | 'EXACT' | 'PERCENTAGE';

export interface ExpenseSplit {
  userId: string;
  userName: string;
  amount: number;
}

export interface Expense {
  id: string;
  description: string;
  amount: number;
  currency: string;
  payerId: string;
  payerName: string;
  category: ExpenseCategory;
  splitMethod: SplitMethod;
  splits: ExpenseSplit[];
  createdAt: string;
  userShare?: number;
  receiptUrl?: string;
  auditInfo?: string;
}

export interface BackendExpenseSummary {
  expenseId: string;
  householdId: string;
  paidByUserId: string;
  paidByUsername: string;
  title: string;
  amount: number;
  currency: string;
  category: ExpenseCategory;
  splitType: SplitMethod;
  expenseDate: string;
  receiptUrl?: string;
  participantCount: number;
  createdAt: string;
}

export interface BackendSplitDetail {
  splitId: string;
  userId: string;
  username: string;
  assignedAmount: number;
  splitValue: number;
}

export interface BackendExpenseDetail {
  expenseId: string;
  householdId: string;
  paidByUserId: string;
  paidByUsername: string;
  title: string;
  description?: string;
  amount: number;
  currency: string;
  category: ExpenseCategory;
  splitType: SplitMethod;
  expenseDate: string;
  receiptUrl?: string;
  splits: BackendSplitDetail[];
  createdAt: string;
}

export interface CreateExpenseBackendDto {
  title: string;
  description?: string;
  amount: number;
  category: string;
  splitType: SplitMethod;
  expenseDate?: string;
  splits?: Array<{
    userId: string;
    assignedAmount?: number;
    splitValue?: number;
  }>;
}

export interface UserBalance {
  userId: string;
  username: string;
  totalPaid: number;
  totalAssigned: number;
  totalSettledPaid: number;
  totalSettledReceived: number;
  netBalance: number;
}

export interface DebtTransfer {
  fromUserId: string;
  fromUsername: string;
  toUserId: string;
  toUsername: string;
  amount: number;
}

export interface HouseholdBalancesResponse {
  householdId: string;
  currency: string;
  members: UserBalance[];
  simplifiedDebts: DebtTransfer[];
}

export interface CreateSettlementDto {
  recipientId: string;
  amount: number;
  notes?: string;
}

export interface SettlementDetail {
  settlementId: string;
  payerId: string;
  payerName: string;
  recipientId: string;
  recipientName: string;
  amount: number;
  currency: string;
  settledAt: string;
}
