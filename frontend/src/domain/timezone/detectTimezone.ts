import { DEFAULT_TIMEZONE } from './timezones.constants';

/**
 * Safely resolves the user's browser timezone via Intl.DateTimeFormat.
 * Falls back to DEFAULT_TIMEZONE ('Africa/Casablanca') or 'UTC'.
 */
export const getClientTimezone = (): string => {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (tz && typeof tz === 'string' && tz.trim().length > 0) {
      return tz;
    }
  } catch {
    // Ignore runtime errors if Intl is unsupported
  }
  return DEFAULT_TIMEZONE;
};

