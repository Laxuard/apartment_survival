import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { HouseholdMembership } from '@/types';
interface HouseholdState {
  households: HouseholdMembership[];
  activeHouseholdId: string | null;

  // Selectors
  getActiveHousehold: () => HouseholdMembership | null;
  getActiveCurrency: () => string;

  // Actions
  setHouseholds: (list: HouseholdMembership[]) => void;
  setActiveHousehold: (id: string) => void;
  addHousehold: (household: HouseholdMembership) => void;
  updateActiveHousehold: (data: Partial<HouseholdMembership>) => void;
}

export const useHouseholdStore = create<HouseholdState>()(
  persist(
    (set, get) => ({
      households: [],
      activeHouseholdId: null,

      getActiveHousehold: () => {
        const { households, activeHouseholdId } = get();
        return (
          households.find((h) => h.id === activeHouseholdId) ||
          households[0] ||
          null
        );
      },

      getActiveCurrency: () => {
        const { getActiveHousehold } = get();
        return getActiveHousehold()?.currency || 'MAD';
      },

      setHouseholds: (households) =>
        set({
          households,
          activeHouseholdId: households.length > 0 ? households[0].id : null,
        }),

      setActiveHousehold: (activeHouseholdId) => set({ activeHouseholdId }),

      addHousehold: (household) =>
        set((state) => ({
          households: [...state.households, household],
          activeHouseholdId: household.id,
        })),

      updateActiveHousehold: (data) =>
        set((state) => ({
          households: state.households.map((h) =>
            h.id === state.activeHouseholdId ? { ...h, ...data } : h
          ),
        })),
    }),
    {
      name: 'apartment-survival-household',
    }
  )
);
