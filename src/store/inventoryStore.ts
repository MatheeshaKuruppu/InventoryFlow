// ============================================================================
// inventoryStore.ts - THE HEART OF THE APP
// ----------------------------------------------------------------------------
// This is a Zustand store. Zustand is a tiny state-management library. `create`
// returns a hook (useInventoryStore) that any component can call to read state
// or trigger an "action" (a function that changes state).
//
// This store is the SINGLE SOURCE OF TRUTH. It:
//   1. Holds all app data in memory (products, categories, history, activity).
//   2. Owns all the business rules (e.g. stock can't go negative).
//   3. Writes every change through to localStorage (via the storage layer).
//   4. Records an "activity" entry for each change (the dashboard feed).
//
// Two helpers Zustand gives every action:
//   - set(...)  -> update the store's state (triggers a re-render).
//   - get()     -> read the CURRENT state inside an action.
// ============================================================================
import { create } from 'zustand';
import type { Activity, ActivityType, Category, Product, StockHistory } from '@/types';
import { productStorage } from '@/storage/productStorage';
import { categoryStorage } from '@/storage/categoryStorage';
import { stockStorage } from '@/storage/stockStorage';
import { activityStorage } from '@/storage/activityStorage';
import { localStorageService, STORAGE_KEYS } from '@/services/localStorageService';
import { createId } from '@/utils/id';
import { buildSeedData } from '@/utils/seed';

// The data a component passes in to create/update a product (no timestamps yet).
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

// The full "contract" of the store: the data it holds + every action it exposes.
interface InventoryState {
  // --- state (data) ---
  products: Product[];
  categories: Category[];
  stockHistory: StockHistory[];
  activity: Activity[];
  initialized: boolean; // guards against running initialize() twice

  /** Hydrates from localStorage and seeds demo data on first ever launch. */
  initialize: () => void;

  // --- product actions ---
  addProduct: (input: ProductInput) => Product;
  updateProduct: (id: string, input: ProductInput) => void;
  deleteProduct: (id: string) => void;
  deleteProducts: (ids: string[]) => void; // bulk delete

  // --- stock actions ---
  adjustStock: (productId: string, kind: StockChangeKind, amount: number) => void;
  bulkRestock: (productIds: string[], amount: number) => void;

  // --- category actions ---
  addCategory: (input: CategoryInput) => void;
  updateCategory: (id: string, input: CategoryInput) => void;
  deleteCategory: (id: string) => void;

  // --- data management ---
  clearAllData: () => void;
}

// Small helper: current time as an ISO string, e.g. "2026-07-06T10:30:00.000Z".
function nowIso(): string {
  return new Date().toISOString();
}

// Small helper: build one activity-feed entry.
function makeActivity(type: ActivityType, message: string, detail?: string): Activity {
  return { id: createId('act'), type, message, detail, timestamp: nowIso() };
}

// `create<InventoryState>((set, get) => ({ ...state, ...actions }))`
export const useInventoryStore = create<InventoryState>((set, get) => ({
  // Initial (empty) state before initialize() runs.
  products: [],
  categories: [],
  stockHistory: [],
  activity: [],
  initialized: false,

  // Runs once when the app mounts. Loads saved data, or seeds demo data the
  // very first time so the app isn't empty.
  initialize: () => {
    if (get().initialized) return; // already done -> do nothing

    // Have we seeded demo data before? (a flag saved in localStorage)
    const hasSeeded = localStorageService.read<boolean>(STORAGE_KEYS.seeded, false);

    if (!hasSeeded) {
      // First ever launch: generate and persist a realistic demo dataset.
      const { categories, products } = buildSeedData();
      const activity = [
        makeActivity('PRODUCT_CREATED', 'Imported starter inventory', `${products.length} products`),
      ];
      categoryStorage.saveAll(categories);
      productStorage.saveAll(products);
      activityStorage.saveAll(activity);
      localStorageService.write(STORAGE_KEYS.seeded, true); // don't seed again
      set({ categories, products, activity, stockHistory: [], initialized: true });
      return;
    }

    // Returning user: load whatever is already saved in localStorage.
    set({
      products: productStorage.getAll(),
      categories: categoryStorage.getAll(),
      stockHistory: stockStorage.getAll(),
      activity: activityStorage.getAll(),
      initialized: true,
    });
  },

  // Create a new product.
  addProduct: (input) => {
    // Look up the category so we can store its NAME on the product too
    // (denormalization: lets the table show the name without a lookup).
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

    const products = productStorage.save(product); // persist + get new array
    const activity = activityStorage.save(
      makeActivity('PRODUCT_CREATED', `Added "${product.name}"`, product.id),
    );
    set({ products, activity }); // update state -> re-render
    return product;
  },

  // Edit an existing product.
  updateProduct: (id, input) => {
    const existing = get().products.find((p) => p.id === id);
    if (!existing) return; // nothing to update
    const category = get().categories.find((c) => c.id === input.categoryId);

    // Build the updated record by spreading the old one and overriding fields.
    // (Immutable update: we create a NEW object, we never mutate `existing`.)
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

    // Replace the matching product in the array (again, immutably via map).
    // We save the whole array because the human-facing `id` may have changed.
    let products = get().products.map((p) => (p.id === id ? updated : p));
    productStorage.saveAll(products);
    products = productStorage.getAll();

    const activity = activityStorage.save(
      makeActivity('PRODUCT_UPDATED', `Updated "${updated.name}"`, updated.id),
    );
    set({ products, activity });
  },

  // Delete one product (and its stock history so nothing is orphaned).
  deleteProduct: (id) => {
    const product = get().products.find((p) => p.id === id);
    const products = productStorage.remove(id);
    const stockHistory = stockStorage.removeByProduct(id);
    const activity = activityStorage.save(
      makeActivity('PRODUCT_DELETED', `Deleted "${product?.name ?? 'product'}"`, id),
    );
    set({ products, stockHistory, activity });
  },

  // Bulk delete (used by the checkbox selection + floating action bar).
  deleteProducts: (ids) => {
    // A Set gives fast O(1) "does this id exist?" checks inside the filter.
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

  // Change a single product's stock. THIS is where negative stock is prevented.
  adjustStock: (productId, kind, amount) => {
    const product = get().products.find((p) => p.id === productId);
    if (!product || amount <= 0) return; // nothing to do / invalid amount

    // RESTOCK adds, SALE subtracts.
    const delta = kind === 'RESTOCK' ? amount : -amount;
    // Math.max(0, ...) is the hard guarantee: quantity can never go below zero.
    const newQuantity = Math.max(0, product.quantity + delta);
    if (newQuantity === product.quantity) return; // no actual change

    const updated: Product = { ...product, quantity: newQuantity, updatedAt: nowIso() };
    const products = productStorage.update(updated);

    // Record this movement in the stock history (the audit trail).
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

  // Restock many products at once by the same amount (bulk action).
  bulkRestock: (productIds, amount) => {
    if (amount <= 0 || productIds.length === 0) return;
    const idSet = new Set(productIds);
    const timestamp = nowIso();
    const newEntries: StockHistory[] = [];

    // Walk every product; for selected ones, add `amount` and log a history entry.
    const products = get().products.map((product) => {
      if (!idSet.has(product.id)) return product; // untouched
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
    // Prepend the new history entries so the newest appear first.
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

  // Create a new category.
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

  // Edit a category - and keep the denormalized name on its products in sync.
  updateCategory: (id, input) => {
    const existing = get().categories.find((c) => c.id === id);
    if (!existing) return;
    const updated: Category = {
      ...existing,
      name: input.name.trim(),
      description: input.description.trim(),
    };
    const categories = categoryStorage.update(updated);

    // Because each product stores its categoryName, renaming a category must
    // update every product that belongs to it.
    const products = get().products.map((product) =>
      product.categoryId === id ? { ...product, categoryName: updated.name } : product,
    );
    productStorage.saveAll(products);

    const activity = activityStorage.save(
      makeActivity('CATEGORY_UPDATED', `Updated category "${updated.name}"`),
    );
    set({ categories, products, activity });
  },

  // Delete a category - but ONLY if no product still uses it (data integrity).
  deleteCategory: (id) => {
    const hasProducts = get().products.some((product) => product.categoryId === id);
    if (hasProducts) return; // Guard - the UI also prevents this (defense in depth).
    const category = get().categories.find((c) => c.id === id);
    const categories = categoryStorage.remove(id);
    const activity = activityStorage.save(
      makeActivity('CATEGORY_DELETED', `Deleted category "${category?.name ?? ''}"`),
    );
    set({ categories, activity });
  },

  // Wipe everything (Settings -> Clear all data).
  clearAllData: () => {
    localStorageService.clearAll();
    localStorageService.write(STORAGE_KEYS.seeded, true); // don't re-seed after an intentional clear
    set({ products: [], categories: [], stockHistory: [], activity: [] });
  },
}));
