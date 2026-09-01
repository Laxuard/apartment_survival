import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
  IconUserPlus,
  IconCopy,
  IconCheck,
  IconUser,
  IconLink,
  IconSparkles,
  IconKey,
  IconClock,
  IconRefresh,
} from '@tabler/icons-react';
import { useUIStore } from '@/stores/useUIStore';
import { useHouseholdStore } from '@/stores/useHouseholdStore';
import {
  useCreateDirectInviteMutation,
  useCreateLinkInviteMutation,
} from '@/features/roommates/hooks/useRoommatesQueries';
import type { HouseholdInviteSummary } from '@/features/roommates/types';

export const InviteModal: React.FC = () => {
  const { activeModal, closeModal } = useUIStore();
  const isOpen = activeModal === 'invite';
  const activeHouseholdId = useHouseholdStore((s) => s.activeHouseholdId);

  const directInviteMutation = useCreateDirectInviteMutation(activeHouseholdId);
  const linkInviteMutation = useCreateLinkInviteMutation(activeHouseholdId);

  const [activeTab, setActiveTab] = useState<'link' | 'username'>('link');
  const [username, setUsername] = useState('');
  const [validDays, setValidDays] = useState(7);
  const [maxUses, setMaxUses] = useState(10);
  const [generatedCode, setGeneratedCode] = useState<string>('');
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [error, setError] = useState('');
  const [isDirectSent, setIsDirectSent] = useState(false);

  const handleClose = () => {
    setActiveTab('link');
    setError('');
    setIsDirectSent(false);
    closeModal();
  };

  // Auto-generate join code when modal opens or household changes
  useEffect(() => {
    if (isOpen && !generatedCode && activeHouseholdId && !linkInviteMutation.isPending) {
      linkInviteMutation.mutate(
        { maxUses, validDays },
        {
          onSuccess: (data: HouseholdInviteSummary) => {
            if (data?.code) {
              setGeneratedCode(data.code);
            }
          },
          onError: (err: Error) => {
            setError(err.message || 'Failed to generate invite link');
          },
        }
      );
    }
  }, [isOpen, activeHouseholdId, generatedCode, linkInviteMutation, maxUses, validDays]);

  const inviteUrl = generatedCode
    ? `${window.location.origin}/invite/${generatedCode}`
    : `${window.location.origin}/onboarding/join`;

  const handleCopyCode = () => {
    if (!generatedCode) return;
    navigator.clipboard.writeText(generatedCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCopyLink = async () => {
    let urlToCopy = inviteUrl;
    if (!generatedCode && activeHouseholdId) {
      try {
        const created = await linkInviteMutation.mutateAsync({ maxUses, validDays });
        if (created?.code) {
          setGeneratedCode(created.code);
          urlToCopy = `${window.location.origin}/invite/${created.code}`;
        }
      } catch {
        // Fallback
      }
    }
    navigator.clipboard.writeText(urlToCopy);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };


  const handleGenerateNewLink = () => {
    setError('');
    linkInviteMutation.mutate(
      { maxUses, validDays },
      {
        onSuccess: (data: HouseholdInviteSummary) => {
          if (data?.code) {
            setGeneratedCode(data.code);
          }
        },
        onError: (err: Error) => {
          setError(err.message || 'Failed to generate invite link');
        },
      }
    );
  };

  const handleDirectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      setError('Please enter a valid username.');
      return;
    }
    setError('');

    directInviteMutation.mutate(
      {
        username: username.trim(),
        validDays,
      },
      {
        onSuccess: () => {
          setIsDirectSent(true);
          setTimeout(() => {
            setIsDirectSent(false);
            closeModal();
            setUsername('');
          }, 1500);
        },
        onError: (err: Error) => {
          setError(err.message || 'Failed to send invite.');
        },
      }
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-w-[460px] p-6 rounded-2xl bg-[var(--card)] border border-[var(--border)] shadow-xl overflow-hidden">
        <DialogHeader className="border-b border-[var(--border)] pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[var(--oak-tint)] text-[var(--oak)] flex items-center justify-center font-bold text-sm">
              <IconUserPlus size={17} />
            </div>
            <div>
              <DialogTitle className="font-serif text-lg font-semibold text-[var(--text)]">
                Invite New Roommate
              </DialogTitle>
              <p className="text-xs text-[var(--muted)]">Add a roommate to your apartment ledger</p>
            </div>
          </div>
        </DialogHeader>

        {/* Segmented Tab Switcher with Smooth Sliding Indicator */}
        <div className="relative p-1 bg-[var(--canvas)] border border-[var(--border)] rounded-xl mt-3 flex items-center">
          {/* Sliding Active Pill */}
          <div
            className={`absolute top-1 bottom-1 left-1 w-[calc(50%-4px)] bg-[var(--card)] border border-[var(--border)] rounded-lg shadow-xs transition-transform duration-200 ease-out pointer-events-none ${
              activeTab === 'username' ? 'translate-x-full' : 'translate-x-0'
            }`}
          />

          <button
            type="button"
            onClick={() => {
              setActiveTab('link');
              setError('');
            }}
            className={`relative z-10 flex-1 py-1.5 text-xs rounded-lg flex items-center justify-center gap-1.5 cursor-pointer select-none transition-colors duration-150 outline-none focus:outline-none focus-visible:ring-0 ${
              activeTab === 'link'
                ? 'text-[var(--oak)] font-bold'
                : 'text-[var(--muted)] hover:text-[var(--text)] font-semibold'
            }`}
          >
            <IconLink size={14} />
            <span>Share Code / Link</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('username');
              setError('');
            }}
            className={`relative z-10 flex-1 py-1.5 text-xs rounded-lg flex items-center justify-center gap-1.5 cursor-pointer select-none transition-colors duration-150 outline-none focus:outline-none focus-visible:ring-0 ${
              activeTab === 'username'
                ? 'text-[var(--oak)] font-bold'
                : 'text-[var(--muted)] hover:text-[var(--text)] font-semibold'
            }`}
          >
            <IconUser size={14} />
            <span>Invite Username</span>
          </button>
        </div>

        {error && (
          <div className="text-xs text-[var(--negative-text)] bg-[var(--negative-bg)] border border-[var(--negative-text)]/30 p-2.5 rounded-xl animate-fade-in mt-2">
            {error}
          </div>
        )}

        {/* Fixed Height Tab Body Container to Eliminate Layout Shifts */}
        <div className="min-h-[295px] flex flex-col justify-between pt-3">
          {activeTab === 'link' ? (
            /* Share Code / Link Tab */
            <div key="tab-link" className="animate-fade-up flex-1 flex flex-col justify-between">
              <div className="space-y-3">
                {/* 8-Char Join Code Box */}
                <div className="p-3.5 rounded-xl bg-[var(--canvas)] border border-[var(--border)] space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-[var(--text)]">
                      <IconKey size={15} className="text-[var(--oak)]" />
                      <span>8-Character Join Code</span>
                    </div>
                    {generatedCode && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--oak-tint)] text-[var(--oak)] font-medium">
                        Valid for {validDays} days
                      </span>
                    )}
                  </div>

                  {generatedCode ? (
                    <div className="flex items-center justify-between gap-2 p-2 rounded-lg bg-[var(--card)] border border-[var(--border)]">
                      <span className="mono font-bold text-base tracking-widest text-[var(--oak)] px-2">
                        {generatedCode}
                      </span>
                      <button
                        type="button"
                        onClick={handleCopyCode}
                        className="btn-spring text-xs font-semibold px-3 py-1.5 rounded-lg bg-[var(--oak-tint)] hover:bg-[var(--oak)] hover:text-white text-[var(--oak)] flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        {copiedCode ? <IconCheck size={14} className="text-[var(--positive-text)]" /> : <IconCopy size={14} />}
                        <span>{copiedCode ? 'Copied' : 'Copy Code'}</span>
                      </button>
                    </div>
                  ) : (
                    <div className="text-center py-2 text-xs text-[var(--muted)]">
                      {linkInviteMutation.isPending ? 'Generating join code...' : 'Generating code...'}
                    </div>
                  )}

                  {/* Direct Link Copy */}
                  <div className="flex items-center justify-between gap-2 pt-2 border-t border-[var(--border)]">
                    <div className="flex items-center gap-1.5 text-xs text-[var(--muted)] truncate">
                      <IconSparkles size={14} className="text-[var(--oak)] shrink-0" />
                      <span className="truncate">Link: {inviteUrl.replace(/^https?:\/\//, '')}</span>
                    </div>
                    <button
                      type="button"
                      onClick={handleCopyLink}
                      className="btn-spring text-xs font-semibold px-2.5 py-1 rounded-lg bg-[var(--card)] border border-[var(--border-strong)] hover:bg-[var(--sage-tint)] text-[var(--text)] flex items-center gap-1 shrink-0 cursor-pointer shadow-xs"
                    >
                      {copiedLink ? <IconCheck size={13} className="text-[var(--positive-text)] animate-icon-pop" /> : <IconCopy size={13} />}
                      <span>{copiedLink ? 'Copied' : 'Copy Link'}</span>
                    </button>
                  </div>
                </div>

                {/* Generator Controls */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <label className="text-[10px] font-medium text-[var(--muted)] block mb-1">Max Uses</label>
                    <Input
                      type="number"
                      min={1}
                      max={50}
                      value={maxUses}
                      onChange={(e) => setMaxUses(parseInt(e.target.value) || 10)}
                      className="bg-[var(--canvas)] border-[var(--border)] text-xs h-8 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-medium text-[var(--muted)] block mb-1">Valid Days</label>
                    <Input
                      type="number"
                      min={1}
                      max={30}
                      value={validDays}
                      onChange={(e) => setValidDays(parseInt(e.target.value) || 7)}
                      className="bg-[var(--canvas)] border-[var(--border)] text-xs h-8 rounded-lg"
                    />
                  </div>
                </div>
              </div>

              <DialogFooter className="pt-3 gap-2 border-t border-[var(--border)]/60">
                <button
                  type="button"
                  onClick={handleGenerateNewLink}
                  disabled={linkInviteMutation.isPending}
                  className="btn-secondary h-9 px-4 rounded-xl border border-[var(--border-strong)] bg-[var(--card)] text-[var(--text)] text-xs font-medium hover:bg-[var(--sage-tint)] cursor-pointer transition-colors inline-flex items-center gap-1.5"
                >
                  <IconRefresh size={13} className={linkInviteMutation.isPending ? 'animate-spin' : ''} />
                  <span>{linkInviteMutation.isPending ? 'Generating...' : 'Regenerate'}</span>
                </button>
                <button
                  type="button"
                  onClick={closeModal}
                  className="btn-tactile h-9 px-5 rounded-xl border-none bg-[var(--oak)] text-white text-xs font-semibold hover:bg-[var(--oak-hover)] cursor-pointer transition-colors shadow-sm"
                >
                  Done
                </button>
              </DialogFooter>
            </div>
          ) : isDirectSent ? (
            /* Direct Invite Sent Feedback */
            <div key="tab-sent" className="animate-fade-up flex-1 flex flex-col items-center justify-center text-center space-y-2 py-8">
              <div className="w-12 h-12 rounded-full bg-[var(--positive-bg)] text-[var(--positive-text)] flex items-center justify-center mx-auto">
                <IconCheck size={24} />
              </div>
              <div className="font-semibold text-sm text-[var(--text)]">Direct Invite Dispatched!</div>
              <p className="text-xs text-[var(--muted)] max-w-xs">
                An invite was sent to @{username}. They can accept it in their invite inbox.
              </p>
            </div>
          ) : (
            /* Invite Username Tab Form */
            <form key="tab-username" onSubmit={handleDirectSubmit} noValidate className="animate-fade-up flex-1 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="space-y-1">
                  <label htmlFor="invite-username" className="text-xs font-medium text-[var(--muted)] block">
                    Registered Username
                  </label>
                  <div className="relative">
                    <IconUser size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
                    <Input
                      id="invite-username"
                      type="text"
                      placeholder="e.g. john_doe"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                      className="pl-9 bg-[var(--canvas)] border-[var(--border)] text-xs h-9 rounded-lg"
                    />
                  </div>
                  <p className="text-[10.5px] text-[var(--muted)]">
                    The recipient will receive an alert in their inbox and can accept with 1 click.
                  </p>
                </div>

                <div className="space-y-1">
                  <label htmlFor="invite-days" className="text-xs font-medium text-[var(--muted)] block">
                    Valid Duration (Days)
                  </label>
                  <div className="relative">
                    <IconClock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
                    <Input
                      id="invite-days"
                      type="number"
                      min={1}
                      max={30}
                      value={validDays}
                      onChange={(e) => setValidDays(parseInt(e.target.value) || 7)}
                      className="pl-9 bg-[var(--canvas)] border-[var(--border)] text-xs h-9 rounded-lg"
                    />
                  </div>
                </div>
              </div>

              <DialogFooter className="pt-3 gap-2 border-t border-[var(--border)]/60">
                <button
                  type="button"
                  onClick={closeModal}
                  className="btn-secondary h-9 px-4 rounded-xl border border-[var(--border-strong)] bg-[var(--card)] text-[var(--text)] text-xs font-medium hover:bg-[var(--sage-tint)] cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={directInviteMutation.isPending}
                  className="btn-tactile h-9 px-5 rounded-xl border-none bg-[var(--oak)] text-white text-xs font-semibold hover:bg-[var(--oak-hover)] cursor-pointer transition-colors shadow-sm"
                >
                  {directInviteMutation.isPending ? 'Sending...' : 'Send Direct Invite'}
                </button>
              </DialogFooter>
            </form>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
