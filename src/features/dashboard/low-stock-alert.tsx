import { Link } from 'react-router-dom';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { StatusBadge } from '@/components/ui/status-badge';
import { Button } from '@/components/ui/button';
import type { Product } from '@/types';
import { formatNumber } from '@/utils/format';

/** Surfaces products at or below the low-stock threshold. */
export function LowStockAlert({ products }: { products: Product[] }) {
  return (
    <Card className="flex h-full flex-col">
      <CardHeader className="flex-row items-center justify-between space-y-0 pb-3">
        <div className="space-y-1">
          <CardTitle className="flex items-center gap-2 text-base">
            <AlertTriangle className="size-4 text-warning" />
            Low Stock Alerts
          </CardTitle>
          <CardDescription>Products with fewer than 10 units</CardDescription>
        </div>
        {products.length > 0 && (
          <Badge variant="warning">{formatNumber(products.length)}</Badge>
        )}
      </CardHeader>
      <CardContent className="flex-1">
        {products.length === 0 ? (
          <div className="flex h-full min-h-[180px] flex-col items-center justify-center text-center">
            <CheckCircle2 className="mb-2 size-8 text-success" />
            <p className="text-sm font-medium text-foreground">All stocked up</p>
            <p className="text-xs text-muted-foreground">No products need attention right now.</p>
          </div>
        ) : (
          <div className="-mx-2 max-h-[320px] space-y-1 overflow-y-auto pr-1">
            {products.slice(0, 8).map((product) => (
              <div
                key={product.id}
                className="flex items-center justify-between gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-muted/50"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-foreground">{product.name}</p>
                  <p className="truncate text-xs text-muted-foreground">{product.categoryName}</p>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <span className="text-sm font-semibold tabular-nums text-foreground">
                    {formatNumber(product.quantity)}
                  </span>
                  <StatusBadge quantity={product.quantity} />
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
      {products.length > 8 && (
        <div className="border-t border-border p-3">
          <Button asChild variant="ghost" size="sm" className="w-full">
            <Link to="/stock">View all {products.length} low-stock items</Link>
          </Button>
        </div>
      )}
    </Card>
  );
}
