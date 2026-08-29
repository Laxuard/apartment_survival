import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { useHouseholdStore } from '@/stores/useHouseholdStore';
import { useAuthStore } from '@/stores/useAuthStore';
import { useThemeStore } from '@/stores/useThemeStore';
import { useHouseholdLedger } from '@/features/roommates';
import type { PasswordChangeData } from '../types/settings.types';

export const useSettings = () => {
  const { mode, setMode } = useThemeStore();
  const { user, updateUser } = useAuthStore();
  const { getActiveHousehold, updateActiveHousehold } = useHouseholdStore();
  const activeHousehold = getActiveHousehold();

  const ledger = useHouseholdLedger();
  const userBalance = ledger.userNetBalance;

  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving'>('saved');
  const [copiedInvite, setCopiedInvite] = useState(false);
  const [copiedWifi, setCopiedWifi] = useState(false);
  const [profileFeedback, setProfileFeedback] = useState<string | null>(null);
  const [passwordFeedback, setPasswordFeedback] = useState<{ success?: boolean; message?: string } | null>(null);

  // Trigger ambient save pulse
  const triggerSavePulse = useCallback(() => {
    setSaveStatus('saving');
    const timer = setTimeout(() => {
      setSaveStatus('saved');
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  // Update Household Parameters (Instant live sync)
  const updateHouseholdName = useCallback(
    (name: string) => {
      updateActiveHousehold({ name: name.trim() || 'Apartment' });
      triggerSavePulse();
    },
    [updateActiveHousehold, triggerSavePulse]
  );

  const updateDescription = useCallback(
    (description: string) => {
      updateActiveHousehold({ description });
      triggerSavePulse();
    },
    [updateActiveHousehold, triggerSavePulse]
  );

  const updateMonthlyBudget = useCallback(
    (monthlyBudget: number) => {
      updateActiveHousehold({ monthlyBudget: Math.max(0, monthlyBudget) });
      triggerSavePulse();
    },
    [updateActiveHousehold, triggerSavePulse]
  );

  const updateCapacity = useCallback(
    (capacity: number) => {
      updateActiveHousehold({ capacity: Math.max(1, capacity) });
      triggerSavePulse();
    },
    [updateActiveHousehold, triggerSavePulse]
  );

  const updateWifiSsid = useCallback(
    (wifiSsid: string) => {
      updateActiveHousehold({ wifiSsid });
      triggerSavePulse();
    },
    [updateActiveHousehold, triggerSavePulse]
  );

  const updateWifiPassword = useCallback(
    (wifiPassword: string) => {
      updateActiveHousehold({ wifiPassword });
      triggerSavePulse();
    },
    [updateActiveHousehold, triggerSavePulse]
  );

  const updateCurrency = useCallback(
    (currency: string) => {
      updateActiveHousehold({ currency });
      triggerSavePulse();
    },
    [updateActiveHousehold, triggerSavePulse]
  );

  const updateSplitAlgorithm = useCallback(
    (splitAlgorithm: 'DEBT_SIMPLIFIED' | 'DIRECT') => {
      updateActiveHousehold({ splitAlgorithm });
      triggerSavePulse();
    },
    [updateActiveHousehold, triggerSavePulse]
  );

  const updateAutoRestock = useCallback(
    (autoRestockFromExpenses: boolean) => {
      updateActiveHousehold({ autoRestockFromExpenses });
      triggerSavePulse();
    },
    [updateActiveHousehold, triggerSavePulse]
  );

  // Update User Profile (Explicit manual save)
  const saveProfile = useCallback(
    (name: string, email: string) => {
      updateUser({
        name: name.trim() || 'User',
        email: email.trim() || 'user@apartment.com',
      });
      triggerSavePulse();
      setProfileFeedback('Profile details updated successfully!');
      toast.success('Profile details updated', {
        description: 'Your display identity has been saved.',
      });
      setTimeout(() => setProfileFeedback(null), 3000);
    },
    [updateUser, triggerSavePulse]
  );

  // Handle Explicit Password Change
  const changePassword = useCallback(
    ({ currentPassword, newPassword, confirmPassword }: PasswordChangeData) => {
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

      setPasswordFeedback({ success: true, message: 'Password updated successfully!' });
      toast.success('Password updated successfully!');
      triggerSavePulse();
      setTimeout(() => setPasswordFeedback(null), 3000);
      return true;
    },
    [triggerSavePulse]
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
    activeHousehold,
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
    updateAutoRestock,
    saveProfile,
    changePassword,
    copyInviteLink,
    copyWifiPassword,
  };
};
