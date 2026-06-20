import type { Category } from '@/types';
import { localStorageService, STORAGE_KEYS } from '@/services/localStorageService';

export const categoryStorage = {
  getAll(): Category[] {
    return localStorageService.read<Category[]>(STORAGE_KEYS.categories, []);
  },

  saveAll(categories: Category[]): void {
    localStorageService.write(STORAGE_KEYS.categories, categories);
  },

  save(category: Category): Category[] {
    const categories = [...categoryStorage.getAll(), category];
    categoryStorage.saveAll(categories);
    return categories;
  },

  update(updated: Category): Category[] {
    const categories = categoryStorage
      .getAll()
      .map((category) => (category.id === updated.id ? updated : category));
    categoryStorage.saveAll(categories);
    return categories;
  },

  remove(id: string): Category[] {
    const categories = categoryStorage.getAll().filter((category) => category.id !== id);
    categoryStorage.saveAll(categories);
    return categories;
  },
};
