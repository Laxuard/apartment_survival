import { DataCard } from '@/components/ui/DataCard';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  IconBrandWhatsapp,
  IconCrown,
  IconDots,
  IconReceipt,
  IconUser,
  IconUserPlus,
  IconUserX,
} from '@tabler/icons-react';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import type { Roommate } from '../types';

interface HouseholdMembersRosterProps {
  roommates: Roommate[];
  isLoading: boolean;
  capacity: number;
  memberCount: number;
  openSlots: number;
  onNudge: (name: string, amount: number) => void;
  onSettle: (member: Roommate) => void;
  onPromote: (memberId: string) => void;
  onRequestKick: (member: Roommate) => void;
}

export const HouseholdMembersRoster: React.FC<HouseholdMembersRosterProps> = ({
  roommates,
  isLoading,
  capacity,
  memberCount,
  openSlots,
  onNudge,
  onSettle,
  onPromote,
  onRequestKick,
}) => {
  const navigate = useNavigate();

  const headerAction = (
    <div className="flex items-center gap-3">
      {/* Occupancy Counter Pill with Rich Tooltip Slot Dots */}
      <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--canvas)] border border-[var(--border)]">
        <div className="flex items-center gap-1.5">
          {Array.from({ length: capacity }).map((_, idx) => {
            const isFilled = idx < memberCount;
            const resident = isFilled ? roommates[idx] : null;
            return (
              <Tooltip key={idx}>
                <TooltipTrigger asChild>
                  <span
                    className={`w-2.5 h-2.5 rounded-full transition-all cursor-help ${isFilled ? 'bg-[var(--oak)]' : 'border border-dashed border-[var(--muted)] bg-transparent'
                      }`}
                  />
                </TooltipTrigger>
                <TooltipContent>
                  {isFilled && resident
                    ? `Room ${idx + 1}: ${resident.name} (${resident.role === 'ADMIN' ? 'Admin' : 'Resident'})`
                    : `Room ${idx + 1}: Open bedroom slot available`}
                </TooltipContent>
              </Tooltip>
            );
          })}
        </div>
        <span className="text-xs font-bold text-[var(--text)]">
          {memberCount} / {capacity} Slots
        </span>
      </div>

      <span
        className={`text-xs font-semibold px-2.5 py-1 rounded-lg border hidden sm:inline-flex ${openSlots > 0
            ? 'bg-[var(--positive-bg)] text-[var(--positive-text)] border-[var(--positive-text)]/30'
            : 'bg-[var(--warn-bg)] text-[var(--warn-text)] border-[var(--warn-text)]/30'
          }`}
      >
        {openSlots > 0 ? `${openSlots} Room${openSlots > 1 ? 's' : ''} Open` : 'Full Occupancy'}
      </span>
    </div>
  );

  return (
    <DataCard
      title="Household Members"
      headerAction={headerAction}
      isLoading={isLoading}
      isEmpty={false}
      skeleton={
        <div className="space-y-3 py-2">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-16 w-full skeleton-warm rounded-xl" />
          ))}
        </div>
      }
      emptyState={null}
      className="overflow-visible"
    >
      <div className="space-y-2">
        {/* 1. Populated Members List */}
        <div className="divide-y divide-[var(--border)]">
          {roommates.map((member, index) => (
            <div
              key={member.id}
              style={{ animationDelay: `${index * 45}ms` }}
              className="animate-fade-up p-4 sm:p-5 flex flex-wrap sm:flex-nowrap items-center justify-between gap-4 hover:bg-[var(--sage-tint)]/60 transition-colors relative rounded-xl"
            >
              {/* Avatar & User Details */}
              <div className="flex items-center gap-3.5 min-w-0 flex-1">
                <span
                  className={`w-10 h-10 rounded-2xl font-bold flex items-center justify-center text-sm shadow-xs shrink-0 ${member.avatarColor === 'oak'
                      ? 'bg-[var(--oak)] text-white'
                      : 'bg-[var(--sage-tint)] text-[var(--sage)]'
                    }`}
                  aria-hidden="true"
                >
                  {member.avatarInitial}
                </span>

                <div className="truncate flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs sm:text-sm font-bold text-[var(--text)] truncate">
                      {member.name}
                    </span>

                    {member.role === 'ADMIN' ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.2 rounded-md bg-[var(--oak-tint)] text-[var(--oak)] border border-[var(--oak)]/30">
                        <IconCrown size={10} />
                        {member.isCurrentUser ? 'Primary Admin' : 'Co-Admin'}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.2 rounded-md bg-[var(--canvas)] text-[var(--muted)] border border-[var(--border)]">
                        <IconUser size={10} />
                        Resident
                      </span>
                    )}

                    {member.isCurrentUser && (
                      <span className="text-[10px] text-[var(--muted)] font-medium">(You)</span>
                    )}
                  </div>
                  <div className="text-[11px] text-[var(--muted)] truncate mt-0.5">
                    {member.email} · {member.joinDate || 'Resident'}
                  </div>
                </div>
              </div>

              {/* Balances & Action Controls */}
              <div className="flex items-center gap-3 ml-auto sm:ml-0 shrink-0">
                {/* Net Balance Pill */}
                <div className="text-right pr-1">
                  <span
                    className={`pill-balance ${member.balance > 0 ? 'pos' : member.balance < 0 ? 'neg' : ''
                      } ${member.balance === 0 ? 'bg-[var(--canvas)] text-[var(--muted)] border border-[var(--border)]' : ''}`}
                  >
                    {member.balance > 0 ? '+' : ''}
                    {member.balance.toFixed(2)} {member.currency}
                  </span>
                  <div className="text-[10px] text-[var(--muted)] mt-1">
                    {member.isCurrentUser
                      ? member.balance > 0
                        ? 'Total You Are Owed'
                        : member.balance < 0
                          ? 'Total You Owe'
                          : 'All Settled'
                      : member.pendingDays
                        ? `${member.pendingDays}d pending`
                        : member.balance === 0
                          ? 'Settled up'
                          : 'Open balance'}
                  </div>
                </div>

                {/* WhatsApp Nudge (Only for flatmates who owe) */}
                {!member.isCurrentUser && member.balance > 0 && (
                  <button
                    type="button"
                    onClick={() => onNudge(member.name, member.balance)}
                    title={`Send WhatsApp debt reminder to ${member.name}`}
                    className="btn-spring w-8 h-8 rounded-xl border border-[var(--border)] hover:border-[#25D366] hover:bg-[#25D366]/10 text-[#25D366] flex items-center justify-center cursor-pointer text-xs transition-all shadow-2xs"
                  >
                    <IconBrandWhatsapp size={15} />
                  </button>
                )}

                {/* Settle Action */}
                {!member.isCurrentUser && (
                  <button
                    type="button"
                    onClick={() => onSettle(member)}
                    className="btn-spring px-3 py-1.5 rounded-xl border border-[var(--border-strong)] bg-[var(--card)] hover:bg-[var(--oak)] hover:border-[var(--oak)] hover:text-white text-xs font-semibold text-[var(--text)] cursor-pointer shadow-2xs transition-all"
                    title={
                      member.balance > 0
                        ? `Record payment received from ${member.name}`
                        : `Record payment sent to ${member.name}`
                    }
                  >
                    Settle
                  </button>
                )}

                {/* Admin Actions Dropdown */}
                {!member.isCurrentUser && (
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      aria-label={`Manage ${member.name}`}
                      className="btn-spring w-8 h-8 rounded-xl border border-[var(--border)] hover:bg-[var(--canvas)] data-popup-open:bg-[var(--canvas)] data-popup-open:border-[var(--border-strong)] data-popup-open:text-[var(--text)] flex items-center justify-center cursor-pointer text-xs font-bold text-[var(--muted)] hover:text-[var(--text)] transition-colors shadow-2xs focus:outline-none"
                    >
                      <IconDots size={15} />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      className="w-48 p-1.5 bg-[var(--card)] border border-[var(--border-strong)] shadow-xl rounded-xl"
                    >
                      {member.role !== 'ADMIN' && (
                        <DropdownMenuItem
                          onClick={() => onPromote(member.id)}
                          className="cursor-pointer flex items-center gap-2 px-2.5 py-1.5 text-xs text-[var(--text)] hover:bg-[var(--canvas)] rounded-lg font-medium"
                        >
                          <IconCrown size={14} className="text-[var(--oak)]" />
                          <span>Promote to Admin</span>
                        </DropdownMenuItem>
                      )}

                      <DropdownMenuItem
                        onClick={() => navigate(`/expenses?member=${encodeURIComponent(member.name)}`)}
                        className="cursor-pointer flex items-center gap-2 px-2.5 py-1.5 text-xs text-[var(--text)] hover:bg-[var(--canvas)] rounded-lg font-medium"
                      >
                        <IconReceipt size={14} className="text-[var(--sage)]" />
                        <span>View Expense Tab</span>
                      </DropdownMenuItem>

                      <DropdownMenuSeparator className="bg-[var(--border)] my-1" />

                      <DropdownMenuItem
                        onClick={() => onRequestKick(member)}
                        className="cursor-pointer flex items-center gap-2 px-2.5 py-1.5 text-xs text-[var(--negative-text)] hover:bg-[var(--negative-bg)] rounded-lg font-bold"
                      >
                        <IconUserX size={14} />
                        <span>Remove Member</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* 2. Open Ghost Slots (Fills to total capacity) */}
        {Array.from({ length: Math.max(0, capacity - roommates.length) }).map((_, idx) => (
          <div
            key={`ghost-${idx}`}
            style={{ animationDelay: `${(roommates.length + idx) * 45}ms` }}
            className="animate-fade-up flex items-center gap-3 p-3.5 border border-dashed border-[var(--border)] dark:border-white/10 rounded-xl mb-2 text-[var(--muted)] bg-[var(--canvas)]/50 select-none"
          >
            <div className="w-10 h-10 rounded-full border border-dashed border-[var(--border-strong)] dark:border-white/20 flex items-center justify-center shrink-0">
              <IconUserPlus size={16} className="text-[var(--muted)]" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-medium text-[var(--text)]">Empty Slot</div>
              <div className="text-[11px] text-[var(--muted)]">Waiting for invitee...</div>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded border border-dashed border-[var(--border)] text-[var(--muted)]">
              Open Slot
            </span>
          </div>
        ))}
      </div>
    </DataCard>
  );
};
