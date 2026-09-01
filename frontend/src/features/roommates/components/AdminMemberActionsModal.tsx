import React, { useState } from 'react';
import {
  IconCrown,
  IconUserX,
  IconAlertTriangle,
  IconX,
} from '@tabler/icons-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { formatSignedMoney } from '@/domain';
import type { Roommate } from '../types';

interface AdminMemberActionsModalProps {
  member: Roommate | null;
  onClose: () => void;
  onPromote: (memberId: string) => void;
  onKick: (memberId: string) => void;
}

export const AdminMemberActionsModal: React.FC<AdminMemberActionsModalProps> = ({
  member,
  onClose,
  onPromote,
  onKick,
}) => {
  const [showKickConfirm, setShowKickConfirm] = useState(false);

  if (!member) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      {/* 1. Main Action Options Modal */}
      {!showKickConfirm && (
        <Card variant="modal" className="max-w-sm w-full p-6 space-y-4 shadow-2xl animate-fade-in">
          <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
            <div className="flex items-center gap-2.5">
              <span className={`avatar-badge ${member.avatarColor} w-8 h-8 text-xs font-bold`}>
                {member.avatarInitial}
              </span>
              <div>
                <h3 className="font-serif font-bold text-sm text-[var(--text)]">{member.name}</h3>
                <p className="text-[11px] text-[var(--muted)]">{member.role} · Flatmate</p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="w-7 h-7 rounded-lg border border-[var(--border)] hover:bg-[var(--canvas)] flex items-center justify-center text-xs text-[var(--muted)] hover:text-[var(--text)] cursor-pointer"
            >
              <IconX size={15} />
            </button>
          </div>

          <div className="space-y-2">
            {member.role !== 'ADMIN' && (
              <button
                type="button"
                onClick={() => onPromote(member.id)}
                className="w-full p-3 rounded-xl border border-[var(--border)] hover:border-[var(--oak)] hover:bg-[var(--oak-tint)]/20 flex items-center gap-3 text-left transition-colors cursor-pointer group"
              >
                <div className="w-8 h-8 rounded-lg bg-[var(--oak-tint)] text-[var(--oak)] flex items-center justify-center">
                  <IconCrown size={17} />
                </div>
                <div>
                  <div className="text-xs font-bold text-[var(--text)] group-hover:text-[var(--oak)]">
                    Promote to Co-Admin
                  </div>
                  <div className="text-[11px] text-[var(--muted)]">Grant household settings access</div>
                </div>
              </button>
            )}

            <button
              type="button"
              onClick={() => setShowKickConfirm(true)}
              className="w-full p-3 rounded-xl border border-[var(--border)] hover:border-[var(--negative-text)] hover:bg-[var(--negative-bg)] flex items-center gap-3 text-left transition-colors cursor-pointer group"
            >
              <div className="w-8 h-8 rounded-lg bg-[var(--negative-bg)] text-[var(--negative-text)] flex items-center justify-center">
                <IconUserX size={17} />
              </div>
              <div>
                <div className="text-xs font-bold text-[var(--text)] group-hover:text-[var(--negative-text)]">
                  Remove from Apartment
                </div>
                <div className="text-[11px] text-[var(--muted)]">Archive tabs and revoke space access</div>
              </div>
            </button>
          </div>
        </Card>
      )}

      {/* 2. Destructive Kick Confirmation Modal */}
      {showKickConfirm && (
        <Card variant="modal" className="max-w-md w-full p-6 space-y-4 shadow-2xl animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[var(--negative-bg)] text-[var(--negative-text)] flex items-center justify-center shrink-0">
              <IconAlertTriangle size={22} />
            </div>
            <div>
              <h3 className="font-serif font-bold text-sm text-[var(--text)]">
                Remove {member.name}?
              </h3>
              <p className="text-[11px] text-[var(--muted)]">Permanent space removal</p>
            </div>
          </div>

          <p className="text-xs text-[var(--muted)] leading-relaxed">
            Are you sure you want to remove <strong>{member.name}</strong> from this household? They will lose access to shared grocery checklists, settlement tabs, and house notes. Their current balance of <strong>{formatSignedMoney(member.balance, member.currency)}</strong> will be archived.
          </p>

          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-[var(--border)]">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowKickConfirm(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={() => onKick(member.id)}
            >
              Yes, Remove Member
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
};

