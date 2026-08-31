import React, { useState } from 'react';
import { AppearanceSettingsTab } from '../components/AppearanceSettingsTab';
import { HouseholdSettingsTab } from '../components/HouseholdSettingsTab';
import { NotificationsSettingsTab } from '../components/NotificationsSettingsTab';
import { ProfileSettingsTab } from '../components/ProfileSettingsTab';
import { SettingsTabsNav } from '../components/SettingsTabsNav';
import { useSettings } from '../hooks/useSettings';
import type { SettingsTab } from '../types/settings.types';

export const SettingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<SettingsTab>('household');

  const {
    activeHousehold,
    user,
    userBalance,
    mode,
    saveStatus,
    copiedInvite,
    copiedWifi,
    profileFeedback,
    passwordFeedback,
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
    leaveHousehold,
    copyInviteLink,
    copyWifiPassword,
  } = useSettings();

  // Local notifications toggle state
  const [notifyLowStock, setNotifyLowStock] = useState(true);
  const [notifyOverdue, setNotifyOverdue] = useState(true);
  const [notifyBills, setNotifyBills] = useState(true);

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Top Segmented Navigation & Ambient Save Indicator */}
      <SettingsTabsNav
        activeTab={activeTab}
        onTabChange={setActiveTab}
        householdName={activeHousehold?.name}
        saveStatus={saveStatus}
      />

      {/* Tab 1: Household Space Parameters */}
      {activeTab === 'household' && (
        <HouseholdSettingsTab
          apartmentName={activeHousehold?.name || ''}
          onApartmentNameChange={updateHouseholdName}
          description={activeHousehold?.description || ''}
          onDescriptionChange={updateDescription}
          monthlyBudget={activeHousehold?.monthlyBudget ?? 0}
          onMonthlyBudgetChange={updateMonthlyBudget}
          capacity={activeHousehold?.capacity ?? 4}
          onCapacityChange={updateCapacity}
          memberCount={activeHousehold?.memberCount ?? 1}
          userBalance={userBalance}
          wifiSsid={activeHousehold?.wifiSsid || ''}
          onWifiSsidChange={updateWifiSsid}
          wifiPassword={activeHousehold?.wifiPassword || ''}
          onWifiPasswordChange={updateWifiPassword}
          currency={activeHousehold?.currency || 'MAD'}
          onCurrencyChange={updateCurrency}
          splitAlgorithm={activeHousehold?.splitAlgorithm || 'DEBT_SIMPLIFIED'}
          onSplitAlgorithmChange={updateSplitAlgorithm}
          autoRestockFromExpenses={activeHousehold?.autoRestockFromExpenses ?? true}
          onToggleAutoRestock={updateAutoRestock}
          householdId={activeHousehold?.id}
          copiedInvite={copiedInvite}
          onCopyInvite={copyInviteLink}
          copiedWifi={copiedWifi}
          onCopyWifi={copyWifiPassword}
          onLeaveHousehold={leaveHousehold}
        />
      )}

      {/* Tab 2: Personal Profile & Security */}
      {activeTab === 'profile' && (
        <ProfileSettingsTab
          key={user?.id || user?.email || 'profile'}
          initialName={user?.name || ''}
          initialEmail={user?.email || ''}
          onSaveProfile={saveProfile}
          profileFeedback={profileFeedback}
          onChangePassword={changePassword}
          passwordFeedback={passwordFeedback}
        />
      )}

      {/* Tab 3: Visual Appearance */}
      {activeTab === 'appearance' && (
        <AppearanceSettingsTab
          mode={mode}
          onModeChange={setMode}
        />
      )}

      {/* Tab 4: Alerts & Notifications */}
      {activeTab === 'notifications' && (
        <NotificationsSettingsTab
          notifyLowStock={notifyLowStock}
          onToggleLowStock={() => setNotifyLowStock(!notifyLowStock)}
          notifyOverdue={notifyOverdue}
          onToggleOverdue={() => setNotifyOverdue(!notifyOverdue)}
          notifyBills={notifyBills}
          onToggleBills={() => setNotifyBills(!notifyBills)}
        />
      )}
    </div>
  );
};
