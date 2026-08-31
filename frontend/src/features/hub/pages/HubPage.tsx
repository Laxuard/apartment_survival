import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  useAcceptInviteMutation,
  useCreateHouseholdMutation,
  useHouseholdsQuery,
  useJoinHouseholdMutation,
  usePendingInvitesQuery,
} from '@/features/households';
import { useAuthStore } from '@/stores/useAuthStore';
import { useHouseholdStore } from '@/stores/useHouseholdStore';
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
import { useQueryClient } from '@tanstack/react-query';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export const HubPage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, logout } = useAuthStore();
  const { setActiveHousehold } = useHouseholdStore();

  const { data: households = [], isLoading } = useHouseholdsQuery();
  const { data: pendingInvites = [] } = usePendingInvitesQuery();
  const acceptInviteMutation = useAcceptInviteMutation();
  const joinMutation = useJoinHouseholdMutation();
  const createMutation = useCreateHouseholdMutation();

  const [isJoinOpen, setIsJoinOpen] = useState(false);
  const [joinCode, setJoinCode] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newFlatName, setNewFlatName] = useState('');
  const [newCurrency, setNewCurrency] = useState('MAD');

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

  const handleJoinByCode = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const cleanCode = joinCode.trim().toUpperCase();
    if (!cleanCode) return;
    try {
      const res = await joinMutation.mutateAsync({ code: cleanCode });
      toast.success(`Joined ${res.name}!`);
      setIsJoinOpen(false);
      setJoinCode('');
      setActiveHousehold(res.householdId);
      navigate('/dashboard');
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Invalid invite code';
      toast.error(errorMsg);
    }
  };

  const handleQuickCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!newFlatName.trim()) return;
    try {
      const res = await createMutation.mutateAsync({
        name: newFlatName.trim(),
        currency: newCurrency,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
        maxMembers: 8,
      });
      toast.success(`Created "${res.name}"!`);
      setIsCreateOpen(false);
      setNewFlatName('');
      setActiveHousehold(res.householdId);
      navigate('/dashboard');
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to create household';
      toast.error(errorMsg);
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
          <button
            type="button"
            onClick={() => {
              logout();
              queryClient.clear();
              window.location.href = '/';
            }}
            className="h-8 px-2.5 rounded-xl border border-[var(--negative-text)]/30 bg-[var(--negative-bg)] text-[var(--negative-text)] hover:bg-[var(--negative-text)] hover:text-white transition-colors text-xs font-semibold flex items-center gap-1 cursor-pointer shadow-2xs"
            title="Sign out"
          >
            <IconLogout size={14} />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
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
              className="btn-tactile h-10 px-4 rounded-xl border-[var(--border-strong)] bg-[var(--card)] hover:bg-[var(--canvas)] text-xs font-semibold text-[var(--text)] cursor-pointer flex items-center gap-1.5 shadow-2xs"
            >
              <IconUserPlus size={15} />
              <span>Join with Code</span>
            </Button>

            <Button
              onClick={() => setIsCreateOpen(true)}
              className="btn-tactile h-10 px-4.5 rounded-xl bg-[var(--oak)] hover:bg-[var(--oak-hover)] text-white text-xs font-semibold shadow-sm cursor-pointer flex items-center gap-1.5"
            >
              <IconPlus size={15} />
              <span>Create New Flat</span>
            </Button>
          </div>
        </div>

        {/* Pending Invites Alert Banner */}
        {pendingInvites.length > 0 && (
          <div className="p-4 rounded-2xl bg-[var(--oak-tint)] border border-[var(--oak)]/30 space-y-3 shadow-xs animate-fade-up">
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
                    className="btn-tactile h-8 px-4 rounded-xl bg-[var(--oak)] hover:bg-[var(--oak-hover)] text-white text-xs font-semibold cursor-pointer shrink-0 inline-flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <IconCheck size={13} />
                    <span>{acceptInviteMutation.isPending ? 'Joining...' : 'Accept & Join'}</span>
                  </Button>
                </div>
              ))}
            </div>
          </div>
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
            // 3. Strict Constrained Empty State (max-w-lg, py-16)
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
                  className="btn-tactile w-full sm:w-auto h-11 px-5 rounded-xl bg-[var(--oak)] hover:bg-[var(--oak-hover)] text-white text-xs font-semibold shadow-sm cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <IconPlus size={15} />
                  <span>Create Your First Flat</span>
                </Button>
                <Button
                  onClick={() => setIsJoinOpen(true)}
                  variant="outline"
                  className="w-full sm:w-auto h-11 px-4 rounded-xl border-[var(--border)] bg-[var(--canvas)] hover:bg-[var(--card)] text-xs font-semibold text-[var(--text)] cursor-pointer"
                >
                  <span>Join with Code</span>
                </Button>
              </div>
            </div>
          ) : (
            // Populated Household Cards
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {households.map((h, index) => (
                <div
                  key={h.id}
                  onClick={() => handleSelectHousehold(h.id)}
                  style={{ animationDelay: `${index * 45}ms` }}
                  className="animate-fade-up card-custom p-6 rounded-3xl border border-[var(--border)] hover:border-[var(--oak)] bg-[var(--card)] hover:bg-[var(--oak-tint)]/20 transition-all cursor-pointer group flex flex-col justify-between space-y-5 shadow-sm hover:shadow-md select-none"
                >
                  {/* Top Details */}
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-12 h-12 rounded-2xl bg-[var(--oak-tint)] text-[var(--oak)] group-hover:bg-[var(--oak)] group-hover:text-white transition-all flex items-center justify-center font-bold shrink-0 shadow-2xs">
                          <IconBuildingCommunity size={24} />
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-serif font-bold text-lg text-[var(--text)] group-hover:text-[var(--oak)] transition-colors truncate">
                            {h.name}
                          </h3>
                          <div className="flex items-center gap-2 mt-0.5 text-xs text-[var(--muted)]">
                            <span className="flex items-center gap-1">
                              <IconUsers size={13} /> {h.memberCount || 1} members
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1 font-mono font-semibold">
                              <IconCoins size={13} /> {h.currency || 'MAD'}
                            </span>
                          </div>
                        </div>
                      </div>

                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border shrink-0 ${h.role === 'ADMIN'
                          ? 'bg-[var(--oak-tint)] text-[var(--oak)] border-[var(--oak)]/30'
                          : 'bg-[var(--canvas)] text-[var(--muted)] border-[var(--border)]'
                          }`}
                      >
                        {h.role === 'ADMIN' ? 'Primary Admin' : 'Resident'}
                      </span>
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
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Quick Join Modal */}
      {isJoinOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="card-custom w-full max-w-sm p-6 rounded-3xl bg-[var(--card)] border border-[var(--border-strong)] shadow-2xl space-y-4 animate-fade-up">
            <div className="flex items-center justify-between">
              <h3 className="font-serif font-bold text-base text-[var(--text)]">Join Existing Household</h3>
              <button
                type="button"
                onClick={() => setIsJoinOpen(false)}
                className="text-xs text-[var(--muted)] hover:text-[var(--text)] cursor-pointer p-1"
              >
                ✕
              </button>
            </div>
            <p className="text-xs text-[var(--muted)]">
              Enter the 8-character invite code provided by your flatmate.
            </p>
            <form onSubmit={handleJoinByCode} className="space-y-4">
              <Input
                type="text"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                placeholder="e.g. 4B992XYZ"
                maxLength={16}
                required
                className="h-12 rounded-xl bg-[var(--canvas)] border-[var(--border-strong)] text-center font-mono font-bold tracking-widest text-base text-[var(--text)] uppercase focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--oak)]/50 focus-visible:border-[var(--oak)] transition-all"
              />
              <Button
                type="submit"
                disabled={joinMutation.isPending || !joinCode.trim()}
                className="btn-tactile w-full h-11 rounded-xl bg-[var(--oak)] hover:bg-[var(--oak-hover)] text-white text-xs font-semibold shadow-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[var(--oak)]"
              >
                {joinMutation.isPending ? 'Verifying code...' : 'Join Household'}
              </Button>
            </form>
          </div>
        </div>
      )}

      {/* Quick Create Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="card-custom w-full max-w-md p-6 rounded-3xl bg-[var(--card)] border border-[var(--border-strong)] shadow-2xl space-y-4 animate-fade-up">
            <div className="flex items-center justify-between">
              <h3 className="font-serif font-bold text-base text-[var(--text)]">Create New Household</h3>
              <button
                type="button"
                onClick={() => setIsCreateOpen(false)}
                className="text-xs text-[var(--muted)] hover:text-[var(--text)] cursor-pointer p-1"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleQuickCreate} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[var(--text)] block">Apartment Name</label>
                <Input
                  type="text"
                  value={newFlatName}
                  onChange={(e) => setNewFlatName(e.target.value)}
                  placeholder="e.g., Casa Flat, Marrakech 2026"
                  required
                  className="h-11 rounded-xl bg-[var(--canvas)] border-[var(--border-strong)] text-xs text-[var(--text)] px-3.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--oak)]/50 focus-visible:border-[var(--oak)] transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[var(--text)] block">Primary Currency</label>
                <div className="grid grid-cols-4 gap-2">
                  {['MAD', 'EUR', 'USD', 'GBP'].map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setNewCurrency(c)}
                      className={`h-10 rounded-xl border text-xs font-bold transition-all cursor-pointer ${newCurrency === c
                        ? 'border-[var(--oak)] bg-[var(--oak-tint)] text-[var(--oak)] ring-2 ring-[var(--oak)]/20'
                        : 'border-[var(--border)] bg-[var(--canvas)] text-[var(--text)] hover:border-[var(--border-strong)]'
                        }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              <Button
                type="submit"
                disabled={createMutation.isPending || !newFlatName.trim()}
                className="btn-tactile w-full h-11 rounded-xl bg-[var(--oak)] hover:bg-[var(--oak-hover)] text-white text-xs font-semibold shadow-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[var(--oak)]"
              >
                {createMutation.isPending ? 'Creating space...' : 'Create & Enter Flat'}
              </Button>
            </form>
          </div>
        </div>
      )}

      {/* Footer Info */}
      <footer className="p-6 text-center text-xs text-[var(--muted)] border-t border-[var(--border)]/60">
        Apartment Survival Macro Hub · Switch or create multi-flat shared ledgers
      </footer>
    </div>
  );
};
