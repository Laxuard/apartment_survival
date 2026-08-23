import { create } from 'zustand';

export type ModalType = 'expense' | 'settle' | 'invite' | null;

interface UIState {
  activeModal: ModalType;
  isPaletteOpen: boolean;
  isNotifOpen: boolean;
  activeReceiptId: string | null;

  // Actions
  openModal: (modal: ModalType) => void;
  closeModal: () => void;
  togglePalette: (open?: boolean) => void;
  toggleNotif: (open?: boolean) => void;
  closeAllPopovers: () => void;
  openReceipt: (id: string) => void;
  closeReceipt: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  activeModal: null,
  isPaletteOpen: false,
  isNotifOpen: false,
  activeReceiptId: null,

  openModal: (modal) => set({ activeModal: modal, isNotifOpen: false, isPaletteOpen: false }),
  closeModal: () => set({ activeModal: null }),
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
