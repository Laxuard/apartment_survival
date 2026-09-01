import { useState, useCallback } from 'react';
import { formatMoney } from '@/domain';
import { useActiveHousehold } from '@/features/households';
import {
  useSettlementMatrixQuery,
  useUpdateMemberRoleMutation,
  useKickMemberMutation,
  useSettleMemberMutation,
  useHouseholdInvitesQuery,
  useCreateLinkInviteMutation,
} from './useRoommatesQueries';

import { useHouseholdLedger } from './useHouseholdLedger';
import type { Roommate, InviteChannel } from '../types';

export const useRoommates = () => {
  const { activeHousehold, activeHouseholdId, activeCurrency: currency } = useActiveHousehold();

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

  const { data: invites = [] } = useHouseholdInvitesQuery(activeHouseholdId);
  const linkInviteMutation = useCreateLinkInviteMutation(activeHouseholdId);

  const activeLink = invites.find(
    (inv) => inv.type === 'LINK' && inv.status === 'PENDING'
  );
  const activeInviteCode = activeLink?.code || '';

  // Copy Invite URL
  const copyInviteLink = useCallback(async () => {
    let codeToUse = activeInviteCode;
    if (!codeToUse && activeHouseholdId) {
      try {
        const created = await linkInviteMutation.mutateAsync({ maxUses: 10, validDays: 7 });
        codeToUse = created.code || '';
      } catch {
        // Fallback
      }
    }
    const inviteUrl = codeToUse
      ? `${window.location.origin}/invite/${codeToUse}`
      : `${window.location.origin}/onboarding/join`;

    navigator.clipboard.writeText(inviteUrl);
    setCopiedInvite(true);
    setTimeout(() => setCopiedInvite(false), 2000);
  }, [activeInviteCode, activeHouseholdId, linkInviteMutation]);

  // Send WhatsApp Invite
  const sendWhatsAppInvite = useCallback(async () => {
    const aptName = activeHousehold?.name || 'our household';
    let codeToUse = activeInviteCode;
    if (!codeToUse && activeHouseholdId) {
      try {
        const created = await linkInviteMutation.mutateAsync({ maxUses: 10, validDays: 7 });
        codeToUse = created.code || '';
      } catch {
        // Fallback
      }
    }
    const inviteUrl = codeToUse
      ? `${window.location.origin}/invite/${codeToUse}`
      : `${window.location.origin}/onboarding/join`;

    const text = `Hey! Join our ${aptName} living space on Apartment Survival to track shared expenses, groceries, and WiFi: ${inviteUrl}`;
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  }, [activeHousehold?.name, activeInviteCode, activeHouseholdId, linkInviteMutation]);


  // WhatsApp Debt Nudge
  const triggerWhatsAppNudge = useCallback(
    (debtorName: string, amount: number) => {
      const aptName = activeHousehold?.name || 'our household';
      const text = `Hey ${debtorName}, just checking in on our ${aptName} tab. You currently have an unsettled balance of ${formatMoney(amount, currency)}. Whenever you get a chance!`;
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
