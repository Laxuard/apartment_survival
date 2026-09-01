import { DEFAULT_CURRENCY, getClientTimezone } from '@/domain';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface OnboardingDraft {
  householdName: string;
  hostName: string;
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
  addRoommateNames: (names: string[]) => void;
  removeRoommateName: (index: number) => void;
  clearDraft: () => void;
}

const DEFAULT_DRAFT: OnboardingDraft = {
  householdName: '',
  hostName: '',
  currency: DEFAULT_CURRENCY,
  roommateNames: [],
  includeStarterTemplates: true,
  timezone: getClientTimezone(),
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
          const trimmed = name.trim();
          if (!trimmed || state.draft.roommateNames.some((n) => n.toLowerCase() === trimmed.toLowerCase())) return state;
          return {
            draft: {
              ...state.draft,
              roommateNames: [...state.draft.roommateNames, trimmed],
            },
            hasDraft: true,
          };
        }),

      addRoommateNames: (names) =>
        set((state) => {
          const existing = new Set(state.draft.roommateNames.map((n) => n.toLowerCase()));
          const added: string[] = [];
          for (const raw of names) {
            const trimmed = raw.trim();
            if (trimmed && !existing.has(trimmed.toLowerCase())) {
              existing.add(trimmed.toLowerCase());
              added.push(trimmed);
            }
          }
          if (added.length === 0) return state;
          return {
            draft: {
              ...state.draft,
              roommateNames: [...state.draft.roommateNames, ...added],
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
