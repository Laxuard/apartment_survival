export const queryKeys = {
  household: (id: string) => ['household', id] as const,
  dashboard: (id: string) => ['dashboard', id] as const,
  balances: (id: string) => ['balances', id] as const,
  expenses: {
    all: (id: string) => ['expenses', id] as const,
    list: (id: string, filters?: Record<string, unknown>) => ['expenses', id, 'list', filters] as const,
  },
  bills: {
    all: (id: string) => ['bills', id] as const,
    occurrences: (id: string) => ['bills', id, 'occurrences'] as const,
  },
  pantry: {
    all: (id: string) => ['pantry', id] as const,
    runs: (id: string) => ['pantry', id, 'runs'] as const,
  },
  roommates: (id: string) => ['roommates', id] as const,
};
