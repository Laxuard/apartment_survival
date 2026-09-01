export type SplitMethod = 'EQUAL' | 'EXACT' | 'PERCENTAGE' | 'SHARES';
export type SplitAlgorithm = 'DEBT_SIMPLIFIED' | 'DIRECT';

export interface SplitMethodMetadata {
  id: SplitMethod;
  label: string;
  shortLabel: string;
  description: string;
  unitSymbol?: string;
}

export interface SplitAlgorithmMetadata {
  id: SplitAlgorithm;
  label: string;
  description: string;
}

export interface SplitParticipantInput {
  userId: string;
  userName: string;
  avatarColor?: string;
  avatarInitial?: string;
  isCurrentUser?: boolean;
  isPayer?: boolean;
  amount?: number;
  percentage?: number;
  shares?: number;
}

export interface CalculatedSplitShare {
  userId: string;
  userName: string;
  avatarColor?: string;
  avatarInitial?: string;
  assignedAmount: number;
  splitValue?: number;
  percentage?: number;
  shares?: number;
  isPayer: boolean;
  netCredit: number; // Positive if credited, 0 or negative if owing
}

export interface SplitCalculationResult {
  totalAmount: number;
  splitMethod: SplitMethod;
  effectiveMethod: SplitMethod;
  isInheritedFromHousehold: boolean;
  perPersonEqualShare: number;
  payerCredit: number;
  shares: CalculatedSplitShare[];
  isValid: boolean;
  validationError?: string;
  remainingToAllocate: number;
}

export interface CalculateSplitParams {
  totalAmount: number;
  participants: SplitParticipantInput[];
  splitMethod?: SplitMethod | 'DEFAULT';
  householdDefaultSplitMethod?: SplitMethod;
  householdDefaultAllocations?: Record<string, number>;
  payerId?: string;
  customAllocations?: Record<string, number>;
}


