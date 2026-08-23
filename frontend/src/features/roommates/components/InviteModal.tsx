import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useUIStore } from '@/stores/useUIStore';

export const InviteModal: React.FC = () => {
  const { activeModal, closeModal } = useUIStore();
  const isOpen = activeModal === 'invite';

  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) {
      setError('Enter a valid email address.');
      return;
    }
    setError('');
    closeModal();
    setEmail('');
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && closeModal()}>
      <DialogContent className="max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Invite roommate</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-3.5 pt-1">
          {error && <div className="text-xs text-[var(--negative-text)]">{error}</div>}

          <div className="space-y-1">
            <label htmlFor="invite-email" className="text-[12.5px] font-medium text-[var(--muted)] block">
              Email address
            </label>
            <Input
              id="invite-email"
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <DialogFooter>
            <button
              type="button"
              onClick={closeModal}
              className="btn-secondary h-10 flex-1 rounded-lg border border-[var(--border-strong)] bg-[var(--card)] text-[var(--text)] text-[13.5px] font-medium hover:bg-[var(--sage-tint)] cursor-pointer transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary h-10 flex-1 rounded-lg border-none bg-[var(--oak)] text-white text-[13.5px] font-semibold hover:bg-[var(--oak-hover)] cursor-pointer transition-colors"
            >
              Send invite
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
