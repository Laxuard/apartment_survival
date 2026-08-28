import {
  IconBuildingCommunity,
  IconUser,
  IconPalette,
  IconBell,
} from '@tabler/icons-react';
import type { CurrencyOption, SettingsTab } from '../types/settings.types';

export const CURRENCIES: CurrencyOption[] = [
  { code: 'MAD', symbol: 'MAD', label: 'Moroccan Dirham', country: 'Morocco' },
  { code: 'USD', symbol: '$', label: 'US Dollar', country: 'United States' },
  { code: 'EUR', symbol: '€', label: 'Euro', country: 'European Union' },
  { code: 'GBP', symbol: '£', label: 'British Pound', country: 'United Kingdom' },
  { code: 'CAD', symbol: 'CA$', label: 'Canadian Dollar', country: 'Canada' },
];

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

