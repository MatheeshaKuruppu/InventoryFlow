export type StockAction = 'RESTOCK' | 'SALE';

export interface StockHistory {
  id: string;
  productId: string;
  productName: string;
  previousQuantity: number;
  newQuantity: number;
  changeAmount: number;
  action: StockAction;
  timestamp: string;
}

export const STOCK_ACTION_LABEL: Record<StockAction, string> = {
  RESTOCK: 'Restock',
  SALE: 'Sale / Reduce',
};
