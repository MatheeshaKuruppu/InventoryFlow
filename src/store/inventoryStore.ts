import { create } from 'zustand';
import type { Activity, ActivityType, Category, Product, StockHistory } from '@/types';
import { productStorage } from '@/storage/productStorage';
import { categoryStorage } from '@/storage/categoryStorage';
import { stockStorage } from '@/storage/stockStorage';
import { activityStorage } from '@/storage/activityStorage';
import { localStorageService, STORAGE_KEYS } from '@/services/localStorageService';
import { createId } from '@/utils/id';
import { buildSeedData } from '@/utils/seed';

export interface ProductInput {
  id: string;
  name: string;
  categoryId: string;
  price: number;
  quantity: number;
}

export interface CategoryInput {
  name: string;
  description: string;
}

export type StockChangeKind = 'RESTOCK' | 'SALE';

interface InventoryState {
  products: Product[];
  categories: Category[];
  stockHistory: StockHistory[];
  activity: Activity[];
  initialized: boolean;

  /** Hydrates from localStorage and seeds demo data on first ever launch. */
  initialize: () => void;

  // Product operations
  addProduct: (input: ProductInput) => Product;
  updateProduct: (id: string, input: ProductInput) => void;
  deleteProduct: (id: string) => void;
  deleteProducts: (ids: string[]) => void;

  // Stock operations
  adjustStock: (productId: string, kind: StockChangeKind, amount: number) => void;
  bulkRestock: (productIds: string[], amount: number) => void;

  // Category operations
  addCategory: (input: CategoryInput) => void;
  updateCategory: (id: string, input: CategoryInput) => void;
  deleteCategory: (id: string) => void;

  // Data management
  clearAllData: () => void;
}

function nowIso(): string {
  return new Date().toISOString();
}

function makeActivity(type: ActivityType, message: string, detail?: string): Activity {
  return { id: createId('act'), type, message, detail, timestamp: nowIso() };
}

export const useInventoryStore = create<InventoryState>((set, get) => ({
  products: [],
  categories: [],
  stockHistory: [],
  activity: [],
  initialized: false,

  initialize: () => {
    if (get().initialized) return;

    const hasSeeded = localStorageService.read<boolean>(STORAGE_KEYS.seeded, false);

    if (!hasSeeded) {
      const { categories, products } = buildSeedData();
      const activity = [
        makeActivity('PRODUCT_CREATED', 'Imported starter inventory', `${products.length} products`),
      ];
      categoryStorage.saveAll(categories);
      productStorage.saveAll(products);
      activityStorage.saveAll(activity);
      localStorageService.write(STORAGE_KEYS.seeded, true);
      set({ categories, products, activity, stockHistory: [], initialized: true });
      return;
    }

    set({
      products: productStorage.getAll(),
      categories: categoryStorage.getAll(),
      stockHistory: stockStorage.getAll(),
      activity: activityStorage.getAll(),
      initialized: true,
    });
  },

  addProduct: (input) => {
    const category = get().categories.find((c) => c.id === input.categoryId);
    const timestamp = nowIso();
    const product: Product = {
      id: input.id,
      name: input.name.trim(),
      categoryId: input.categoryId,
      categoryName: category?.name ?? 'Uncategorized',
      price: input.price,
      quantity: input.quantity,
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    const products = productStorage.save(product);
    const activity = activityStorage.save(
      makeActivity('PRODUCT_CREATED', `Added "${product.name}"`, product.id),
    );
    set({ products, activity });
    return product;
  },

  updateProduct: (id, input) => {
    const existing = get().products.find((p) => p.id === id);
    if (!existing) return;
    const category = get().categories.find((c) => c.id === input.categoryId);

    const updated: Product = {
      ...existing,
      id: input.id,
      name: input.name.trim(),
      categoryId: input.categoryId,
      categoryName: category?.name ?? existing.categoryName,
      price: input.price,
      quantity: input.quantity,
      updatedAt: nowIso(),
    };

    // Support changing the human-facing id while preserving record identity.
    let products = get().products.map((p) => (p.id === id ? updated : p));
    productStorage.saveAll(products);
    products = productStorage.getAll();

    const activity = activityStorage.save(
      makeActivity('PRODUCT_UPDATED', `Updated "${updated.name}"`, updated.id),
    );
    set({ products, activity });
  },

  deleteProduct: (id) => {
    const product = get().products.find((p) => p.id === id);
    const products = productStorage.remove(id);
    const stockHistory = stockStorage.removeByProduct(id);
    const activity = activityStorage.save(
      makeActivity('PRODUCT_DELETED', `Deleted "${product?.name ?? 'product'}"`, id),
    );
    set({ products, stockHistory, activity });
  },

  deleteProducts: (ids) => {
    const idSet = new Set(ids);
    const products = get().products.filter((p) => !idSet.has(p.id));
    productStorage.saveAll(products);
    const stockHistory = get().stockHistory.filter((h) => !idSet.has(h.productId));
    stockStorage.saveAll(stockHistory);
    const activity = activityStorage.save(
      makeActivity('PRODUCT_DELETED', `Deleted ${ids.length} products`, `${ids.length} removed`),
    );
    set({ products, stockHistory, activity });
  },

  adjustStock: (productId, kind, amount) => {
    const product = get().products.find((p) => p.id === productId);
    if (!product || amount <= 0) return;

    const delta = kind === 'RESTOCK' ? amount : -amount;
    const newQuantity = Math.max(0, product.quantity + delta);
    if (newQuantity === product.quantity) return;

    const updated: Product = { ...product, quantity: newQuantity, updatedAt: nowIso() };
    const products = productStorage.update(updated);

    const entry: StockHistory = {
      id: createId('stk'),
      productId: product.id,
      productName: product.name,
      previousQuantity: product.quantity,
      newQuantity,
      changeAmount: newQuantity - product.quantity,
      action: kind,
      timestamp: nowIso(),
    };
    const stockHistory = stockStorage.save(entry);

    const sign = entry.changeAmount > 0 ? '+' : '';
    const activity = activityStorage.save(
      makeActivity('STOCK_UPDATED', `${kind === 'RESTOCK' ? 'Restocked' : 'Reduced'} "${product.name}"`, `${sign}${entry.changeAmount} units`),
    );
    set({ products, stockHistory, activity });
  },

  bulkRestock: (productIds, amount) => {
    if (amount <= 0 || productIds.length === 0) return;
    const idSet = new Set(productIds);
    const timestamp = nowIso();
    const newEntries: StockHistory[] = [];

    const products = get().products.map((product) => {
      if (!idSet.has(product.id)) return product;
      const newQuantity = product.quantity + amount;
      newEntries.push({
        id: createId('stk'),
        productId: product.id,
        productName: product.name,
        previousQuantity: product.quantity,
        newQuantity,
        changeAmount: amount,
        action: 'RESTOCK',
        timestamp,
      });
      return { ...product, quantity: newQuantity, updatedAt: timestamp };
    });

    productStorage.saveAll(products);
    let stockHistory = get().stockHistory;
    newEntries.forEach((entry) => {
      stockHistory = [entry, ...stockHistory];
    });
    stockStorage.saveAll(stockHistory);

    const activity = activityStorage.save(
      makeActivity('STOCK_UPDATED', `Restocked ${productIds.length} products`, `+${amount} units each`),
    );
    set({ products, stockHistory, activity });
  },

  addCategory: (input) => {
    const category: Category = {
      id: createId('cat'),
      name: input.name.trim(),
      description: input.description.trim(),
      createdAt: nowIso(),
    };
    const categories = categoryStorage.save(category);
    const activity = activityStorage.save(
      makeActivity('CATEGORY_CREATED', `Created category "${category.name}"`),
    );
    set({ categories, activity });
  },

  updateCategory: (id, input) => {
    const existing = get().categories.find((c) => c.id === id);
    if (!existing) return;
    const updated: Category = {
      ...existing,
      name: input.name.trim(),
      description: input.description.trim(),
    };
    const categories = categoryStorage.update(updated);

    // Keep denormalized category names on products in sync.
    const products = get().products.map((product) =>
      product.categoryId === id ? { ...product, categoryName: updated.name } : product,
    );
    productStorage.saveAll(products);

    const activity = activityStorage.save(
      makeActivity('CATEGORY_UPDATED', `Updated category "${updated.name}"`),
    );
    set({ categories, products, activity });
  },

  deleteCategory: (id) => {
    const hasProducts = get().products.some((product) => product.categoryId === id);
    if (hasProducts) return; // Guard — UI also prevents this, defense in depth.
    const category = get().categories.find((c) => c.id === id);
    const categories = categoryStorage.remove(id);
    const activity = activityStorage.save(
      makeActivity('CATEGORY_DELETED', `Deleted category "${category?.name ?? ''}"`),
    );
    set({ categories, activity });
  },

  clearAllData: () => {
    localStorageService.clearAll();
    localStorageService.write(STORAGE_KEYS.seeded, true); // Don't re-seed after an intentional clear.
    set({ products: [], categories: [], stockHistory: [], activity: [] });
  },
}));
