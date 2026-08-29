import React, { useState } from 'react';
import {
  IconCrown,
  IconReceipt,
  IconUserX,
  IconAlertTriangle,
  IconX,
} from '@tabler/icons-react';
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
      {!showKickConfirm ? (
        /* Action Selection Menu */
        <div className="card-custom max-w-sm w-full p-5 space-y-4 shadow-2xl border border-[var(--border-strong)] animate-fade-in">
          <div className="flex items-center justify-between pb-2 border-b border-[var(--border)]">
            <div>
              <h4 className="text-sm font-bold text-[var(--text)]">Manage {member.name}</h4>
              <p className="text-[10.5px] text-[var(--muted)]">{member.email}</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="w-6 h-6 rounded-md border border-[var(--border)] hover:bg-[var(--canvas)] flex items-center justify-center text-xs text-[var(--muted)] hover:text-[var(--text)] cursor-pointer"
            >
              <IconX size={14} />
            </button>
          </div>

          <div className="space-y-1.5 text-xs">
            {member.role !== 'ADMIN' && (
              <button
                type="button"
                onClick={() => onPromote(member.id)}
                className="w-full text-left px-3 py-2 rounded-xl hover:bg-[var(--canvas)] flex items-center gap-2.5 cursor-pointer text-[var(--text)] font-semibold transition-colors"
              >
                <IconCrown size={15} className="text-[var(--oak)]" />
                <span>Promote to Co-Admin</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                onClose();
                window.location.href = `/expenses?member=${encodeURIComponent(member.name)}`;
              }}
              className="w-full text-left px-3 py-2 rounded-xl hover:bg-[var(--canvas)] flex items-center gap-2.5 cursor-pointer text-[var(--text)] font-semibold transition-colors"
            >
              <IconReceipt size={15} className="text-[var(--sage)]" />
              <span>View Shared Expense History</span>
            </button>

            <div className="border-t border-[var(--border)] my-1"></div>

            <button
              type="button"
              onClick={() => setShowKickConfirm(true)}
              className="w-full text-left px-3 py-2 rounded-xl hover:bg-[var(--negative-bg)] text-[var(--negative-text)] flex items-center gap-2.5 font-bold cursor-pointer transition-colors"
            >
              <IconUserX size={15} />
              <span>Kick / Remove from Apartment</span>
            </button>
          </div>
        </div>
      ) : (
        /* Kick Confirmation Modal */
        <div className="card-custom max-w-md w-full p-6 space-y-4 shadow-2xl border border-[var(--border-strong)] animate-fade-in">
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
            Are you sure you want to remove <strong>{member.name}</strong> from this household? They will lose access to shared grocery checklists, settlement tabs, and house notes. Their current balance of <strong>{member.balance.toFixed(2)} {member.currency}</strong> will be archived.
          </p>

          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-[var(--border)]">
            <button
              type="button"
              onClick={() => setShowKickConfirm(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-[var(--text)] hover:bg-[var(--canvas)] border border-[var(--border)] transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => onKick(member.id)}
              className="btn-spring px-4 py-2 rounded-xl text-xs font-semibold text-white bg-[var(--negative-text)] hover:opacity-90 transition-all cursor-pointer shadow-xs"
            >
              Yes, Remove Member
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

