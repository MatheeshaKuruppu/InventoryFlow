// ============================================================================
// localStorageService.ts - the ONLY file that talks to the browser's
// localStorage directly. Everything else goes through this.
// ----------------------------------------------------------------------------
// Why a wrapper? localStorage only stores strings and can throw (e.g. private
// mode, quota full, corrupt JSON). This service:
//   - converts objects <-> JSON automatically,
//   - never throws: on any error it logs and returns a safe fallback,
//   - namespaces all keys under "inventoryflow." so we never clash with other
//     apps on the same domain.
// It's generic (<T>) so callers get back exactly the type they ask for.
// ============================================================================

const NAMESPACE = 'inventoryflow';

// All the keys we use, in one typed object. `as const` makes them read-only.
export const STORAGE_KEYS = {
  products: `${NAMESPACE}.products`,
  categories: `${NAMESPACE}.categories`,
  stockHistory: `${NAMESPACE}.stockHistory`,
  activity: `${NAMESPACE}.activity`,
  theme: `${NAMESPACE}.theme`,
  seeded: `${NAMESPACE}.seeded`, // "have we generated demo data yet?"
} as const;

// Guard for environments without a window (e.g. server-side rendering / tests).
function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

export const localStorageService = {
  // Read a value and parse it from JSON. Returns `fallback` if missing/corrupt.
  read<T>(key: string, fallback: T): T {
    if (!isBrowser()) return fallback;
    try {
      const raw = window.localStorage.getItem(key); // string | null
      if (raw === null) return fallback; // nothing stored yet
      return JSON.parse(raw) as T; // string -> object
    } catch (error) {
      // Corrupt JSON etc. -> log and fall back instead of crashing the app.
      console.error(`[InventoryFlow] Failed to read "${key}" from localStorage.`, error);
      return fallback;
    }
  },

  // Serialize a value to JSON and store it.
  write<T>(key: string, value: T): void {
    if (!isBrowser()) return;
    try {
      window.localStorage.setItem(key, JSON.stringify(value)); // object -> string
    } catch (error) {
      console.error(`[InventoryFlow] Failed to write "${key}" to localStorage.`, error);
    }
  },

  // Remove a single key.
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
      // Keep the theme so clearing data doesn't jarringly flip light/dark.
      if (key === STORAGE_KEYS.theme) return;
      window.localStorage.removeItem(key);
    });
  },
};
