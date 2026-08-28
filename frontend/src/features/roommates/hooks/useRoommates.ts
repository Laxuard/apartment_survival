import { useState, useCallback } from 'react';
import { useHouseholdStore } from '@/stores/useHouseholdStore';
import {
  useSettlementMatrixQuery,
  useUpdateMemberRoleMutation,
  useKickMemberMutation,
  useSettleMemberMutation,
} from './useRoommatesQueries';
import { useHouseholdLedger } from './useHouseholdLedger';
import type { Roommate, InviteChannel } from '../types';

export const useRoommates = () => {
  const activeHouseholdId = useHouseholdStore((s) => s.activeHouseholdId);
  const { getActiveHousehold, getActiveCurrency } = useHouseholdStore();
  const activeHousehold = getActiveHousehold();
  const currency = getActiveCurrency();

  // Centralized Household Ledger
  const ledger = useHouseholdLedger(currency);
  const roommates = ledger.allMembers;
  const isLoadingRoommates = ledger.isLoading;
  const capacity = ledger.capacity;
  const memberCount = ledger.memberCount;
  const openSlots = ledger.openSlots;
  const totalNetPosition = ledger.userNetBalance;

  const { data: settlementPaths = [], isLoading: isLoadingMatrix } = useSettlementMatrixQuery(
    activeHouseholdId,
    currency
  );

  // Mutations
  const updateRoleMutation = useUpdateMemberRoleMutation(activeHouseholdId);
  const kickMutation = useKickMemberMutation(activeHouseholdId);
  const settleMutation = useSettleMemberMutation(activeHouseholdId);

  // Invite Hub State
  const [inviteChannel, setInviteChannel] = useState<InviteChannel>('link');
  const [copiedInvite, setCopiedInvite] = useState(false);

  // Kick Confirmation State
  const [kickTargetMember, setKickTargetMember] = useState<Roommate | null>(null);

  // Individual Settle Modal State
  const [selectedMemberForSettle, setSelectedMemberForSettle] = useState<Roommate | null>(null);

  // Batch Settle Modal State
  const [isBatchSettleOpen, setIsBatchSettleOpen] = useState(false);

  // Copy Invite URL
  const copyInviteLink = useCallback(() => {
    const inviteUrl = `${window.location.origin}/invite/${activeHouseholdId || 'apt-4b'}`;
    navigator.clipboard.writeText(inviteUrl);
    setCopiedInvite(true);
    setTimeout(() => setCopiedInvite(false), 2000);
  }, [activeHouseholdId]);

  // Send WhatsApp Invite
  const sendWhatsAppInvite = useCallback(() => {
    const aptName = activeHousehold?.name || 'Apartment 4B';
    const inviteUrl = `${window.location.origin}/invite/${activeHouseholdId || 'apt-4b'}`;
    const text = `Hey! Join our ${aptName} living space on Apartment Survival to track shared expenses, groceries, and WiFi: ${inviteUrl}`;
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  }, [activeHousehold?.name, activeHouseholdId]);

  // WhatsApp Debt Nudge
  const triggerWhatsAppNudge = useCallback(
    (debtorName: string, amount: number) => {
      const aptName = activeHousehold?.name || 'Apartment 4B';
      const text = `Hey ${debtorName}, just checking in on our ${aptName} tab. You currently have an unsettled balance of ${amount.toFixed(2)} ${currency}. Whenever you get a chance!`;
      const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
      window.open(url, '_blank', 'noopener,noreferrer');
    },
    [activeHousehold?.name, currency]
  );

  // Role Management
  const promoteMember = useCallback(
    async (memberId: string) => {
      await updateRoleMutation.mutateAsync({ memberId, role: 'ADMIN' });
    },
    [updateRoleMutation]
  );

  // Kick / Remove Member
  const kickMember = useCallback(
    async (memberId: string) => {
      await kickMutation.mutateAsync(memberId);
      setKickTargetMember(null);
    },
    [kickMutation]
  );

  // Settle Balance
  const confirmSettle = useCallback(
    async (memberId: string, amount: number, paymentMethod: string) => {
      await settleMutation.mutateAsync({ memberId, amount, paymentMethod });
      setSelectedMemberForSettle(null);
    },
    [settleMutation]
  );

  // Batch Settle All
  const confirmBatchSettle = useCallback(async () => {
    // Settle all active debtor tabs
    for (const path of settlementPaths) {
      const member = roommates.find((r) => r.name === path.debtorName);
      if (member) {
        await settleMutation.mutateAsync({
          memberId: member.id,
          amount: path.amount,
          paymentMethod: 'Batch Reconciliation',
        });
      }
    }
    setIsBatchSettleOpen(false);
  }, [settlementPaths, roommates, settleMutation]);

  return {
    // Data & State
    activeHousehold,
    currency,
    roommates,
    settlementPaths,
    isLoadingRoommates,
    isLoadingMatrix,
    capacity,
    memberCount,
    openSlots,
    totalNetPosition,

    // Invite Hub
    inviteChannel,
    setInviteChannel,
    copiedInvite,
    copyInviteLink,
    sendWhatsAppInvite,

    // Nudge
    triggerWhatsAppNudge,

    // Admin & Kick Actions
    kickTargetMember,
    setKickTargetMember,
    promoteMember,
    kickMember,

    // Individual Settle Modal
    selectedMemberForSettle,
    setSelectedMemberForSettle,
    confirmSettle,

    // Batch Settle Modal
    isBatchSettleOpen,
    setIsBatchSettleOpen,
    confirmBatchSettle,
  };
};
