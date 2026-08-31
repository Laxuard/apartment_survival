import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface OnboardingDraft {
  householdName: string;
  currency: string;
  roommateNames: string[];
  includeStarterTemplates: boolean;
  timezone: string;
}

interface OnboardingState {
  draft: OnboardingDraft;
  hasDraft: boolean;

  setDraft: (partial: Partial<OnboardingDraft>) => void;
  addRoommateName: (name: string) => void;
  removeRoommateName: (index: number) => void;
  clearDraft: () => void;
}

const DEFAULT_DRAFT: OnboardingDraft = {
  householdName: '',
  currency: 'MAD',
  roommateNames: [],
  includeStarterTemplates: true,
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
};

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set) => ({
      draft: DEFAULT_DRAFT,
      hasDraft: false,

      setDraft: (partial) =>
        set((state) => ({
          draft: { ...state.draft, ...partial },
          hasDraft: true,
        })),

      addRoommateName: (name) =>
        set((state) => {
          if (!name.trim() || state.draft.roommateNames.includes(name.trim())) return state;
          return {
            draft: {
              ...state.draft,
              roommateNames: [...state.draft.roommateNames, name.trim()],
            },
            hasDraft: true,
          };
        }),

      removeRoommateName: (index) =>
        set((state) => ({
          draft: {
            ...state.draft,
            roommateNames: state.draft.roommateNames.filter((_, idx) => idx !== index),
          },
        })),

      clearDraft: () =>
        set({
          draft: DEFAULT_DRAFT,
          hasDraft: false,
        }),
    }),
    {
      name: 'apartment-survival-reverse-onboarding',
    }
  )
);
