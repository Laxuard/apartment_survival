import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { toast } from 'sonner';
import {
  IconCheck,
  IconCopy,
  IconBrandWhatsapp,
  IconQrcode,
  IconLink,
  IconSparkles,
  IconUserPlus,
  IconSend,
} from '@tabler/icons-react';
import type { InviteChannel } from '../types';

interface InviteHubCardProps {
  inviteChannel: InviteChannel;
  onChannelChange: (channel: InviteChannel) => void;
  householdName?: string;
  householdId?: string;
  openSlots: number;
  copiedInvite: boolean;
  onCopyInvite: () => void;
  onWhatsAppInvite: () => void;
}

export const InviteHubCard: React.FC<InviteHubCardProps> = ({
  inviteChannel,
  onChannelChange,
  householdName = 'Apartment 4B',
  householdId,
  openSlots,
  copiedInvite,
  onCopyInvite,
  onWhatsAppInvite,
}) => {
  const inviteUrl = `${window.location.origin}/invite/${householdId || 'apt-4b'}`;
  const [directInput, setDirectInput] = useState('');

  const handleCopy = () => {
    onCopyInvite();
    toast.success('Invite link copied to clipboard', {
      description: `Anyone with this link can join ${householdName}`,
      action: {
        label: 'WhatsApp',
        onClick: onWhatsAppInvite,
      },
    });
  };

  const handleSendDirect = (e: React.FormEvent) => {
    e.preventDefault();
    if (!directInput.trim()) return;
    const target = directInput.trim();
    setDirectInput('');
    toast.success(`Invite sent to ${target}`, {
      description: `They will receive an in-app notification to join ${householdName}.`,
    });
  };

  return (
    <div className="card-custom p-5 sm:p-6 flex flex-col justify-between space-y-4 h-full">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <IconSparkles size={16} className="text-[var(--oak)]" />
            <h2 className="text-sm font-bold text-[var(--text)]">Invite Flatmates</h2>
          </div>
          <span
            className={`px-2 py-0.5 rounded-md text-[10.5px] font-bold ${
              openSlots > 0
                ? 'bg-[var(--positive-bg)] text-[var(--positive-text)]'
                : 'bg-[var(--warn-bg)] text-[var(--warn-text)]'
            }`}
          >
            {openSlots > 0 ? `${openSlots} Slot${openSlots > 1 ? 's' : ''} Open` : 'Space Full'}
          </span>
        </div>
        <p className="text-[11px] text-[var(--muted)] mt-1">Multi-channel invite hub for new roommates</p>
      </div>

      {/* Segmented Channel Switcher */}
      <div className="flex items-center gap-1 p-1 rounded-xl bg-[var(--canvas)] border border-[var(--border)] text-xs font-semibold">
        <button
          type="button"
          onClick={() => onChannelChange('link')}
          className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            inviteChannel === 'link'
              ? 'bg-[var(--card)] text-[var(--oak)] shadow-xs font-bold'
              : 'text-[var(--muted)] hover:text-[var(--text)]'
          }`}
        >
          <IconLink size={13} />
          <span>Link</span>
        </button>

        <button
          type="button"
          onClick={() => onChannelChange('qr')}
          className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            inviteChannel === 'qr'
              ? 'bg-[var(--card)] text-[var(--oak)] shadow-xs font-bold'
              : 'text-[var(--muted)] hover:text-[var(--text)]'
          }`}
        >
          <IconQrcode size={13} />
          <span>QR Code</span>
        </button>

        <button
          type="button"
          onClick={() => onChannelChange('direct')}
          className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            inviteChannel === 'direct'
              ? 'bg-[var(--card)] text-[var(--oak)] shadow-xs font-bold'
              : 'text-[var(--muted)] hover:text-[var(--text)]'
          }`}
        >
          <IconUserPlus size={13} />
          <span>Direct Invite</span>
        </button>
      </div>

      {/* Mode 1: Copy Link + WhatsApp Action */}
      {inviteChannel === 'link' && (
        <div className="space-y-3 animate-fade-in flex-1 flex flex-col justify-center">
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={inviteUrl}
              className="flex-1 px-3 py-2 rounded-xl bg-[var(--canvas)] border border-[var(--border)] text-xs mono text-[var(--muted)] truncate"
            />
            <button
              type="button"
              onClick={handleCopy}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl border text-xs font-semibold cursor-pointer shrink-0 transition-all active:scale-95 shadow-xs ${
                copiedInvite
                  ? 'bg-[var(--positive-bg)] border-[var(--positive-text)] text-[var(--positive-text)] scale-105'
                  : 'bg-[var(--oak)] hover:bg-[var(--oak-hover)] text-white border-transparent'
              }`}
            >
              {copiedInvite ? <IconCheck size={14} className="text-[var(--positive-text)]" /> : <IconCopy size={14} />}
              <span>{copiedInvite ? 'Copied!' : 'Copy'}</span>
            </button>
          </div>

          <button
            type="button"
            onClick={onWhatsAppInvite}
            className="w-full py-1.5 px-3 rounded-xl border border-[var(--border)] hover:border-[#25D366] text-[#25D366] hover:bg-[#25D366]/10 text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-all active:scale-98"
          >
            <IconBrandWhatsapp size={15} />
            <span>Share Link via WhatsApp</span>
          </button>
        </div>
      )}

      {/* Mode 2: Real Scannable SVG QR Code */}
      {inviteChannel === 'qr' && (
        <div className="space-y-2 text-center py-2 animate-fade-in flex-1 flex flex-col items-center justify-center">
          <div className="p-3 bg-white rounded-2xl flex items-center justify-center shadow-md border border-[var(--border)]">
            <QRCodeSVG
              value={inviteUrl}
              size={110}
              level="M"
              bgColor="#ffffff"
              fgColor="#1D1913"
            />
          </div>
          <p className="text-[10.5px] text-[var(--muted)]">Scan with smartphone camera to join immediately.</p>
        </div>
      )}

      {/* Mode 3: Direct Invite via Username / Email */}
      {inviteChannel === 'direct' && (
        <form onSubmit={handleSendDirect} className="space-y-2.5 animate-fade-in flex-1 flex flex-col justify-center">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={directInput}
              onChange={(e) => setDirectInput(e.target.value)}
              placeholder="Username or flatmate email..."
              className="flex-1 px-3 py-2 rounded-xl bg-[var(--canvas)] border border-[var(--border)] text-xs text-[var(--text)] focus:outline-none focus:border-[var(--oak)]"
            />
            <button
              type="submit"
              disabled={!directInput.trim()}
              className="btn-spring px-3.5 py-2 rounded-xl bg-[var(--oak)] hover:bg-[var(--oak-hover)] text-white text-xs font-semibold cursor-pointer shrink-0 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 shadow-xs"
            >
              <IconSend size={13} />
              <span>Invite</span>
            </button>
          </div>
          <div className="text-[10.5px] text-[var(--muted)]">
            Sends an in-app invite notification to their account.
          </div>
        </form>
      )}

      {/* Footer Info */}
      <div className="pt-2 border-t border-[var(--border)] flex items-center justify-between text-[11px] text-[var(--muted)]">
        <span>Invite Code: <strong className="text-[var(--text)] uppercase">{householdId || 'APT-4B'}</strong></span>
        <span className="text-[10px] bg-[var(--canvas)] px-1.5 py-0.5 rounded border border-[var(--border)]">
          7d Expiry
        </span>
      </div>
    </div>
  );
};
