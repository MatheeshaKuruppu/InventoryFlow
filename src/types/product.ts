export interface Product {
  id: string;
  name: string;
  categoryId: string;
  categoryName: string;
  price: number;
  quantity: number;
  createdAt: string;
  updatedAt: string;
}

/** Shape submitted by the product form before persistence concerns are applied. */
export interface ProductDraft {
  id: string;
  name: string;
  categoryId: string;
  price: number;
  quantity: number;
}

export const LOW_STOCK_THRESHOLD = 10;

export type StockStatus = 'in-stock' | 'low-stock' | 'out-of-stock';

export function getStockStatus(quantity: number): StockStatus {
  if (quantity <= 0) return 'out-of-stock';
  if (quantity < LOW_STOCK_THRESHOLD) return 'low-stock';
  return 'in-stock';
}

export const STOCK_STATUS_LABEL: Record<StockStatus, string> = {
  'in-stock': 'In Stock',
  'low-stock': 'Low Stock',
  'out-of-stock': 'Out of Stock',
};
