import { create } from 'zustand';
import type { Roommate } from '@/features/roommates/types';

export type ModalType = 'expense' | 'settle' | 'invite' | null;

export interface ExpensePrefill {
  title?: string;
  amount?: number;
  category?: string;
}

interface UIState {
  activeModal: ModalType;
  expensePrefill: ExpensePrefill | null;
  selectedSettleMember: Roommate | null;
  isPaletteOpen: boolean;
  isNotifOpen: boolean;
  activeReceiptId: string | null;

  // Actions
  openModal: (modal: ModalType) => void;
  openExpenseModal: (prefill?: ExpensePrefill) => void;
  openSettleModal: (member?: Roommate | null) => void;
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
  isPaletteOpen: false,
  isNotifOpen: false,
  activeReceiptId: null,

  openModal: (modal) =>
    set({ activeModal: modal, expensePrefill: null, isNotifOpen: false, isPaletteOpen: false }),
  openExpenseModal: (prefill) =>
    set({
      activeModal: 'expense',
      expensePrefill: prefill || null,
      isNotifOpen: false,
      isPaletteOpen: false,
    }),
  openSettleModal: (member = null) =>
    set({
      activeModal: 'settle',
      selectedSettleMember: member || null,
      isNotifOpen: false,
      isPaletteOpen: false,
    }),
  closeModal: () =>
    set({ activeModal: null, expensePrefill: null, selectedSettleMember: null }),
  togglePalette: (open) =>
    set((state) => ({
      isPaletteOpen: open !== undefined ? open : !state.isPaletteOpen,
      isNotifOpen: false,
    })),
  toggleNotif: (open) =>
    set((state) => ({ isNotifOpen: open !== undefined ? open : !state.isNotifOpen })),
  closeAllPopovers: () => set({ isNotifOpen: false }),
  openReceipt: (id) => set({ activeReceiptId: id, isNotifOpen: false }),
  closeReceipt: () => set({ activeReceiptId: null }),
}));
