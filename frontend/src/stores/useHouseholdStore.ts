import { create } from 'zustand';

interface HouseholdState {
  activeHouseholdId: string | null;
  setActiveHousehold: (id: string | null) => void;
  setActiveHouseholdId: (id: string | null) => void;
}

export const useHouseholdStore = create<HouseholdState>((set) => ({
  activeHouseholdId: null,
  setActiveHousehold: (activeHouseholdId) => set({ activeHouseholdId }),
  setActiveHouseholdId: (activeHouseholdId) => set({ activeHouseholdId }),
}));
