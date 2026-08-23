import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { HouseholdMembership } from '@/types';

// Initial mock households to provide rich demo experience out of the box
const INITIAL_HOUSEHOLDS: HouseholdMembership[] = [
  {
    id: 'apt-4b',
    name: 'Apartment 4B',
    role: 'ADMIN',
    currency: 'MAD',
    memberCount: 3,
  },
  {
    id: 'summer-flat',
    name: 'Summer Beach Flat',
    role: 'MEMBER',
    currency: 'MAD',
    memberCount: 4,
  },
];

interface HouseholdState {
  households: HouseholdMembership[];
  activeHouseholdId: string | null;

  // Selectors
  getActiveHousehold: () => HouseholdMembership | null;

  // Actions
  setHouseholds: (list: HouseholdMembership[]) => void;
  setActiveHousehold: (id: string) => void;
  addHousehold: (household: HouseholdMembership) => void;
}

export const useHouseholdStore = create<HouseholdState>()(
  persist(
    (set, get) => ({
      households: INITIAL_HOUSEHOLDS,
      activeHouseholdId: 'apt-4b',

      getActiveHousehold: () => {
        const { households, activeHouseholdId } = get();
        return (
          households.find((h) => h.id === activeHouseholdId) ||
          households[0] ||
          null
        );
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
    }),
    {
      name: 'apartment-survival-household',
    }
  )
);
