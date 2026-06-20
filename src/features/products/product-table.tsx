import { motion } from 'framer-motion';
import { ArrowDown, ArrowUp, ChevronsUpDown, MoreHorizontal, Package, Pencil, RefreshCcw, Trash2 } from 'lucide-react';
import type { Product } from '@/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/status-badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { formatCurrency, formatNumber } from '@/utils/format';
import { inventoryValue } from '@/utils/analytics';
import type { SortDir, SortKey } from './useProductFilters';
import { cn } from '@/lib/utils';

interface ProductTableProps {
  products: Product[];
  sortKey: SortKey;
  sortDir: SortDir;
  onSort: (key: SortKey) => void;
  isSelected: (id: string) => boolean;
  onToggle: (id: string) => void;
  onToggleAll: () => void;
  allSelected: boolean;
  someSelected: boolean;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
  onUpdateStock: (product: Product) => void;
}

function SortHeader({
  label,
  column,
  sortKey,
  sortDir,
  onSort,
  className,
}: {
  label: string;
  column: SortKey;
  sortKey: SortKey;
  sortDir: SortDir;
  onSort: (key: SortKey) => void;
  className?: string;
}) {
  const active = sortKey === column;
  return (
    <button
      type="button"
      onClick={() => onSort(column)}
      className={cn(
        'inline-flex items-center gap-1 font-semibold uppercase tracking-wide transition-colors hover:text-foreground',
        active && 'text-foreground',
        className,
      )}
    >
      {label}
      {active ? (
        sortDir === 'asc' ? (
          <ArrowUp className="size-3" />
        ) : (
          <ArrowDown className="size-3" />
        )
      ) : (
        <ChevronsUpDown className="size-3 opacity-50" />
      )}
    </button>
  );
}

export function ProductTable({
  products,
  sortKey,
  sortDir,
  onSort,
  isSelected,
  onToggle,
  onToggleAll,
  allSelected,
  someSelected,
  onEdit,
  onDelete,
  onUpdateStock,
}: ProductTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow className="hover:bg-transparent">
          <TableHead className="w-10">
            <Checkbox
              checked={allSelected}
              indeterminate={!allSelected && someSelected}
              onCheckedChange={onToggleAll}
              aria-label="Select all products on this page"
            />
          </TableHead>
          <TableHead>
            <SortHeader label="Product" column="name" sortKey={sortKey} sortDir={sortDir} onSort={onSort} />
          </TableHead>
          <TableHead className="hidden md:table-cell">Category</TableHead>
          <TableHead className="text-right">
            <SortHeader label="Price" column="price" sortKey={sortKey} sortDir={sortDir} onSort={onSort} className="justify-end" />
          </TableHead>
          <TableHead className="hidden text-right sm:table-cell">
            <SortHeader label="Qty" column="quantity" sortKey={sortKey} sortDir={sortDir} onSort={onSort} className="justify-end" />
          </TableHead>
          <TableHead className="hidden text-right lg:table-cell">
            <SortHeader label="Value" column="value" sortKey={sortKey} sortDir={sortDir} onSort={onSort} className="justify-end" />
          </TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="w-12 text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {products.map((product, index) => {
          const selected = isSelected(product.id);
          return (
            <motion.tr
              key={product.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: Math.min(index * 0.025, 0.3) }}
              data-state={selected ? 'selected' : undefined}
              className="border-b border-border transition-colors hover:bg-muted/50 data-[state=selected]:bg-accent/50"
            >
              <TableCell>
                <Checkbox
                  checked={selected}
                  onCheckedChange={() => onToggle(product.id)}
                  aria-label={`Select ${product.name}`}
                />
              </TableCell>
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
              <TableCell className="hidden md:table-cell">
                <span className="text-sm text-muted-foreground">{product.categoryName}</span>
              </TableCell>
              <TableCell className="text-right font-medium tabular-nums">
                {formatCurrency(product.price)}
              </TableCell>
              <TableCell className="hidden text-right tabular-nums sm:table-cell">
                {formatNumber(product.quantity)}
              </TableCell>
              <TableCell className="hidden text-right font-medium tabular-nums lg:table-cell">
                {formatCurrency(inventoryValue(product))}
              </TableCell>
              <TableCell>
                <StatusBadge quantity={product.quantity} />
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="size-8" aria-label={`Actions for ${product.name}`}>
                      <MoreHorizontal className="size-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-44">
                    <DropdownMenuItem onClick={() => onEdit(product)}>
                      <Pencil className="size-4" /> Edit product
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onUpdateStock(product)}>
                      <RefreshCcw className="size-4" /> Update stock
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem destructive onClick={() => onDelete(product)}>
                      <Trash2 className="size-4" /> Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </motion.tr>
          );
        })}
      </TableBody>
    </Table>
  );
}
