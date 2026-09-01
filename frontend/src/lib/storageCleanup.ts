/**
 * Storage Cleanup Utility
 * Removes legacy mock database artifacts and obsolete store snapshots from localStorage.
 */
export const purgeLegacyStorage = (): void => {
  if (typeof window === 'undefined' || !window.localStorage) return;

  const legacyKeys = [
    'apartment_survival_mock_db_v1',
    'apartment_survival_mock_enabled',
    'apartment-survival-household',
    'apartment-survival-auth',
  ];

  for (const key of legacyKeys) {
    if (localStorage.getItem(key) !== null) {
      localStorage.removeItem(key);
    }
  }
};

