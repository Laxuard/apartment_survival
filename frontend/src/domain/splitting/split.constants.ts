import type { SplitAlgorithmMetadata, SplitMethod, SplitMethodMetadata } from './types';

export const DEFAULT_SPLIT_METHOD: SplitMethod = 'EQUAL';

export const SPLIT_METHODS: SplitMethodMetadata[] = [
  {
    id: 'EQUAL',
    label: 'Equal Split',
    shortLabel: 'Equal',
    description: 'Split evenly among all roommates with exact cent remainder distribution.',
    unitSymbol: '=',
  },
  {
    id: 'PERCENTAGE',
    label: 'By Percentage',
    shortLabel: 'Percentage',
    description: 'Define custom share percentages totaling exactly 100.00%.',
    unitSymbol: '%',
  },
  {
    id: 'EXACT',
    label: 'Exact Amounts',
    shortLabel: 'Exact',
    description: 'Assign specific monetary values per participant matching the receipt.',
    unitSymbol: '123',
  },
  {
    id: 'SHARES',
    label: 'Weighted Shares',
    shortLabel: 'Shares',
    description: 'Distribute costs proportionally based on integer unit shares (e.g. 1 share, 2 shares).',
    unitSymbol: '✕',
  },
];

export const SPLIT_METHOD_MAP: Record<SplitMethod, SplitMethodMetadata> = SPLIT_METHODS.reduce(
  (acc, method) => {
    acc[method.id] = method;
    return acc;
  },
  {} as Record<SplitMethod, SplitMethodMetadata>
);

export const SPLIT_ALGORITHMS: SplitAlgorithmMetadata[] = [
  {
    id: 'DEBT_SIMPLIFIED',
    label: 'Minimum Cash Flow',
    description: 'Graph algorithm automatically cancels circular debts to minimize total bank transfers.',
  },
  {
    id: 'DIRECT',
    label: 'Direct 1-to-1 Ledger',
    description: 'Maintains explicit individual debt balances between each pair of flatmates.',
  },
];


