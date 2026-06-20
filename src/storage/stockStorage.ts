import type { StockHistory } from '@/types';
import { localStorageService, STORAGE_KEYS } from '@/services/localStorageService';

/** Maximum number of stock-history entries retained (newest first). */
const MAX_HISTORY = 500;

export const stockStorage = {
  getAll(): StockHistory[] {
    return localStorageService.read<StockHistory[]>(STORAGE_KEYS.stockHistory, []);
  },

  saveAll(history: StockHistory[]): void {
    localStorageService.write(STORAGE_KEYS.stockHistory, history);
  },

  /** Prepends a new log entry so the most recent change is always first. */
  save(entry: StockHistory): StockHistory[] {
    const history = [entry, ...stockStorage.getAll()].slice(0, MAX_HISTORY);
    stockStorage.saveAll(history);
    return history;
  },

  /** Removes every history entry belonging to a deleted product. */
  removeByProduct(productId: string): StockHistory[] {
    const history = stockStorage.getAll().filter((entry) => entry.productId !== productId);
    stockStorage.saveAll(history);
    return history;
  },
};
