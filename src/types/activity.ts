export type ActivityType =
  | 'PRODUCT_CREATED'
  | 'PRODUCT_UPDATED'
  | 'PRODUCT_DELETED'
  | 'STOCK_UPDATED'
  | 'CATEGORY_CREATED'
  | 'CATEGORY_UPDATED'
  | 'CATEGORY_DELETED';

export interface Activity {
  id: string;
  type: ActivityType;
  message: string;
  /** Optional secondary detail, e.g. "+25 units". */
  detail?: string;
  timestamp: string;
}
