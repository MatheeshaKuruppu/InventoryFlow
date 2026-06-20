import { ArrowDownRight, ArrowUpRight, History } from 'lucide-react';
import type { StockHistory } from '@/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/empty-state';
import { formatDateTime } from '@/utils/format';
import { cn } from '@/lib/utils';

export function StockHistoryTable({ history }: { history: StockHistory[] }) {
  if (history.length === 0) {
    return (
      <EmptyState
        icon={History}
        title="No stock movements yet"
        description="Restock or reduce a product to start building your audit trail."
        className="border-0 bg-transparent"
      />
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow className="hover:bg-transparent">
          <TableHead>Product</TableHead>
          <TableHead>Action</TableHead>
          <TableHead className="text-right">Previous</TableHead>
          <TableHead className="text-right">Change</TableHead>
          <TableHead className="text-right">New</TableHead>
          <TableHead className="hidden text-right md:table-cell">When</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {history.map((entry) => {
          const isRestock = entry.action === 'RESTOCK';
          return (
            <TableRow key={entry.id}>
              <TableCell className="font-medium text-foreground">{entry.productName}</TableCell>
              <TableCell>
                <Badge variant={isRestock ? 'success' : 'destructive'}>
                  {isRestock ? <ArrowUpRight className="size-3" /> : <ArrowDownRight className="size-3" />}
                  {isRestock ? 'Restock' : 'Reduce'}
                </Badge>
              </TableCell>
              <TableCell className="text-right tabular-nums text-muted-foreground">
                {entry.previousQuantity}
              </TableCell>
              <TableCell
                className={cn(
                  'text-right font-semibold tabular-nums',
                  isRestock ? 'text-success' : 'text-destructive',
                )}
              >
                {entry.changeAmount > 0 ? '+' : ''}
                {entry.changeAmount}
              </TableCell>
              <TableCell className="text-right font-medium tabular-nums text-foreground">
                {entry.newQuantity}
              </TableCell>
              <TableCell className="hidden whitespace-nowrap text-right text-xs text-muted-foreground md:table-cell">
                {formatDateTime(entry.timestamp)}
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
