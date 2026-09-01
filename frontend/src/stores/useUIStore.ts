import { create } from 'zustand';
import type { Roommate } from '@/features/roommates/types';
import type { RecurringBill } from '@/features/bills/types';

export type ModalType = 'expense' | 'settle' | 'invite' | 'bill' | 'manageBills' | 'markBillPaid' | null;

export interface ExpensePrefill {
  title?: string;
  amount?: number;
  category?: string;
}

interface UIState {
  activeModal: ModalType;
  expensePrefill: ExpensePrefill | null;
  selectedSettleMember: Roommate | null;
  selectedBillForPayment: RecurringBill | null;
  isPaletteOpen: boolean;
  isNotifOpen: boolean;
  activeReceiptId: string | null;

  // Actions
  openModal: (modal: ModalType) => void;
  openExpenseModal: (prefill?: ExpensePrefill) => void;
  openSettleModal: (member?: Roommate | null) => void;
  openBillModal: () => void;
  openManageBillsModal: () => void;
  openMarkBillPaidModal: (bill: RecurringBill) => void;
  closeModal: () => void;
  togglePalette: (open?: boolean) => void;
  toggleNotif: (open?: boolean) => void;
  closeAllPopovers: () => void;
  openReceipt: (id: string) => void;
  closeReceipt: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  activeModal: null,
  expensePrefill: null,
  selectedSettleMember: null,
  selectedBillForPayment: null,
  isPaletteOpen: false,
  isNotifOpen: false,
  activeReceiptId: null,

  openModal: (modal: ModalType) =>
    set({
      activeModal: modal,
      expensePrefill: null,
      selectedBillForPayment: null,
      isNotifOpen: false,
      isPaletteOpen: false,
    }),

  openExpenseModal: (prefill?: ExpensePrefill) =>
    set({
      activeModal: 'expense',
      expensePrefill: prefill || null,
      selectedBillForPayment: null,
      isNotifOpen: false,
      isPaletteOpen: false,
    }),

  openSettleModal: (member?: Roommate | null) =>
    set({
      activeModal: 'settle',
      selectedSettleMember: member || null,
      selectedBillForPayment: null,
      isNotifOpen: false,
      isPaletteOpen: false,
    }),

  openBillModal: () =>
    set({
      activeModal: 'bill',
      expensePrefill: null,
      selectedBillForPayment: null,
      isNotifOpen: false,
      isPaletteOpen: false,
    }),

  openManageBillsModal: () =>
    set({
      activeModal: 'manageBills',
      expensePrefill: null,
      selectedBillForPayment: null,
      isNotifOpen: false,
      isPaletteOpen: false,
    }),

  openMarkBillPaidModal: (bill: RecurringBill) =>
    set({
      activeModal: 'markBillPaid',
      selectedBillForPayment: bill,
      isNotifOpen: false,
      isPaletteOpen: false,
    }),

  closeModal: () =>
    set({
      activeModal: null,
      expensePrefill: null,
      selectedSettleMember: null,
      selectedBillForPayment: null,
    }),

  togglePalette: (open?: boolean) =>
    set((state) => ({
      isPaletteOpen: open !== undefined ? open : !state.isPaletteOpen,
      isNotifOpen: false,
    })),

  toggleNotif: (open?: boolean) =>
    set((state) => ({
      isNotifOpen: open !== undefined ? open : !state.isNotifOpen,
    })),

  closeAllPopovers: () => set({ isNotifOpen: false }),

  openReceipt: (id: string) => set({ activeReceiptId: id, isNotifOpen: false }),

  closeReceipt: () => set({ activeReceiptId: null }),
}));
