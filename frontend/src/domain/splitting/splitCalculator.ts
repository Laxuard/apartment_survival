import { DEFAULT_SPLIT_METHOD } from './split.constants';
import type {
  CalculateSplitParams,
  CalculatedSplitShare,
  SplitCalculationResult,
  SplitMethod,
  SplitParticipantInput,
} from './types';

/**
 * Resolves the effective split method, prioritizing expense-specific overrides
 * and falling back to the household-wide default setting.
 */
export const resolveEffectiveSplitMethod = (
  expenseMethod?: SplitMethod | 'DEFAULT',
  householdDefaultMethod?: SplitMethod
): SplitMethod => {
  if (expenseMethod && expenseMethod !== 'DEFAULT') {
    return expenseMethod;
  }
  if (householdDefaultMethod) {
    return householdDefaultMethod;
  }
  return DEFAULT_SPLIT_METHOD;
};

/**
 * Calculates a baseline per-person equal split amount.
 */
export const calculateEqualSplit = (totalAmount: number, participantCount: number): number => {
  if (!totalAmount || totalAmount <= 0 || !participantCount || participantCount <= 0) {
    return 0;
  }
  return Math.round((totalAmount / participantCount) * 100) / 100;
};

/**
 * Calculates the net amount the payer is owed (credited) by the group.
 */
export const calculatePayerCredit = (totalAmount: number, userShare: number): number => {
  const safeTotal = Math.max(0, totalAmount || 0);
  const safeShare = Math.max(0, userShare || 0);
  return Math.max(0, Math.round((safeTotal - safeShare) * 100) / 100);
};

/**
 * 1. EQUAL Calculation (Reconciles 1-cent remainders across first N participants, matching Java backend)
 */
const calculateEqualSplits = (
  totalAmount: number,
  participants: SplitParticipantInput[],
  payerId?: string
): { shares: CalculatedSplitShare[]; payerCredit: number } => {
  const count = participants.length;
  if (count === 0) return { shares: [], payerCredit: 0 };

  const totalCents = Math.round(totalAmount * 100);
  const baseCents = Math.floor(totalCents / count);
  const remainderCents = totalCents - baseCents * count;

  let payerCredit = 0;

  const shares: CalculatedSplitShare[] = participants.map((p, index) => {
    const assignedCents = index < remainderCents ? baseCents + 1 : baseCents;
    const assignedAmount = assignedCents / 100;
    const isPayer = p.userId === payerId || p.isCurrentUser || p.isPayer || false;

    if (isPayer) {
      payerCredit = Math.round((totalAmount - assignedAmount) * 100) / 100;
    }

    return {
      userId: p.userId,
      userName: p.userName,
      avatarColor: p.avatarColor,
      avatarInitial: p.avatarInitial,
      assignedAmount,
      splitValue: undefined,
      percentage: Math.round((100 / count) * 100) / 100,
      shares: 1,
      isPayer,
      netCredit: isPayer ? Math.round((totalAmount - assignedAmount) * 100) / 100 : -assignedAmount,
    };
  });

  return { shares, payerCredit };
};

/**
 * 2. PERCENTAGE Calculation (Allocates by percentage and verifies 100% total)
 */
const calculatePercentageSplits = (
  totalAmount: number,
  participants: SplitParticipantInput[],
  customAllocations?: Record<string, number>,
  payerId?: string
): {
  shares: CalculatedSplitShare[];
  payerCredit: number;
  isValid: boolean;
  validationError?: string;
  remainingToAllocate: number;
} => {
  const count = participants.length;
  if (count === 0) {
    return { shares: [], payerCredit: 0, isValid: true, remainingToAllocate: 0 };
  }

  const defaultPct = Math.round((100 / count) * 100) / 100;
  let totalPct = 0;

  participants.forEach((p) => {
    const val = customAllocations && customAllocations[p.userId] !== undefined
      ? customAllocations[p.userId]
      : p.percentage ?? defaultPct;
    totalPct += val;
  });

  totalPct = Math.round(totalPct * 100) / 100;
  const remainingPct = Math.round((100 - totalPct) * 100) / 100;
  const isValid = Math.abs(remainingPct) < 0.05;

  let totalAssignedCents = 0;
  let payerCredit = 0;

  const rawShares = participants.map((p) => {
    const pct = customAllocations && customAllocations[p.userId] !== undefined
      ? customAllocations[p.userId]
      : p.percentage ?? defaultPct;
    const cents = Math.floor((totalAmount * pct * 100) / 100);
    totalAssignedCents += cents;
    const isPayer = p.userId === payerId || p.isCurrentUser || p.isPayer || false;

    return {
      p,
      pct,
      cents,
      isPayer,
    };
  });

  // Reconcile 1-cent rounding drift with totalAmount when 100% is met
  const expectedCents = Math.round(totalAmount * 100);
  const driftCents = expectedCents - totalAssignedCents;

  const shares: CalculatedSplitShare[] = rawShares.map((item, index) => {
    const adjustedCents = (isValid && index < driftCents) ? item.cents + 1 : item.cents;
    const assignedAmount = adjustedCents / 100;

    if (item.isPayer) {
      payerCredit = Math.round((totalAmount - assignedAmount) * 100) / 100;
    }

    return {
      userId: item.p.userId,
      userName: item.p.userName,
      avatarColor: item.p.avatarColor,
      avatarInitial: item.p.avatarInitial,
      assignedAmount,
      splitValue: item.pct,
      percentage: item.pct,
      isPayer: item.isPayer,
      netCredit: item.isPayer ? Math.round((totalAmount - assignedAmount) * 100) / 100 : -assignedAmount,
    };
  });

  let validationError: string | undefined;
  if (!isValid) {
    validationError = remainingPct > 0
      ? `Percentages total ${totalPct}%. Please allocate remaining ${remainingPct}%.`
      : `Percentages total ${totalPct}%. Total exceeds 100% by ${Math.abs(remainingPct)}%.`;
  }

  return {
    shares,
    payerCredit,
    isValid,
    validationError,
    remainingToAllocate: remainingPct,
  };
};

/**
 * 3. EXACT Calculation (Validates exact monetary amounts sum to total amount)
 */
const calculateExactSplits = (
  totalAmount: number,
  participants: SplitParticipantInput[],
  customAllocations?: Record<string, number>,
  payerId?: string
): {
  shares: CalculatedSplitShare[];
  payerCredit: number;
  isValid: boolean;
  validationError?: string;
  remainingToAllocate: number;
} => {
  const count = participants.length;
  if (count === 0) {
    return { shares: [], payerCredit: 0, isValid: true, remainingToAllocate: 0 };
  }

  const defaultAmt = calculateEqualSplit(totalAmount, count);
  let totalAssigned = 0;
  let payerCredit = 0;

  const shares: CalculatedSplitShare[] = participants.map((p) => {
    const amt = customAllocations && customAllocations[p.userId] !== undefined
      ? customAllocations[p.userId]
      : p.amount ?? defaultAmt;
    totalAssigned += amt;
    const isPayer = p.userId === payerId || p.isCurrentUser || p.isPayer || false;

    if (isPayer) {
      payerCredit = Math.round((totalAmount - amt) * 100) / 100;
    }

    return {
      userId: p.userId,
      userName: p.userName,
      avatarColor: p.avatarColor,
      avatarInitial: p.avatarInitial,
      assignedAmount: amt,
      splitValue: amt,
      isPayer,
      netCredit: isPayer ? Math.round((totalAmount - amt) * 100) / 100 : -amt,
    };
  });

  totalAssigned = Math.round(totalAssigned * 100) / 100;
  const remaining = Math.round((totalAmount - totalAssigned) * 100) / 100;
  const isValid = Math.abs(remaining) < 0.01;

  let validationError: string | undefined;
  if (!isValid) {
    validationError = remaining > 0
      ? `Allocated ${totalAssigned}. ${remaining} remaining to reach total.`
      : `Allocated ${totalAssigned}. Exceeds total by ${Math.abs(remaining)}.`;
  }

  return {
    shares,
    payerCredit,
    isValid,
    validationError,
    remainingToAllocate: remaining,
  };
};

/**
 * 4. SHARES Calculation (Allocates by fractional integer unit shares)
 */
const calculateSharesSplits = (
  totalAmount: number,
  participants: SplitParticipantInput[],
  customAllocations?: Record<string, number>,
  payerId?: string
): {
  shares: CalculatedSplitShare[];
  payerCredit: number;
  isValid: boolean;
  validationError?: string;
  remainingToAllocate: number;
} => {
  const count = participants.length;
  if (count === 0) {
    return { shares: [], payerCredit: 0, isValid: true, remainingToAllocate: 0 };
  }

  let totalUnitShares = 0;
  participants.forEach((p) => {
    const val = customAllocations && customAllocations[p.userId] !== undefined
      ? customAllocations[p.userId]
      : p.shares ?? 1;
    totalUnitShares += Math.max(1, val);
  });

  const totalCents = Math.round(totalAmount * 100);
  let totalAssignedCents = 0;
  let payerCredit = 0;

  const rawShares = participants.map((p) => {
    const unitShare = customAllocations && customAllocations[p.userId] !== undefined
      ? customAllocations[p.userId]
      : p.shares ?? 1;
    const cents = Math.floor((totalCents * unitShare) / totalUnitShares);
    totalAssignedCents += cents;
    const isPayer = p.userId === payerId || p.isCurrentUser || p.isPayer || false;

    return {
      p,
      unitShare,
      cents,
      isPayer,
    };
  });

  const driftCents = totalCents - totalAssignedCents;

  const shares: CalculatedSplitShare[] = rawShares.map((item, index) => {
    const adjustedCents = index < driftCents ? item.cents + 1 : item.cents;
    const assignedAmount = adjustedCents / 100;

    if (item.isPayer) {
      payerCredit = Math.round((totalAmount - assignedAmount) * 100) / 100;
    }

    return {
      userId: item.p.userId,
      userName: item.p.userName,
      avatarColor: item.p.avatarColor,
      avatarInitial: item.p.avatarInitial,
      assignedAmount,
      splitValue: item.unitShare,
      shares: item.unitShare,
      percentage: Math.round((item.unitShare / totalUnitShares) * 1000) / 10,
      isPayer: item.isPayer,
      netCredit: item.isPayer ? Math.round((totalAmount - assignedAmount) * 100) / 100 : -assignedAmount,
    };
  });

  return {
    shares,
    payerCredit,
    isValid: true,
    remainingToAllocate: 0,
  };
};

/**
 * Comprehensive Universal Split Calculator.
 * Calculates participant allocations, payer credits, and validation metrics across all methods.
 */
export const calculateParticipantShares = ({
  totalAmount,
  participants,
  splitMethod = 'DEFAULT',
  householdDefaultSplitMethod = 'EQUAL',
  householdDefaultAllocations,
  payerId,
  customAllocations,
}: CalculateSplitParams): SplitCalculationResult => {
  const safeTotal = Math.max(0, totalAmount || 0);
  const safeParticipants = participants.length > 0 ? participants : [];
  const effectiveMethod = resolveEffectiveSplitMethod(splitMethod, householdDefaultSplitMethod);
  const isInherited = splitMethod === 'DEFAULT' || !splitMethod;
  const perPersonEqualShare = calculateEqualSplit(safeTotal, safeParticipants.length || 1);

  // When inherited or when custom is empty, use household default allocations if applicable
  const effectiveAllocations = customAllocations && Object.keys(customAllocations).length > 0
    ? customAllocations
    : householdDefaultAllocations;

  if (safeParticipants.length === 0 || safeTotal === 0) {
    return {
      totalAmount: safeTotal,
      splitMethod: effectiveMethod,
      effectiveMethod,
      isInheritedFromHousehold: isInherited,
      perPersonEqualShare: 0,
      payerCredit: 0,
      shares: [],
      isValid: true,
      remainingToAllocate: 0,
    };
  }

  switch (effectiveMethod) {
    case 'EQUAL': {
      const { shares, payerCredit } = calculateEqualSplits(safeTotal, safeParticipants, payerId);
      return {
        totalAmount: safeTotal,
        splitMethod: effectiveMethod,
        effectiveMethod,
        isInheritedFromHousehold: isInherited,
        perPersonEqualShare,
        payerCredit,
        shares,
        isValid: true,
        remainingToAllocate: 0,
      };
    }
    case 'PERCENTAGE': {
      const { shares, payerCredit, isValid, validationError, remainingToAllocate } =
        calculatePercentageSplits(safeTotal, safeParticipants, effectiveAllocations, payerId);
      return {
        totalAmount: safeTotal,
        splitMethod: effectiveMethod,
        effectiveMethod,
        isInheritedFromHousehold: isInherited,
        perPersonEqualShare,
        payerCredit,
        shares,
        isValid,
        validationError,
        remainingToAllocate,
      };
    }
    case 'EXACT': {
      const { shares, payerCredit, isValid, validationError, remainingToAllocate } =
        calculateExactSplits(safeTotal, safeParticipants, effectiveAllocations, payerId);
      return {
        totalAmount: safeTotal,
        splitMethod: effectiveMethod,
        effectiveMethod,
        isInheritedFromHousehold: isInherited,
        perPersonEqualShare,
        payerCredit,
        shares,
        isValid,
        validationError,
        remainingToAllocate,
      };
    }
    case 'SHARES': {
      const { shares, payerCredit, isValid, validationError, remainingToAllocate } =
        calculateSharesSplits(safeTotal, safeParticipants, effectiveAllocations, payerId);
      return {
        totalAmount: safeTotal,
        splitMethod: effectiveMethod,
        effectiveMethod,
        isInheritedFromHousehold: isInherited,
        perPersonEqualShare,
        payerCredit,
        shares,
        isValid,
        validationError,
        remainingToAllocate,
      };
    }
    default: {
      const { shares, payerCredit } = calculateEqualSplits(safeTotal, safeParticipants, payerId);
      return {
        totalAmount: safeTotal,
        splitMethod: 'EQUAL',
        effectiveMethod: 'EQUAL',
        isInheritedFromHousehold: isInherited,
        perPersonEqualShare,
        payerCredit,
        shares,
        isValid: true,
        remainingToAllocate: 0,
      };
    }
  }
};


