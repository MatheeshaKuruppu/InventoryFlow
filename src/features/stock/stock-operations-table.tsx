import { Minus, Package, Plus } from 'lucide-react';
import type { Product } from '@/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/status-badge';
import { formatNumber } from '@/utils/format';

interface StockOperationsTableProps {
  products: Product[];
  onAdjust: (product: Product, action: 'RESTOCK' | 'SALE') => void;
}

export function StockOperationsTable({ products, onAdjust }: StockOperationsTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow className="hover:bg-transparent">
          <TableHead>Product</TableHead>
          <TableHead className="hidden sm:table-cell">Category</TableHead>
          <TableHead className="text-right">Quantity</TableHead>
          <TableHead className="hidden md:table-cell">Status</TableHead>
          <TableHead className="text-right">Adjust</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {products.map((product) => (
          <TableRow key={product.id}>
            <TableCell>
              <div className="flex items-center gap-3">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                  <Package className="size-4" />
                </span>
                <div className="min-w-0">
                  <p className="truncate font-medium text-foreground">{product.name}</p>
                  <p className="truncate font-mono text-xs text-muted-foreground">{product.id}</p>
                </div>
              </div>
            </TableCell>
            <TableCell className="hidden text-sm text-muted-foreground sm:table-cell">
              {product.categoryName}
            </TableCell>
            <TableCell className="text-right text-base font-semibold tabular-nums">
              {formatNumber(product.quantity)}
            </TableCell>
            <TableCell className="hidden md:table-cell">
              <StatusBadge quantity={product.quantity} />
            </TableCell>
            <TableCell>
              <div className="flex items-center justify-end gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  className="size-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
                  onClick={() => onAdjust(product, 'SALE')}
                  disabled={product.quantity === 0}
                  aria-label={`Reduce stock for ${product.name}`}
                >
                  <Minus className="size-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="size-8 text-success hover:bg-success/10 hover:text-success"
                  onClick={() => onAdjust(product, 'RESTOCK')}
                  aria-label={`Restock ${product.name}`}
                >
                  <Plus className="size-4" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
