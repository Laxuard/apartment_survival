import { describe, it, expect } from 'vitest';
import {
  calculateEqualSplit,
  calculatePayerCredit,
  calculateParticipantShares,
  resolveEffectiveSplitMethod,
} from './splitCalculator';
import type { SplitParticipantInput } from './types';

describe('splitCalculator Domain Logic', () => {
  const alice: SplitParticipantInput = { userId: 'user-1', userName: 'Alice', isCurrentUser: true };
  const bob: SplitParticipantInput = { userId: 'user-2', userName: 'Bob' };
  const charlie: SplitParticipantInput = { userId: 'user-3', userName: 'Charlie' };

  describe('resolveEffectiveSplitMethod', () => {
    it('prioritizes explicit expense method over household default', () => {
      expect(resolveEffectiveSplitMethod('PERCENTAGE', 'EQUAL')).toBe('PERCENTAGE');
    });

    it('falls back to household default if expense is DEFAULT or undefined', () => {
      expect(resolveEffectiveSplitMethod('DEFAULT', 'SHARES')).toBe('SHARES');
      expect(resolveEffectiveSplitMethod(undefined, 'EXACT')).toBe('EXACT');
    });

    it('falls back to EQUAL if neither is provided', () => {
      expect(resolveEffectiveSplitMethod(undefined, undefined)).toBe('EQUAL');
    });
  });

  describe('calculateEqualSplit & calculatePayerCredit', () => {
    it('calculates equal share correctly', () => {
      expect(calculateEqualSplit(100, 3)).toBe(33.33);
      expect(calculateEqualSplit(0, 3)).toBe(0);
      expect(calculateEqualSplit(100, 0)).toBe(0);
    });

    it('calculates payer credit accurately', () => {
      expect(calculatePayerCredit(100, 33.33)).toBe(66.67);
      expect(calculatePayerCredit(0, 0)).toBe(0);
    });
  });

  describe('calculateParticipantShares - EQUAL method', () => {
    it('distributes 1-cent remainders across first N participants to guarantee exact balance', () => {
      const result = calculateParticipantShares({
        totalAmount: 100,
        participants: [alice, bob, charlie],
        splitMethod: 'EQUAL',
        payerId: 'user-1',
      });

      expect(result.isValid).toBe(true);
      expect(result.shares).toHaveLength(3);
      // 100 / 3 = 33.33 with 1 cent remainder allocated to first participant (33.34, 33.33, 33.33)
      expect(result.shares[0].assignedAmount).toBe(33.34);
      expect(result.shares[1].assignedAmount).toBe(33.33);
      expect(result.shares[2].assignedAmount).toBe(33.33);

      // Alice is payer: paid 100, owes 33.34 -> credited 66.66
      expect(result.shares[0].isPayer).toBe(true);
      expect(result.shares[0].netCredit).toBe(66.66);
      expect(result.shares[1].netCredit).toBe(-33.33);
      expect(result.shares[2].netCredit).toBe(-33.33);

      const totalSum = result.shares.reduce((acc, s) => acc + s.assignedAmount, 0);
      expect(Math.round(totalSum * 100) / 100).toBe(100);
    });
  });

  describe('calculateParticipantShares - PERCENTAGE method', () => {
    it('validates 100% total correctly and allocates shares', () => {
      const result = calculateParticipantShares({
        totalAmount: 200,
        participants: [alice, bob, charlie],
        splitMethod: 'PERCENTAGE',
        customAllocations: {
          'user-1': 50,
          'user-2': 30,
          'user-3': 20,
        },
        payerId: 'user-1',
      });

      expect(result.isValid).toBe(true);
      expect(result.remainingToAllocate).toBe(0);
      expect(result.shares[0].assignedAmount).toBe(100);
      expect(result.shares[1].assignedAmount).toBe(60);
      expect(result.shares[2].assignedAmount).toBe(40);
      expect(result.shares[0].netCredit).toBe(100);
    });

    it('returns error when percentages do not equal 100%', () => {
      const result = calculateParticipantShares({
        totalAmount: 200,
        participants: [alice, bob, charlie],
        splitMethod: 'PERCENTAGE',
        customAllocations: {
          'user-1': 40,
          'user-2': 30,
          'user-3': 20,
        },
      });

      expect(result.isValid).toBe(false);
      expect(result.validationError).toBeDefined();
      expect(result.remainingToAllocate).toBe(10);
    });
  });

  describe('calculateParticipantShares - EXACT method', () => {
    it('validates exact sum matching total amount', () => {
      const result = calculateParticipantShares({
        totalAmount: 150,
        participants: [alice, bob, charlie],
        splitMethod: 'EXACT',
        customAllocations: {
          'user-1': 50,
          'user-2': 50,
          'user-3': 50,
        },
        payerId: 'user-1',
      });

      expect(result.isValid).toBe(true);
      expect(result.shares[0].assignedAmount).toBe(50);
      expect(result.shares[0].netCredit).toBe(100);
    });

    it('reports error when exact allocations do not sum to total', () => {
      const result = calculateParticipantShares({
        totalAmount: 150,
        participants: [alice, bob, charlie],
        splitMethod: 'EXACT',
        customAllocations: {
          'user-1': 40,
          'user-2': 50,
          'user-3': 50,
        },
      });

      expect(result.isValid).toBe(false);
      expect(result.remainingToAllocate).toBe(10);
    });
  });

  describe('calculateParticipantShares - SHARES method', () => {
    it('allocates proportionate amounts based on unit counts', () => {
      const result = calculateParticipantShares({
        totalAmount: 120,
        participants: [alice, bob, charlie],
        splitMethod: 'SHARES',
        customAllocations: {
          'user-1': 2,
          'user-2': 1,
          'user-3': 1,
        },
        payerId: 'user-1',
      });

      expect(result.isValid).toBe(true);
      // 4 total shares -> Alice 60 (50%), Bob 30 (25%), Charlie 30 (25%)
      expect(result.shares[0].assignedAmount).toBe(60);
      expect(result.shares[1].assignedAmount).toBe(30);
      expect(result.shares[2].assignedAmount).toBe(30);
      expect(result.shares[0].netCredit).toBe(60);
    });
  });
});

