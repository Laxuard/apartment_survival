import React, { useState } from 'react';
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
  IconShield,
  IconUser,
  IconMail,
  IconSparkles,
} from '@tabler/icons-react';
import { useUIStore } from '@/stores/useUIStore';
import { useHouseholdStore } from '@/stores/useHouseholdStore';
import { useInviteRoommateMutation } from '@/features/roommates/hooks/useRoommatesQueries';

export const InviteModal: React.FC = () => {
  const { activeModal, closeModal } = useUIStore();
  const isOpen = activeModal === 'invite';
  const activeHouseholdId = useHouseholdStore((s) => s.activeHouseholdId);
  const inviteMutation = useInviteRoommateMutation(activeHouseholdId);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'MEMBER' | 'ADMIN'>('MEMBER');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');
  const [isSent, setIsSent] = useState(false);

  const inviteUrl = `${window.location.origin}/invite/${activeHouseholdId || 'apt-invite'}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }
    setError('');

    inviteMutation.mutate(
      {
        name: name.trim() || email.split('@')[0],
        email: email.trim(),
        role,
      },
      {
        onSuccess: () => {
          setIsSent(true);
          setTimeout(() => {
            setIsSent(false);
            closeModal();
            setEmail('');
            setName('');
          }, 1200);
        },
        onError: (err) => {
          setError(err.message || 'Failed to send invite.');
        },
      }
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && closeModal()}>
      <DialogContent className="max-w-[440px] p-6 rounded-2xl bg-[var(--card)] border border-[var(--border)]">
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

        {isSent ? (
          <div className="py-8 text-center space-y-2">
            <div className="w-12 h-12 rounded-full bg-[var(--positive-bg)] text-[var(--positive-text)] flex items-center justify-center mx-auto">
              <IconCheck size={24} />
            </div>
            <div className="font-semibold text-sm text-[var(--text)]">Invitation Dispatched!</div>
            <p className="text-xs text-[var(--muted)]">We sent an invitation email to {email}.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate className="space-y-4 pt-2">
            {error && (
              <div className="text-xs text-[var(--negative-text)] bg-[var(--negative-bg)] border border-[var(--negative-text)]/30 p-2.5 rounded-xl animate-fade-in">
                {error}
              </div>
            )}

            {/* Quick Share Link Pill */}
            <div className="p-3 rounded-xl bg-[var(--canvas)] border border-[var(--border)] flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 text-xs text-[var(--muted)] truncate">
                <IconSparkles size={14} className="text-[var(--oak)] shrink-0" />
                <span className="truncate">Instant Link: {inviteUrl.replace(/^https?:\/\//, '')}</span>
              </div>
              <button
                type="button"
                onClick={handleCopyLink}
                className="btn-spring text-xs font-semibold px-2.5 py-1 rounded-lg bg-[var(--card)] border border-[var(--border-strong)] hover:bg-[var(--sage-tint)] text-[var(--text)] flex items-center gap-1 shrink-0 cursor-pointer shadow-xs"
              >
                {copied ? <IconCheck size={13} className="text-[var(--positive-text)] animate-icon-pop" /> : <IconCopy size={13} />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            {/* Name Input */}
            <div className="space-y-1">
              <label htmlFor="invite-name" className="text-xs font-medium text-[var(--muted)] block">
                Roommate Name (Optional)
              </label>
              <Input
                id="invite-name"
                type="text"
                placeholder="e.g., Sarah Jenkins"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-[var(--canvas)] border-[var(--border)] text-xs h-9 rounded-lg"
              />
            </div>

            {/* Email Input */}
            <div className="space-y-1">
              <label htmlFor="invite-email" className="text-xs font-medium text-[var(--muted)] block">
                Email Address
              </label>
              <div className="relative">
                <IconMail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
                <Input
                  id="invite-email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="pl-9 bg-[var(--canvas)] border-[var(--border)] text-xs h-9 rounded-lg"
                />
              </div>
            </div>

            {/* Role Selection */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[var(--muted)] block">
                Apartment Role & Permissions
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setRole('MEMBER')}
                  className={`p-2.5 rounded-xl border text-left flex items-center gap-2 cursor-pointer transition-all ${
                    role === 'MEMBER'
                      ? 'border-[var(--oak)] bg-[var(--oak-tint)]/40 ring-1 ring-[var(--oak)]'
                      : 'border-[var(--border)] bg-[var(--canvas)] hover:border-[var(--border-strong)]'
                  }`}
                >
                  <IconUser size={16} className={role === 'MEMBER' ? 'text-[var(--oak)]' : 'text-[var(--muted)]'} />
                  <div>
                    <div className="text-xs font-semibold text-[var(--text)]">Member</div>
                    <div className="text-[10px] text-[var(--muted)]">Log & settle expenses</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setRole('ADMIN')}
                  className={`p-2.5 rounded-xl border text-left flex items-center gap-2 cursor-pointer transition-all ${
                    role === 'ADMIN'
                      ? 'border-[var(--oak)] bg-[var(--oak-tint)]/40 ring-1 ring-[var(--oak)]'
                      : 'border-[var(--border)] bg-[var(--canvas)] hover:border-[var(--border-strong)]'
                  }`}
                >
                  <IconShield size={16} className={role === 'ADMIN' ? 'text-[var(--oak)]' : 'text-[var(--muted)]'} />
                  <div>
                    <div className="text-xs font-semibold text-[var(--text)]">Admin</div>
                    <div className="text-[10px] text-[var(--muted)]">Manage apartment settings</div>
                  </div>
                </button>
              </div>
            </div>

            <DialogFooter className="pt-2 gap-2">
              <button
                type="button"
                onClick={closeModal}
                className="btn-secondary h-9 px-4 rounded-xl border border-[var(--border-strong)] bg-[var(--card)] text-[var(--text)] text-xs font-medium hover:bg-[var(--sage-tint)] cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={inviteMutation.isPending}
                className="btn-tactile h-9 px-5 rounded-xl border-none bg-[var(--oak)] text-white text-xs font-semibold hover:bg-[var(--oak-hover)] cursor-pointer transition-colors shadow-sm"
              >
                {inviteMutation.isPending ? 'Sending...' : 'Send Invitation'}
              </button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};
