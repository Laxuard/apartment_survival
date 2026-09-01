import type { TimezoneOption } from './types';

export const DEFAULT_TIMEZONE = 'Africa/Casablanca';

export const COMMON_TIMEZONES: TimezoneOption[] = [
  { value: 'Africa/Casablanca', label: 'Casablanca (UTC+1)', region: 'Morocco' },
  { value: 'Europe/Paris', label: 'Paris, Madrid, Berlin (UTC+1/UTC+2)', region: 'Europe' },
  { value: 'Europe/London', label: 'London, Dublin (UTC+0/UTC+1)', region: 'Europe' },
  { value: 'America/New_York', label: 'New York, Eastern Time (UTC-5/UTC-4)', region: 'Americas' },
  { value: 'America/Los_Angeles', label: 'Los Angeles, Pacific Time (UTC-8/UTC-7)', region: 'Americas' },
  { value: 'America/Toronto', label: 'Toronto, Eastern Time (UTC-5/UTC-4)', region: 'Americas' },
  { value: 'Asia/Dubai', label: 'Dubai (UTC+4)', region: 'Middle East' },
  { value: 'UTC', label: 'Coordinated Universal Time (UTC)', region: 'Universal' },
];

