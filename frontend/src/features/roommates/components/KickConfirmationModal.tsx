import React from 'react';
import { IconAlertTriangle, IconUserX } from '@tabler/icons-react';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from '@/components/ui/alert-dialog';
import { formatSignedMoney } from '@/domain';
import type { Roommate } from '../types';

interface KickConfirmationModalProps {
  member: Roommate | null;
  onClose: () => void;
  onConfirmKick: (memberId: string) => void;
}

export const KickConfirmationModal: React.FC<KickConfirmationModalProps> = ({
  member,
  onClose,
  onConfirmKick,
}) => {
  if (!member) return null;

  const handleConfirm = () => {
    onConfirmKick(member.id);
  };

  return (
    <AlertDialog open={Boolean(member)} onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl bg-[var(--negative-bg)] text-[var(--negative-text)] flex items-center justify-center shrink-0">
              <IconAlertTriangle size={22} />
            </div>
            <div>
              <AlertDialogTitle>Remove {member.name}?</AlertDialogTitle>
              <p className="text-[11px] text-[var(--muted)]">Permanent apartment departure</p>
            </div>
          </div>
          <AlertDialogDescription>
            Are you sure you want to remove <strong>{member.name}</strong> from this household? They will immediately lose access to shared grocery checklists, settlement tabs, and house notes. Their current balance of <strong>{formatSignedMoney(member.balance, member.currency)}</strong> will be archived.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel onClick={onClose}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleConfirm} className="flex items-center gap-1.5">
            <IconUserX size={15} />
            <span>Yes, Remove Member</span>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
