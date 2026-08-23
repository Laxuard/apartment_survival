import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { IconHome, IconCheck, IconUserPlus } from '@tabler/icons-react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/stores/useAuthStore';
import { useHouseholdStore } from '@/stores/useHouseholdStore';

export const InviteAcceptPage: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthStore();
  const { addHousehold } = useHouseholdStore();
  const [isAccepting, setIsAccepting] = useState(false);
  const [isAccepted, setIsAccepted] = useState(false);

  // Mock invited household metadata
  const invitedHousehold = {
    id: `invited-${token || '4b'}`,
    name: 'Apartment 4B',
    inviterName: 'Laxuard',
    currency: 'MAD',
    memberCount: 3,
  };

  const handleAccept = () => {
    setIsAccepting(true);

    setTimeout(() => {
      addHousehold({
        id: invitedHousehold.id,
        name: invitedHousehold.name,
        role: 'MEMBER',
        currency: invitedHousehold.currency,
        memberCount: invitedHousehold.memberCount + 1,
      });

      setIsAccepted(true);

      setTimeout(() => {
        navigate('/', { replace: true });
      }, 1000);
    }, 600);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-[var(--canvas)]">
      <div className="w-full max-w-md card-custom shadow-md text-center p-8 space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-[var(--oak-tint)] text-[var(--oak)] flex items-center justify-center mx-auto">
          <IconHome size={32} />
        </div>

        <div className="space-y-2">
          <span className="text-xs uppercase tracking-wider font-semibold text-[var(--muted)]">
            Household Invitation
          </span>
          <h1 className="font-serif text-2xl font-bold text-[var(--text)]">
            Join {invitedHousehold.name}
          </h1>
          <p className="text-xs text-[var(--muted)] max-w-xs mx-auto">
            {invitedHousehold.inviterName} has invited you to share expenses, pantry stock, and roommate ledger.
          </p>
        </div>

        {isAuthenticated ? (
          <div className="space-y-4 pt-2">
            <div className="text-xs text-[var(--muted)] bg-[var(--sage-tint)] p-3 rounded-lg text-[var(--sage)]">
              Signed in as <span className="font-semibold">{user?.name}</span> ({user?.email})
            </div>

            <Button
              onClick={handleAccept}
              disabled={isAccepting || isAccepted}
              className="w-full bg-[var(--oak)] hover:bg-[var(--oak-hover)] text-white font-medium py-5 text-sm"
            >
              {isAccepted ? (
                <span className="flex items-center justify-center gap-1.5">
                  <IconCheck size={18} /> Accepted! Entering flat...
                </span>
              ) : isAccepting ? (
                'Joining flat...'
              ) : (
                <span className="flex items-center justify-center gap-1.5">
                  <IconUserPlus size={18} /> Accept Invitation
                </span>
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-3 pt-2">
            <p className="text-xs text-[var(--muted)]">
              Sign in or create an account to accept this household invite:
            </p>

            <Button
              onClick={() => navigate(`/login?redirect=${encodeURIComponent(`/invite/${token}`)}`)}
              className="w-full bg-[var(--oak)] hover:bg-[var(--oak-hover)] text-white font-medium"
            >
              Sign In to Accept
            </Button>

            <Button
              variant="outline"
              onClick={() => navigate(`/register?redirect=${encodeURIComponent(`/invite/${token}`)}`)}
              className="w-full border-[var(--border-strong)]"
            >
              Create New Account
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
