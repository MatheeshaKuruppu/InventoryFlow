import type { Category, CategoryWithStats, Product } from '@/types';
import { getStockStatus, LOW_STOCK_THRESHOLD } from '@/types';

export interface InventoryMetrics {
  totalProducts: number;
  totalCategories: number;
  totalUnits: number;
  totalValue: number;
  lowStockCount: number;
  outOfStockCount: number;
  inStockCount: number;
}

export interface NamedValue {
  name: string;
  value: number;
}

export interface StockStatusBucket {
  name: string;
  value: number;
  key: 'in-stock' | 'low-stock' | 'out-of-stock';
}

export function inventoryValue(product: Product): number {
  return product.price * product.quantity;
}

export function computeMetrics(products: Product[], categories: Category[]): InventoryMetrics {
  return products.reduce<InventoryMetrics>(
    (acc, product) => {
      const status = getStockStatus(product.quantity);
      acc.totalUnits += product.quantity;
      acc.totalValue += inventoryValue(product);
      if (status === 'low-stock') acc.lowStockCount += 1;
      if (status === 'out-of-stock') acc.outOfStockCount += 1;
      if (status === 'in-stock') acc.inStockCount += 1;
      return acc;
    },
    {
      totalProducts: products.length,
      totalCategories: categories.length,
      totalUnits: 0,
      totalValue: 0,
      lowStockCount: 0,
      outOfStockCount: 0,
      inStockCount: 0,
    },
  );
}

/** Joins each category with aggregate metrics computed from its products. */
export function computeCategoryStats(
  categories: Category[],
  products: Product[],
): CategoryWithStats[] {
  return categories.map((category) => {
    const owned = products.filter((product) => product.categoryId === category.id);
    return {
      ...category,
      productCount: owned.length,
      totalQuantity: owned.reduce((sum, product) => sum + product.quantity, 0),
      inventoryValue: owned.reduce((sum, product) => sum + inventoryValue(product), 0),
    };
  });
}

/** Product counts per category, for the distribution pie chart. */
export function productCountByCategory(
  categories: Category[],
  products: Product[],
): NamedValue[] {
  return categories
    .map((category) => ({
      name: category.name,
      value: products.filter((product) => product.categoryId === category.id).length,
    }))
    .filter((entry) => entry.value > 0)
    .sort((a, b) => b.value - a.value);
}

/** Inventory value per category, for the bar chart. */
export function valueByCategory(categories: Category[], products: Product[]): NamedValue[] {
  return categories
    .map((category) => ({
      name: category.name,
      value: products
        .filter((product) => product.categoryId === category.id)
        .reduce((sum, product) => sum + inventoryValue(product), 0),
    }))
    .filter((entry) => entry.value > 0)
    .sort((a, b) => b.value - a.value);
}

export function stockStatusBreakdown(products: Product[]): StockStatusBucket[] {
  const metrics = computeMetrics(products, []);
  return [
    { key: 'in-stock', name: 'In Stock', value: metrics.inStockCount },
    { key: 'low-stock', name: 'Low Stock', value: metrics.lowStockCount },
    { key: 'out-of-stock', name: 'Out of Stock', value: metrics.outOfStockCount },
  ];
}

export function lowStockProducts(products: Product[]): Product[] {
  return products
    .filter((product) => product.quantity < LOW_STOCK_THRESHOLD)
    .sort((a, b) => a.quantity - b.quantity);
}
