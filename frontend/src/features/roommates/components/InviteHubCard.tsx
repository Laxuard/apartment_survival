import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DataCard } from '@/components/ui/DataCard';
import { Skeleton } from '@/components/ui/skeleton';
import {
  IconBrandWhatsapp,
  IconCheck,
  IconCopy,
  IconKey,
  IconLink,
  IconQrcode,
  IconRefresh,
  IconSend,
  IconUserPlus,
} from '@tabler/icons-react';
import { QRCodeSVG } from 'qrcode.react';
import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import type { InviteChannel, HouseholdInviteSummary } from '../types';
import {
  useHouseholdInvitesQuery,
  useCreateLinkInviteMutation,
  useCreateDirectInviteMutation,
} from '../hooks/useRoommatesQueries';

interface InviteHubCardProps {
  inviteChannel: InviteChannel;
  onChannelChange: (channel: InviteChannel) => void;
  householdName?: string;
  householdId?: string;
  openSlots: number;
  copiedInvite: boolean;
  onCopyInvite: () => void;
  onWhatsAppInvite: () => void;
  isLoading?: boolean;
}

export const InviteHubCard: React.FC<InviteHubCardProps> = ({
  inviteChannel,
  onChannelChange,
  householdName = 'our household',
  householdId,
  openSlots,
  copiedInvite,
  onCopyInvite: _onCopyInvite,
  onWhatsAppInvite,

  isLoading = false,
}) => {
  const [directInput, setDirectInput] = useState('');
  const [createdCode, setCreatedCode] = useState<string>('');
  const [copiedCode, setCopiedCode] = useState(false);

  const { data: invites = [] } = useHouseholdInvitesQuery(householdId || null);
  const linkInviteMutation = useCreateLinkInviteMutation(householdId || null);
  const directInviteMutation = useCreateDirectInviteMutation(householdId || null);

  const activeLink = invites.find(
    (inv) => inv.type === 'LINK' && inv.status === 'PENDING'
  );
  const activeCode = createdCode || activeLink?.code || '';

  // Generate a link invite if none exists
  useEffect(() => {
    if (!householdId || activeCode || linkInviteMutation.isPending || linkInviteMutation.isSuccess) return;
    linkInviteMutation.mutate(
      { maxUses: 10, validDays: 7 },
      {
        onSuccess: (data: HouseholdInviteSummary) => {
          if (data?.code) {
            setCreatedCode(data.code);
          }
        },
      }
    );
  }, [householdId, activeCode, linkInviteMutation]);

  const inviteUrl = activeCode
    ? `${window.location.origin}/invite/${activeCode}`
    : `${window.location.origin}/onboarding/join`;

  const handleCopyLink = async () => {
    let urlToCopy = inviteUrl;
    if (!activeCode && householdId) {
      try {
        const created = await linkInviteMutation.mutateAsync({ maxUses: 10, validDays: 7 });
        if (created.code) {
          setCreatedCode(created.code);
          urlToCopy = `${window.location.origin}/invite/${created.code}`;
        }
      } catch {
        // Fallback
      }
    }
    navigator.clipboard.writeText(urlToCopy);
    toast.success('Invite link copied to clipboard', {
      description: `Anyone with this link can join ${householdName}`,
      action: {
        label: 'WhatsApp',
        onClick: onWhatsAppInvite,
      },
    });
  };


  const handleCopyCode = () => {
    if (!activeCode) return;
    navigator.clipboard.writeText(activeCode);
    setCopiedCode(true);
    toast.success('Join code copied', {
      description: `Code ${activeCode} copied to clipboard`,
    });
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleRegenerateCode = () => {
    if (!householdId) return;
    linkInviteMutation.mutate(
      { maxUses: 10, validDays: 7 },
      {
        onSuccess: (data: HouseholdInviteSummary) => {
          if (data?.code) {
            setCreatedCode(data.code);
            toast.success('New join code generated', {
              description: `Code: ${data.code} (Valid for 7 days)`,
            });
          }
        },
        onError: (err: Error) => {
          toast.error(err.message || 'Failed to generate new join code');
        },
      }
    );
  };

  const handleSendDirect = (e: React.FormEvent) => {
    e.preventDefault();
    if (!directInput.trim()) return;
    const target = directInput.trim();

    directInviteMutation.mutate(
      { username: target, validDays: 7 },
      {
        onSuccess: () => {
          setDirectInput('');
          toast.success(`Invite sent to @${target}`, {
            description: `They will receive an in-app notification to join ${householdName}.`,
          });
        },
        onError: (err: Error) => {
          toast.error(err.message || `Failed to send invite to @${target}`);
        },
      }
    );
  };

  const headerAction = (
    <Badge
      variant={openSlots > 0 ? 'positive' : 'warn'}
      className="text-[10.5px]"
    >
      {openSlots > 0 ? `${openSlots} Slot${openSlots > 1 ? 's' : ''} Open` : 'Space Full'}
    </Badge>
  );

  return (
    <DataCard
      title="Invite Flatmates"
      headerAction={headerAction}
      isLoading={isLoading}
      isEmpty={false}
      skeleton={
        <div className="space-y-3 py-2 flex-1 flex flex-col justify-center">
          <Skeleton className="h-9 w-full skeleton-warm rounded-xl" />
          <Skeleton className="h-24 w-full skeleton-warm rounded-xl" />
        </div>
      }
      emptyState={null}
      className="h-full min-h-[360px] flex flex-col shadow-sm"
    >
      <div className="flex-1 flex flex-col justify-between space-y-4">
        {/* Segmented Channel Switcher with Smooth Sliding Indicator */}
        <div className="relative p-1 bg-[var(--canvas)] border border-[var(--border)] rounded-xl flex items-center">
          {/* Sliding Active Pill */}
          <div
            className={`absolute top-1 bottom-1 left-1 w-[calc(33.333%-3px)] bg-[var(--card)] border border-[var(--border)] rounded-lg shadow-xs transition-transform duration-200 ease-out pointer-events-none ${
              inviteChannel === 'link'
                ? 'translate-x-0'
                : inviteChannel === 'qr'
                ? 'translate-x-full'
                : 'translate-x-[200%]'
            }`}
          />

          <button
            type="button"
            onClick={() => onChannelChange('link')}
            className={`relative z-10 flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1.5 text-xs font-semibold cursor-pointer select-none transition-colors duration-150 outline-none focus:outline-none focus-visible:ring-0 ${
              inviteChannel === 'link'
                ? 'text-[var(--oak)] font-bold'
                : 'text-[var(--muted)] hover:text-[var(--text)]'
            }`}
          >
            <IconLink size={13} />
            <span>Link</span>
          </button>

          <button
            type="button"
            onClick={() => onChannelChange('qr')}
            className={`relative z-10 flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1.5 text-xs font-semibold cursor-pointer select-none transition-colors duration-150 outline-none focus:outline-none focus-visible:ring-0 ${
              inviteChannel === 'qr'
                ? 'text-[var(--oak)] font-bold'
                : 'text-[var(--muted)] hover:text-[var(--text)]'
            }`}
          >
            <IconQrcode size={13} />
            <span>QR Code</span>
          </button>

          <button
            type="button"
            onClick={() => onChannelChange('direct')}
            className={`relative z-10 flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1.5 text-xs font-semibold cursor-pointer select-none transition-colors duration-150 outline-none focus:outline-none focus-visible:ring-0 ${
              inviteChannel === 'direct'
                ? 'text-[var(--oak)] font-bold'
                : 'text-[var(--muted)] hover:text-[var(--text)]'
            }`}
          >
            <IconUserPlus size={13} />
            <span>Direct Invite</span>
          </button>
        </div>

        {/* Stabilized Tab Content Area */}
        <div className="flex-1 flex flex-col justify-center min-h-[200px]">
          {/* Mode 1: Join Code + Copy Link + WhatsApp Action */}
          {inviteChannel === 'link' && (
            <div key="channel-link" className="space-y-3 animate-fade-up flex flex-col justify-center">
              {/* 8-Character Join Code Block */}
              <div className="p-3 rounded-xl bg-[var(--canvas)] border border-[var(--border)] space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-[var(--text)]">
                    <IconKey size={14} className="text-[var(--oak)]" />
                    <span>8-Character Code</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleRegenerateCode}
                    disabled={linkInviteMutation.isPending}
                    className="text-[10.5px] text-[var(--muted)] hover:text-[var(--oak)] flex items-center gap-1 cursor-pointer transition-colors"
                    title="Regenerate join code"
                  >
                    <IconRefresh size={12} className={linkInviteMutation.isPending ? 'animate-spin' : ''} />
                    <span>{linkInviteMutation.isPending ? 'Generating...' : 'Regenerate'}</span>
                  </button>
                </div>

                <div className="flex items-center justify-between gap-2 p-2 rounded-lg bg-[var(--card)] border border-[var(--border)]">
                  <span className="mono font-bold text-sm tracking-widest text-[var(--oak)] px-1">
                    {activeCode || 'GENERATING...'}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyCode}
                    className="btn-spring text-xs font-semibold px-2.5 py-1 rounded-md bg-[var(--oak-tint)] hover:bg-[var(--oak)] hover:text-white text-[var(--oak)] flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    {copiedCode ? <IconCheck size={13} className="text-[var(--positive-text)]" /> : <IconCopy size={13} />}
                    <span>{copiedCode ? 'Copied' : 'Copy Code'}</span>
                  </button>
                </div>
              </div>

              {/* Direct Link Input */}
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={inviteUrl}
                  className="flex-1 px-3 py-1.5 rounded-xl bg-[var(--canvas)] border border-[var(--border)] text-xs mono text-[var(--muted)] truncate"
                />
                <Button
                  type="button"
                  size="sm"
                  variant={copiedInvite ? 'secondary' : 'default'}
                  onClick={handleCopyLink}
                  className="shrink-0 cursor-pointer h-8 text-xs"
                >
                  {copiedInvite ? <IconCheck size={14} /> : <IconCopy size={14} />}
                  <span>{copiedInvite ? 'Copied!' : 'Copy Link'}</span>
                </Button>
              </div>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onWhatsAppInvite}
                className="w-full border-[#25D366]/40 text-[#25D366] hover:bg-[#25D366]/10 cursor-pointer h-8 text-xs"
              >
                <IconBrandWhatsapp size={15} />
                <span>Share Link via WhatsApp</span>
              </Button>
            </div>
          )}

          {/* Mode 2: Scannable SVG QR Code */}
          {inviteChannel === 'qr' && (
            <div key="channel-qr" className="space-y-2 text-center py-2 animate-fade-up flex flex-col items-center justify-center">
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

          {/* Mode 3: Direct Invite via Username */}
          {inviteChannel === 'direct' && (
            <form key="channel-direct" onSubmit={handleSendDirect} className="space-y-2.5 animate-fade-up flex flex-col justify-center">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={directInput}
                  onChange={(e) => setDirectInput(e.target.value)}
                  placeholder="Enter registered username..."
                  className="flex-1 px-3 py-2 rounded-xl bg-[var(--canvas)] border border-[var(--border)] text-xs text-[var(--text)] focus:outline-none focus:border-[var(--oak)]"
                />
                <Button
                  type="submit"
                  size="sm"
                  disabled={!directInput.trim() || directInviteMutation.isPending}
                  className="shrink-0 cursor-pointer"
                >
                  <IconSend size={13} />
                  <span>{directInviteMutation.isPending ? 'Sending...' : 'Invite'}</span>
                </Button>
              </div>
              <div className="text-[10.5px] text-[var(--muted)]">
                Sends an in-app invite notification directly to their account inbox.
              </div>
            </form>
          )}
        </div>

        {/* Footer Info */}
        <div className="pt-2 border-t border-[var(--border)]/40 dark:border-white/5 flex items-center justify-between text-[11px] text-[var(--muted)]">
          <div className="flex items-center gap-1.5">
            <span>Invite Code:</span>
            <strong className="mono text-[var(--oak)] font-bold tracking-wider uppercase">
              {activeCode || (householdId ? householdId.substring(0, 8) : 'INVITE')}
            </strong>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleRegenerateCode}
              disabled={linkInviteMutation.isPending}
              className="text-[10px] text-[var(--muted)] hover:text-[var(--oak)] transition-colors flex items-center gap-1 cursor-pointer"
              title="Regenerate code"
            >
              <IconRefresh size={11} className={linkInviteMutation.isPending ? 'animate-spin' : ''} />
              <span>New</span>
            </button>
            <span className="text-[10px] bg-[var(--canvas)] px-1.5 py-0.5 rounded border border-[var(--border)]">
              7d Expiry
            </span>
          </div>
        </div>
      </div>
    </DataCard>
  );
};
