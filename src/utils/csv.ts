import Papa from 'papaparse';
import { format } from 'date-fns';
import type { Product } from '@/types';
import { getStockStatus, STOCK_STATUS_LABEL } from '@/types';

/** Triggers a browser download for the given text content. */
function downloadFile(filename: string, content: string, mime = 'text/csv;charset=utf-8;'): void {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/** Serializes products into a flat, spreadsheet-friendly CSV and downloads it. */
export function exportProductsToCsv(products: Product[], now = new Date()): void {
  const rows = products.map((product) => ({
    'Product ID': product.id,
    'Product Name': product.name,
    Category: product.categoryName,
    Price: product.price.toFixed(2),
    Quantity: product.quantity,
    'Inventory Value': (product.price * product.quantity).toFixed(2),
    Status: STOCK_STATUS_LABEL[getStockStatus(product.quantity)],
    'Created At': product.createdAt,
    'Updated At': product.updatedAt,
  }));

  const csv = Papa.unparse(rows, { quotes: true });
  const stamp = format(now, 'yyyy-MM-dd_HHmm');
  downloadFile(`inventoryflow_products_${stamp}.csv`, csv);
}
