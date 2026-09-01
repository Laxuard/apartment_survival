import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  useAcceptInviteMutation,
  useHouseholdsQuery,
  usePendingInvitesQuery,
} from '@/features/households';
import { useAuthStore } from '@/stores/useAuthStore';
import { useHouseholdStore } from '@/stores/useHouseholdStore';
import { CreateHouseholdModal } from '../components/CreateHouseholdModal';
import { JoinHouseholdModal } from '../components/JoinHouseholdModal';
import {
  IconArrowRight,
  IconBuildingCommunity,
  IconCheck,
  IconCoins,
  IconLogout,
  IconMail,
  IconPlus,
  IconSparkles,
  IconUserPlus,
  IconUsers,
} from '@tabler/icons-react';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export const HubPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { setActiveHousehold } = useHouseholdStore();

  const { data: households = [], isLoading } = useHouseholdsQuery();
  const { data: pendingInvites = [] } = usePendingInvitesQuery();
  const acceptInviteMutation = useAcceptInviteMutation();

  const [isJoinOpen, setIsJoinOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const userInitial = (user?.name || 'User').charAt(0).toUpperCase();

  const handleSelectHousehold = (householdId: string) => {
    setActiveHousehold(householdId);
    navigate('/dashboard');
  };

  const handleAcceptInvite = async (inviteId: string, householdName: string) => {
    try {
      await acceptInviteMutation.mutateAsync(inviteId);
      toast.success(`Joined ${householdName}!`, {
        description: 'You have entered the shared space.',
      });
    } catch (err) {
      console.error(err);
      toast.error('Failed to accept invite');
    }
  };

  return (
    <div className="min-h-screen bg-[var(--canvas)] flex flex-col justify-between select-none">
      {/* 1. Environmental Anchoring: Top Navigation Bar */}
      <header className="h-14 border-b border-[var(--border)] flex items-center justify-between px-4 sm:px-6 bg-[var(--card)] sticky top-0 z-30 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[var(--oak)] to-[#D07B30] text-white flex items-center justify-center font-bold shadow-xs">
            <IconBuildingCommunity size={17} />
          </div>
          <div className="flex items-center gap-2">
            <span className="font-serif font-bold text-sm sm:text-base text-[var(--text)]">Apartment Survival</span>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[var(--oak-tint)] text-[var(--oak)] border border-[var(--oak)]/30">
              Command Hub
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* User Avatar Circle */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[var(--oak)] text-white font-serif font-bold text-xs flex items-center justify-center shadow-xs">
              {userInitial}
            </div>
            <div className="text-right hidden md:block">
              <div className="text-xs font-semibold text-[var(--text)] leading-tight">{user?.name || 'User'}</div>
              <div className="text-[10.5px] text-[var(--muted)] leading-tight">{user?.email}</div>
            </div>
          </div>

          {/* Sign Out Button */}
          <Button
            variant="destructive"
            size="sm"
            onClick={() => {
              logout();
              navigate('/auth/login');
            }}
            className="flex items-center gap-1.5 cursor-pointer"
          >
            <IconLogout size={14} />
            <span className="hidden sm:inline">Sign Out</span>
          </Button>
        </div>
      </header>

      {/* 2. Constrained Canvas: Main Hub Body */}
      <main className="max-w-4xl mx-auto pt-10 pb-24 px-4 sm:px-6 w-full space-y-8 flex-1">
        {/* Hub Header & Action Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[var(--border)]/60">
          <div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[var(--text)] tracking-tight">
              Your Shared Spaces
            </h1>
            <p className="text-xs sm:text-sm text-[var(--muted)] mt-1">
              Select a household to enter its operating dashboard, or spin up a new ledger.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <Button
              onClick={() => setIsJoinOpen(true)}
              variant="outline"
            >
              <IconUserPlus size={15} />
              <span>Join with Code</span>
            </Button>

            <Button
              onClick={() => setIsCreateOpen(true)}
            >
              <IconPlus size={15} />
              <span>Create New Flat</span>
            </Button>
          </div>
        </div>

        {/* Pending Invites Alert Banner */}
        {pendingInvites.length > 0 && (
          <Card variant="tinted" className="p-4 space-y-3 shadow-xs animate-fade-up">
            <div className="flex items-center gap-2 text-xs font-bold text-[var(--oak-hover)] dark:text-[var(--oak)] uppercase tracking-wider">
              <IconMail size={16} />
              <span>Pending Household Invitations ({pendingInvites.length})</span>
            </div>
            <div className="space-y-2">
              {pendingInvites.map((invite) => (
                <div
                  key={invite.inviteId}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-[var(--card)] border border-[var(--border)] text-xs shadow-2xs"
                >
                  <div className="space-y-0.5">
                    <div className="font-bold text-[var(--text)]">
                      {invite.householdName}
                    </div>
                    <div className="text-[11px] text-[var(--muted)]">
                      Invited by {invite.inviterName} · Open bedroom slot
                    </div>
                  </div>
                  <Button
                    size="sm"
                    disabled={acceptInviteMutation.isPending}
                    onClick={() => handleAcceptInvite(invite.inviteId, invite.householdName)}
                  >
                    <IconCheck size={13} />
                    <span>{acceptInviteMutation.isPending ? 'Joining...' : 'Accept & Join'}</span>
                  </Button>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Households Grid */}
        <div>
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {[1, 2].map((i) => (
                <div
                  key={i}
                  className="h-48 rounded-3xl bg-[var(--card)] border border-[var(--border)] p-6 space-y-4 animate-pulse"
                >
                  <div className="h-6 w-32 bg-[var(--border)] rounded-md" />
                  <div className="h-4 w-48 bg-[var(--border)] rounded-md" />
                </div>
              ))}
            </div>
          ) : households.length === 0 ? (
            <div className="max-w-lg mx-auto w-full py-16 px-6 rounded-3xl bg-[var(--card)] border border-dashed border-[var(--border-strong)] text-center space-y-5 my-6 animate-fade-up">
              <div className="w-14 h-14 rounded-2xl bg-[var(--oak-tint)] text-[var(--oak)] flex items-center justify-center mx-auto shadow-2xs">
                <IconSparkles size={28} />
              </div>
              <div className="space-y-1.5 max-w-sm mx-auto">
                <h3 className="font-serif font-bold text-xl text-[var(--text)]">No Active Households</h3>
                <p className="text-xs text-[var(--muted)] leading-relaxed">
                  You are not currently enrolled in any shared spaces. Create a flat or join an existing ledger using an invite code.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <Button
                  onClick={() => setIsCreateOpen(true)}
                  size="lg"
                  className="w-full sm:w-auto"
                >
                  <IconPlus size={16} />
                  <span>Create Your First Flat</span>
                </Button>
                <Button
                  onClick={() => setIsJoinOpen(true)}
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto"
                >
                  <IconUserPlus size={16} />
                  <span>Join with Invite Code</span>
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {households.map((h) => (
                <Card
                  key={h.id}
                  variant="hoverable"
                  onClick={() => handleSelectHousehold(h.id)}
                  className="p-6 space-y-4 rounded-3xl group cursor-pointer"
                >
                  {/* Top Bar: Icon + Flat Name + Currency */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-[var(--oak-tint)] text-[var(--oak)] flex items-center justify-center font-bold text-lg shadow-2xs group-hover:scale-105 transition-transform">
                        <IconBuildingCommunity size={22} />
                      </div>
                      <div>
                        <h2 className="font-serif font-bold text-lg text-[var(--text)] group-hover:text-[var(--oak)] transition-colors line-clamp-1">
                          {h.name}
                        </h2>
                        <div className="flex items-center gap-2 text-xs text-[var(--muted)] mt-0.5">
                          <span className="flex items-center gap-1 font-medium">
                            <IconUsers size={13} />
                            {h.memberCount} flatmates
                          </span>
                          <span>•</span>
                          <span className="font-semibold text-[var(--oak)]">
                            {h.role === 'ADMIN' ? 'Admin / Host' : 'Member'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <Badge variant="outline" className="font-mono text-xs">
                      {h.currency}
                    </Badge>
                  </div>

                  {/* Body Content / Info */}
                  <div className="space-y-2 pt-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="default">
                        <IconCoins size={12} className="mr-1 inline" />
                        {h.splitAlgorithm === 'DEBT_SIMPLIFIED' ? 'Debt Simplified' : 'Direct Split'}
                      </Badge>
                      <Badge variant="neutral">
                        Active Ledger
                      </Badge>
                    </div>

                    <p className="text-xs text-[var(--muted)] line-clamp-2">
                      Active shared ledger with real-time pantry tracking, recurring bills, and 3-way circular debt simplification.
                    </p>
                  </div>

                  {/* Bottom Action Footer */}
                  <div className="pt-3 border-t border-[var(--border)] flex items-center justify-between text-xs">
                    <span className="text-[11px] text-[var(--muted)] font-medium">
                      ID: #{h.id.slice(0, 8)}
                    </span>
                    <div className="text-xs font-bold text-[var(--oak)] group-hover:translate-x-1 transition-transform flex items-center gap-1">
                      <span>Enter Dashboard</span>
                      <IconArrowRight size={14} />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Join Household Dialog Modal */}
      <JoinHouseholdModal
        open={isJoinOpen}
        onOpenChange={setIsJoinOpen}
      />

      {/* Create Household Dialog Modal */}
      <CreateHouseholdModal
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
      />

      {/* Footer Info */}
      <footer className="p-6 text-center text-xs text-[var(--muted)] border-t border-[var(--border)]/60">
        Apartment Survival Macro Hub · Switch or create multi-flat shared ledgers
      </footer>
    </div>
  );
};
