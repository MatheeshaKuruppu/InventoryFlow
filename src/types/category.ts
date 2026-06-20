export interface Category {
  id: string;
  name: string;
  description: string;
  createdAt: string;
}

export type CategoryDraft = Pick<Category, 'name' | 'description'>;

/** A category enriched with aggregate metrics derived from its products. */
export interface CategoryWithStats extends Category {
  productCount: number;
  totalQuantity: number;
  inventoryValue: number;
}
