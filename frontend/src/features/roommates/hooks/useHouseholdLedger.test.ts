import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useHouseholdLedger } from './useHouseholdLedger';
import * as householdsModule from '@/features/households';
import * as roommatesQueriesModule from './useRoommatesQueries';
import { useAuthStore } from '@/stores/useAuthStore';
import type { Roommate } from '../types';

describe('useHouseholdLedger Invariants', () => {
  const mockUser = {
    id: 'user-1',
    name: 'Alice',
    email: 'alice@example.com',
  };

  const sampleMembers: Roommate[] = [
    {
      id: 'user-1',
      name: 'Alice',
      email: 'alice@example.com',
      role: 'ADMIN',
      balance: 150.0,
      currency: 'MAD',
      avatarInitial: 'AL',
      avatarColor: 'oak',
      isCurrentUser: true,
    },
    {
      id: 'user-2',
      name: 'Bob',
      email: 'bob@example.com',
      role: 'MEMBER',
      balance: -100.0,
      currency: 'MAD',
      overdueDays: 3,
      avatarInitial: 'BO',
      avatarColor: 'sage',
      isCurrentUser: false,
    },
    {
      id: 'user-3',
      name: 'Charlie',
      email: 'charlie@example.com',
      role: 'MEMBER',
      balance: -50.0,
      currency: 'MAD',
      overdueDays: 0,
      avatarInitial: 'CH',
      avatarColor: 'oak',
      isCurrentUser: false,
    },
    {
      id: 'user-4',
      name: 'David',
      email: 'david@example.com',
      role: 'MEMBER',
      balance: 0.0,
      currency: 'MAD',
      avatarInitial: 'DA',
      avatarColor: 'sage',
      isCurrentUser: false,
    },
  ];

  beforeEach(() => {
    useAuthStore.setState({ user: mockUser as any, isAuthenticated: true });

    vi.spyOn(householdsModule, 'useActiveHousehold').mockReturnValue({
      activeHousehold: {
        id: 'hh-1',
        name: 'Sunny Villa',
        currency: 'MAD',
        capacity: 6,
        memberCount: 4,
        role: 'ADMIN',
        splitAlgorithm: 'DEBT_SIMPLIFIED',
        defaultSplitMethod: 'EQUAL',
        autoRestockFromExpenses: true,
        archived: false,
        createdAt: '2026-01-01',
      } as any,
      activeHouseholdId: 'hh-1',
      activeCurrency: 'MAD',
      households: [],
      isLoading: false,
      isError: false,
      refetch: vi.fn() as any,
      setActiveHousehold: vi.fn(),
    });
  });

  it('correctly partitions current user and peers without double counting', () => {
    vi.spyOn(roommatesQueriesModule, 'useRoommatesQuery').mockReturnValue({
      data: sampleMembers,
      isLoading: false,
    } as any);

    const { result } = renderHook(() => useHouseholdLedger());

    expect(result.current.currentUser?.id).toBe('user-1');
    expect(result.current.peers).toHaveLength(3);
    expect(result.current.peers.map((p) => p.id)).toEqual(['user-2', 'user-3', 'user-4']);
  });

  it('computes correct net balance, total lent, and total borrowed for creditor user', () => {
    vi.spyOn(roommatesQueriesModule, 'useRoommatesQuery').mockReturnValue({
      data: sampleMembers,
      isLoading: false,
    } as any);

    const { result } = renderHook(() => useHouseholdLedger());

    expect(result.current.userNetBalance).toBe(150.0);
    expect(result.current.isOwedMoney).toBe(true);
    expect(result.current.isOwingMoney).toBe(false);
    expect(result.current.isAllSettled).toBe(false);
    expect(result.current.totalLent).toBe(150.0);
    expect(result.current.totalBorrowed).toBe(0);
    expect(result.current.lentPercentage).toBe(100);
  });

  it('correctly categorizes debtor, creditor, settled, and overdue peers', () => {
    vi.spyOn(roommatesQueriesModule, 'useRoommatesQuery').mockReturnValue({
      data: sampleMembers,
      isLoading: false,
    } as any);

    const { result } = renderHook(() => useHouseholdLedger());

    expect(result.current.debtorPeers).toHaveLength(2); // Bob (-100), Charlie (-50)
    expect(result.current.debtorPeers.map((p) => p.name)).toEqual(['Bob', 'Charlie']);
    expect(result.current.overduePeers).toHaveLength(1); // Bob (3d overdue)
    expect(result.current.overduePeers[0].name).toBe('Bob');
    expect(result.current.settledPeers).toHaveLength(1); // David (0.0)
    expect(result.current.settledPeers[0].name).toBe('David');
  });

  it('computes capacity and open slots correctly', () => {
    vi.spyOn(roommatesQueriesModule, 'useRoommatesQuery').mockReturnValue({
      data: sampleMembers,
      isLoading: false,
    } as any);

    const { result } = renderHook(() => useHouseholdLedger());

    expect(result.current.capacity).toBe(6);
    expect(result.current.memberCount).toBe(4);
    expect(result.current.openSlots).toBe(2);
  });
});

