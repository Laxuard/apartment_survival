export type SettingsTab = 'household' | 'profile' | 'appearance' | 'notifications';

export interface CurrencyOption {
  code: string;
  symbol: string;
  label: string;
  country: string;
}

export interface PasswordChangeData {
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
}

