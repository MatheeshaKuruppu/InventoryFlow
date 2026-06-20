import type { Product } from '@/types';
import { localStorageService, STORAGE_KEYS } from '@/services/localStorageService';

/**
 * Persistence layer for products. Pure data access — no business rules live
 * here; the store owns validation, activity logging and derived state.
 */
export const productStorage = {
  getAll(): Product[] {
    return localStorageService.read<Product[]>(STORAGE_KEYS.products, []);
  },

  /** Replaces the entire collection. Used by the store after mutations. */
  saveAll(products: Product[]): void {
    localStorageService.write(STORAGE_KEYS.products, products);
  },

  /** Appends a single product and returns the updated collection. */
  save(product: Product): Product[] {
    const products = [...productStorage.getAll(), product];
    productStorage.saveAll(products);
    return products;
  },

  update(updated: Product): Product[] {
    const products = productStorage
      .getAll()
      .map((product) => (product.id === updated.id ? updated : product));
    productStorage.saveAll(products);
    return products;
  },

  remove(id: string): Product[] {
    const products = productStorage.getAll().filter((product) => product.id !== id);
    productStorage.saveAll(products);
    return products;
  },
};
