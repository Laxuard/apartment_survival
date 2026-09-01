import React from 'react';
import { useRoommates } from '../hooks/useRoommates';
import { useUIStore } from '@/stores/useUIStore';
import { DirectSettlementCard } from '../components/DirectSettlementCard';
import { InviteHubCard } from '../components/InviteHubCard';
import { HouseholdMembersRoster } from '../components/HouseholdMembersRoster';
import { KickConfirmationModal } from '../components/KickConfirmationModal';
import { BatchSettlementModal } from '../components/BatchSettlementModal';

export const RoommatesPage: React.FC = () => {
  const { openSettleModal } = useUIStore();
  const {
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
    inviteChannel,
    setInviteChannel,
    copiedInvite,
    copyInviteLink,
    sendWhatsAppInvite,
    triggerWhatsAppNudge,
    kickTargetMember,
    setKickTargetMember,
    promoteMember,
    kickMember,
    isBatchSettleOpen,
    setIsBatchSettleOpen,
    confirmBatchSettle,
  } = useRoommates();

  const handleSettlePath = (debtorName: string) => {
    // Pick the peer matching debtorName
    const target = roommates.find(
      (r) =>
        !r.isCurrentUser &&
        r.name.toLowerCase() === debtorName.toLowerCase()
    );
    if (target) {
      openSettleModal(target);
    } else {
      openSettleModal();
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Top Section: Direct Settle Matrix + Invite Hub */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        <div className="lg:col-span-7">
          <DirectSettlementCard
            settlementPaths={settlementPaths}
            isLoading={isLoadingMatrix}
            currency={currency}
            splitAlgorithm={activeHousehold?.splitAlgorithm}
            totalNetCredit={totalNetPosition}
            onNudge={triggerWhatsAppNudge}
            onSettlePath={handleSettlePath}
            onSettleAll={() => setIsBatchSettleOpen(true)}
          />
        </div>

        <div className="lg:col-span-5">
          <InviteHubCard
            inviteChannel={inviteChannel}
            onChannelChange={setInviteChannel}
            householdName={activeHousehold?.name}
            householdId={activeHousehold?.id}
            openSlots={openSlots}
            copiedInvite={copiedInvite}
            onCopyInvite={copyInviteLink}
            onWhatsAppInvite={sendWhatsAppInvite}
          />
        </div>
      </div>

      {/* Bottom Section: Household Members Roster */}
      <HouseholdMembersRoster
        roommates={roommates}
        isLoading={isLoadingRoommates}
        capacity={capacity}
        memberCount={memberCount}
        openSlots={openSlots}
        onNudge={triggerWhatsAppNudge}
        onSettle={(member) => openSettleModal(member)}
        onPromote={promoteMember}
        onRequestKick={(member) => setKickTargetMember(member)}
      />

      {/* Guarded Kick Confirmation Modal */}
      <KickConfirmationModal
        member={kickTargetMember}
        onClose={() => setKickTargetMember(null)}
        onConfirmKick={kickMember}
      />

      {/* Batch Settle All Modal */}
      <BatchSettlementModal
        isOpen={isBatchSettleOpen}
        onClose={() => setIsBatchSettleOpen(false)}
        settlementPaths={settlementPaths}
        currency={currency}
        onConfirmBatchSettle={confirmBatchSettle}
      />
    </div>
  );
};
