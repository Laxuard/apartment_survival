import { useState, useCallback, useRef, useEffect } from 'react';
import { toast } from 'sonner';
import { useActiveHousehold, useUpdateHouseholdMutation } from '@/features/households';
import { useAuthStore } from '@/stores/useAuthStore';
import { useThemeStore } from '@/stores/useThemeStore';
import { useHouseholdLedger } from '@/features/roommates';
import { useUpdateProfile, useChangePassword } from '@/features/auth/hooks/useAuth';
import { householdsApi } from '@/features/households/api/householdsApi';
import { useQueryClient } from '@tanstack/react-query';
import type { SplitAlgorithm, SplitMethod, HouseholdMembership } from '@/types';
import type { UpdateHouseholdDto } from '@/features/households/types';
import type { PasswordChangeData } from '../types/settings.types';

export const useSettings = () => {
  const queryClient = useQueryClient();
  const { mode, setMode } = useThemeStore();
  const { user } = useAuthStore();
  const { activeHousehold, households, setActiveHousehold } = useActiveHousehold();

  const updateHouseholdMutation = useUpdateHouseholdMutation();
  const updateProfileMutation = useUpdateProfile();
  const changePasswordMutation = useChangePassword();

  const ledger = useHouseholdLedger();
  const userBalance = ledger.userNetBalance;

  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving'>('saved');
  const [copiedInvite, setCopiedInvite] = useState(false);
  const [copiedWifi, setCopiedWifi] = useState(false);
  const [profileFeedback, setProfileFeedback] = useState<string | null>(null);
  const [passwordFeedback, setPasswordFeedback] = useState<{ success?: boolean; message?: string } | null>(null);
  const [localOverrides, setLocalOverrides] = useState<{
    householdId: string | null;
    overrides: Partial<HouseholdMembership>;
  }>({
    householdId: null,
    overrides: {},
  });

  const activeHouseholdId = activeHousehold?.id ?? null;
  const currentOverrides =
    localOverrides.householdId === activeHouseholdId ? localOverrides.overrides : {};

  const currentHousehold = activeHousehold
    ? { ...activeHousehold, ...currentOverrides }
    : null;

  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingUpdatesRef = useRef<UpdateHouseholdDto>({});

  // Flush debounced updates to backend
  const flushHouseholdUpdate = useCallback(
    async (immediateDto?: UpdateHouseholdDto) => {
      if (!activeHousehold?.id) return;
      const payload = { ...pendingUpdatesRef.current, ...(immediateDto || {}) };
      pendingUpdatesRef.current = {};

      if (Object.keys(payload).length === 0) return;

      setSaveStatus('saving');
      try {
        await updateHouseholdMutation.mutateAsync({
          householdId: activeHousehold.id,
          dto: payload,
        });
        setSaveStatus('saved');
      } catch (err: unknown) {
        setSaveStatus('saved');
        const msg = err instanceof Error ? err.message : 'Failed to save household settings';
        toast.error(msg);
      }
    },
    [activeHousehold, updateHouseholdMutation]
  );

  const queueHouseholdUpdate = useCallback(
    (patch: UpdateHouseholdDto, immediate = false) => {
      const membershipPatch: Partial<HouseholdMembership> = { ...patch };
      if (patch.maxMembers !== undefined) {
        membershipPatch.capacity = patch.maxMembers;
      }
      setLocalOverrides((prev) => ({
        householdId: activeHousehold?.id ?? null,
        overrides: {
          ...(prev.householdId === (activeHousehold?.id ?? null) ? prev.overrides : {}),
          ...membershipPatch,
        },
      }));
      pendingUpdatesRef.current = { ...pendingUpdatesRef.current, ...patch };

      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      if (immediate) {
        flushHouseholdUpdate();
      } else {
        setSaveStatus('saving');
        debounceTimerRef.current = setTimeout(() => {
          flushHouseholdUpdate();
        }, 400);
      }
    },
    [flushHouseholdUpdate, activeHousehold?.id]
  );

  // Flush pending debounced updates or clean up timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      if (Object.keys(pendingUpdatesRef.current).length > 0) {
        flushHouseholdUpdate();
      }
    };
  }, [flushHouseholdUpdate]);

  // Update Household Parameters (Instant live sync)
  const updateHouseholdName = useCallback(
    (name: string) => {
      queueHouseholdUpdate({ name: name.trim() || 'Apartment' }, false);
    },
    [queueHouseholdUpdate]
  );

  const updateDescription = useCallback(
    (description: string) => {
      queueHouseholdUpdate({ description }, false);
    },
    [queueHouseholdUpdate]
  );

  const updateMonthlyBudget = useCallback(
    (monthlyBudget: number) => {
      queueHouseholdUpdate({ monthlyBudget: Math.max(0, monthlyBudget) }, false);
    },
    [queueHouseholdUpdate]
  );

  const updateCapacity = useCallback(
    (capacity: number) => {
      queueHouseholdUpdate({ maxMembers: Math.max(1, capacity) }, true);
    },
    [queueHouseholdUpdate]
  );

  const updateWifiSsid = useCallback(
    (wifiSsid: string) => {
      queueHouseholdUpdate({ wifiSsid }, false);
    },
    [queueHouseholdUpdate]
  );

  const updateWifiPassword = useCallback(
    (wifiPassword: string) => {
      queueHouseholdUpdate({ wifiPassword }, false);
    },
    [queueHouseholdUpdate]
  );

  const updateCurrency = useCallback(
    (currency: string) => {
      queueHouseholdUpdate({ currency }, true);
    },
    [queueHouseholdUpdate]
  );

  const updateSplitAlgorithm = useCallback(
    (splitAlgorithm: SplitAlgorithm) => {
      queueHouseholdUpdate({ splitAlgorithm }, true);
    },
    [queueHouseholdUpdate]
  );

  const updateDefaultSplitMethod = useCallback(
    (defaultSplitMethod: SplitMethod) => {
      queueHouseholdUpdate({ defaultSplitMethod }, true);
    },
    [queueHouseholdUpdate]
  );

  const updateDefaultSplitAllocations = useCallback(
    (defaultSplitAllocations: Record<string, number>) => {
      queueHouseholdUpdate({ defaultSplitAllocations }, false);
    },
    [queueHouseholdUpdate]
  );

  const updateAutoRestock = useCallback(
    (autoRestockFromExpenses: boolean) => {
      queueHouseholdUpdate({ autoRestockFromExpenses }, true);
    },
    [queueHouseholdUpdate]
  );

  // Update User Profile (Explicit manual save with backend sync)
  const saveProfile = useCallback(
    async (name: string, email: string) => {
      setSaveStatus('saving');
      try {
        await updateProfileMutation.mutateAsync({
          username: name.trim() || 'User',
          email: email.trim() || 'user@apartment.com',
        });
        setSaveStatus('saved');
        setProfileFeedback('Profile details updated successfully!');
        toast.success('Profile details updated', {
          description: 'Your identity has been saved to the backend.',
        });
        setTimeout(() => setProfileFeedback(null), 3000);
      } catch (err: unknown) {
        setSaveStatus('saved');
        const msg = err instanceof Error ? err.message : 'Failed to update profile';
        toast.error(msg);
      }
    },
    [updateProfileMutation]
  );

  // Handle Explicit Password Change with backend verification
  const changePassword = useCallback(
    async ({ currentPassword, newPassword, confirmPassword }: PasswordChangeData): Promise<boolean> => {
      if (!currentPassword || !newPassword || !confirmPassword) {
        setPasswordFeedback({ success: false, message: 'Please fill in all password fields.' });
        toast.error('Please fill in all password fields.');
        return false;
      }
      if (newPassword.length < 8) {
        setPasswordFeedback({ success: false, message: 'New password must be at least 8 characters long.' });
        toast.error('Password must be at least 8 characters long.');
        return false;
      }
      if (newPassword !== confirmPassword) {
        setPasswordFeedback({ success: false, message: 'New passwords do not match.' });
        toast.error('New passwords do not match.');
        return false;
      }

      setSaveStatus('saving');
      try {
        await changePasswordMutation.mutateAsync({
          currentPassword,
          newPassword,
        });
        setSaveStatus('saved');
        setPasswordFeedback({ success: true, message: 'Password updated successfully!' });
        toast.success('Password updated successfully!');
        setTimeout(() => setPasswordFeedback(null), 3000);
        return true;
      } catch (err: unknown) {
        setSaveStatus('saved');
        const msg = err instanceof Error ? err.message : 'Failed to update password';
        setPasswordFeedback({ success: false, message: msg });
        toast.error(msg);
        return false;
      }
    },
    [changePasswordMutation]
  );

  // Leave Living Space
  const leaveHousehold = useCallback(
    async () => {
      if (!activeHousehold?.id || !user?.id) return;
      try {
        await householdsApi.leaveHousehold(activeHousehold.id, user.id);
        toast.success(`Left ${activeHousehold.name}`);
        const remaining = households.filter((h) => h.id !== activeHousehold.id);
        setActiveHousehold(remaining.length > 0 ? remaining[0].id : null);
        queryClient.invalidateQueries({ queryKey: ['user', 'households'] });
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Failed to leave space';
        toast.error(msg);
      }
    },
    [activeHousehold, user, households, setActiveHousehold, queryClient]
  );

  // Copy Household Invite Link
  const copyInviteLink = useCallback(() => {
    const inviteUrl = `${window.location.origin}/invite/${activeHousehold?.id || ''}`;
    navigator.clipboard.writeText(inviteUrl);
    setCopiedInvite(true);
    setTimeout(() => setCopiedInvite(false), 2000);
  }, [activeHousehold]);

  // Copy WiFi Password
  const copyWifiPassword = useCallback(() => {
    if (activeHousehold?.wifiPassword) {
      navigator.clipboard.writeText(activeHousehold.wifiPassword);
      setCopiedWifi(true);
      setTimeout(() => setCopiedWifi(false), 2000);
    }
  }, [activeHousehold]);

  return {
    // State
    activeHousehold: currentHousehold,
    user,
    userBalance,
    mode,
    saveStatus,
    copiedInvite,
    copiedWifi,
    profileFeedback,
    passwordFeedback,

    // Actions
    setMode,
    updateHouseholdName,
    updateDescription,
    updateMonthlyBudget,
    updateCapacity,
    updateWifiSsid,
    updateWifiPassword,
    updateCurrency,
    updateSplitAlgorithm,
    updateDefaultSplitMethod,
    updateDefaultSplitAllocations,
    updateAutoRestock,
    saveProfile,
    changePassword,
    leaveHousehold,
    copyInviteLink,
    copyWifiPassword,
  };
};
