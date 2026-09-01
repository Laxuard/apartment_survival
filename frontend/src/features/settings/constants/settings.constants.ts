import { SUPPORTED_CURRENCIES } from '@/domain';
import {
  IconBuildingCommunity,
  IconUser,
  IconPalette,
  IconBell,
} from '@tabler/icons-react';
import type { SettingsTab } from '../types/settings.types';

export const CURRENCIES = SUPPORTED_CURRENCIES;

export const SETTINGS_TABS: Array<{
  id: SettingsTab;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}> = [
  { id: 'household', label: 'Household Space', icon: IconBuildingCommunity },
  { id: 'profile', label: 'Profile & Security', icon: IconUser },
  { id: 'appearance', label: 'Appearance', icon: IconPalette },
  { id: 'notifications', label: 'Alerts & Nudges', icon: IconBell },
];

