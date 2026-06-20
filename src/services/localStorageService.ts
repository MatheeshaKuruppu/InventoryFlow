/**
 * Thin, type-safe wrapper around the Web Storage API.
 *
 * Every read is defensive: corrupt or absent values fall back to a provided
 * default instead of throwing, so a single bad key can never brick the app.
 * All keys are namespaced under `inventoryflow.` to avoid collisions.
 */

const NAMESPACE = 'inventoryflow';

export const STORAGE_KEYS = {
  products: `${NAMESPACE}.products`,
  categories: `${NAMESPACE}.categories`,
  stockHistory: `${NAMESPACE}.stockHistory`,
  activity: `${NAMESPACE}.activity`,
  theme: `${NAMESPACE}.theme`,
  seeded: `${NAMESPACE}.seeded`,
} as const;

function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

export const localStorageService = {
  read<T>(key: string, fallback: T): T {
    if (!isBrowser()) return fallback;
    try {
      const raw = window.localStorage.getItem(key);
      if (raw === null) return fallback;
      return JSON.parse(raw) as T;
    } catch (error) {
      console.error(`[InventoryFlow] Failed to read "${key}" from localStorage.`, error);
      return fallback;
    }
  },

  write<T>(key: string, value: T): void {
    if (!isBrowser()) return;
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`[InventoryFlow] Failed to write "${key}" to localStorage.`, error);
    }
  },

  remove(key: string): void {
    if (!isBrowser()) return;
    try {
      window.localStorage.removeItem(key);
    } catch (error) {
      console.error(`[InventoryFlow] Failed to remove "${key}" from localStorage.`, error);
    }
  },

  /** Clears every key owned by InventoryFlow, leaving unrelated keys intact. */
  clearAll(): void {
    if (!isBrowser()) return;
    Object.values(STORAGE_KEYS).forEach((key) => {
      // Preserve the theme so clearing data does not jarringly flip appearance.
      if (key === STORAGE_KEYS.theme) return;
      window.localStorage.removeItem(key);
    });
  },
};
