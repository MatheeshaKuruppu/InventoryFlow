import { Badge } from './badge';
import { getStockStatus, STOCK_STATUS_LABEL, type StockStatus } from '@/types';
import { cn } from '@/lib/utils';

const VARIANT: Record<StockStatus, 'success' | 'warning' | 'destructive'> = {
  'in-stock': 'success',
  'low-stock': 'warning',
  'out-of-stock': 'destructive',
};

const DOT: Record<StockStatus, string> = {
  'in-stock': 'bg-success',
  'low-stock': 'bg-warning',
  'out-of-stock': 'bg-destructive',
};

interface StatusBadgeProps {
  quantity: number;
  className?: string;
}

/** Derives and renders the stock status pill for a given quantity. */
export function StatusBadge({ quantity, className }: StatusBadgeProps) {
  const status = getStockStatus(quantity);
  return (
    <Badge variant={VARIANT[status]} className={className}>
      <span className={cn('size-1.5 rounded-full', DOT[status])} aria-hidden />
      {STOCK_STATUS_LABEL[status]}
    </Badge>
  );
}
