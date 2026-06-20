import { useMemo, useState } from 'react';
import { AlertTriangle, Boxes, History, PackageX, Search, Sparkles } from 'lucide-react';
import type { Product, StockAction } from '@/types';
import { useInventoryStore } from '@/store/inventoryStore';
import { useDelayedReady } from '@/hooks/useDelayedReady';
import { useDebounce } from '@/hooks/useDebounce';
import { computeMetrics } from '@/utils/analytics';
import { formatNumber } from '@/utils/format';

import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { EmptyState } from '@/components/ui/empty-state';
import { ProductTableSkeleton } from '@/features/products/product-table-skeleton';

import { StockOperationsTable } from '@/features/stock/stock-operations-table';
import { StockHistoryTable } from '@/features/stock/stock-history-table';
import { StockUpdateDialog } from '@/features/stock/stock-update-dialog';
import { cn } from '@/lib/utils';

type Tab = 'operations' | 'history';

const MINI_STATS = [
  { key: 'units', label: 'Units in stock', icon: Boxes, tone: 'text-primary' },
  { key: 'low', label: 'Low stock', icon: AlertTriangle, tone: 'text-warning' },
  { key: 'out', label: 'Out of stock', icon: PackageX, tone: 'text-destructive' },
] as const;

export function StockPage() {
  const products = useInventoryStore((s) => s.products);
  const categories = useInventoryStore((s) => s.categories);
  const stockHistory = useInventoryStore((s) => s.stockHistory);
  const ready = useDelayedReady();

  const [tab, setTab] = useState<Tab>('operations');
  const [search, setSearch] = useState('');
  const [stockTarget, setStockTarget] = useState<Product | null>(null);
  const [defaultAction, setDefaultAction] = useState<StockAction>('RESTOCK');

  const debounced = useDebounce(search, 250);
  const metrics = useMemo(() => computeMetrics(products, categories), [products, categories]);

  const filtered = useMemo(() => {
    const query = debounced.trim().toLowerCase();
    const list = query
      ? products.filter(
          (p) => p.name.toLowerCase().includes(query) || p.id.toLowerCase().includes(query),
        )
      : products;
    return [...list].sort((a, b) => a.quantity - b.quantity);
  }, [products, debounced]);

  const statValues: Record<(typeof MINI_STATS)[number]['key'], number> = {
    units: metrics.totalUnits,
    low: metrics.lowStockCount,
    out: metrics.outOfStockCount,
  };

  const openAdjust = (product: Product, action: StockAction) => {
    setStockTarget(product);
    setDefaultAction(action);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Stock Management"
        description="Restock, reduce and audit every movement across your inventory."
      />

      {/* Mini stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {MINI_STATS.map((stat) => (
          <Card key={stat.key} className="p-4">
            <div className="flex items-center gap-3">
              <span className={cn('flex size-10 items-center justify-center rounded-lg bg-muted', stat.tone)}>
                <stat.icon className="size-5" />
              </span>
              <div>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
                <p className="text-xl font-bold tabular-nums text-foreground">
                  {formatNumber(statValues[stat.key])}
                </p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Card className="overflow-hidden">
        {/* Tabs */}
        <div className="flex items-center justify-between gap-3 border-b border-border p-4">
          <div className="inline-flex rounded-lg bg-muted p-1">
            <button
              type="button"
              onClick={() => setTab('operations')}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                tab === 'operations'
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              <Sparkles className="size-4" /> Adjust Stock
            </button>
            <button
              type="button"
              onClick={() => setTab('history')}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                tab === 'history'
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              <History className="size-4" /> History
              {stockHistory.length > 0 && (
                <span className="ml-0.5 rounded-full bg-muted-foreground/15 px-1.5 text-xs">
                  {stockHistory.length}
                </span>
              )}
            </button>
          </div>

          {tab === 'operations' && (
            <div className="relative w-full max-w-xs">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search products…"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="pl-9"
                aria-label="Search products"
              />
            </div>
          )}
        </div>

        <CardContent className="p-0">
          {!ready ? (
            <ProductTableSkeleton />
          ) : tab === 'operations' ? (
            products.length === 0 ? (
              <EmptyState
                icon={Boxes}
                title="No products to manage"
                description="Add products before adjusting stock levels."
                className="border-0 bg-transparent"
              />
            ) : filtered.length === 0 ? (
              <EmptyState
                icon={Search}
                title="No matching products"
                description="Try a different search term."
                className="border-0 bg-transparent"
              />
            ) : (
              <div className="max-h-[560px] overflow-y-auto">
                <StockOperationsTable products={filtered} onAdjust={openAdjust} />
              </div>
            )
          ) : (
            <div className="max-h-[560px] overflow-y-auto">
              <StockHistoryTable history={stockHistory} />
            </div>
          )}
        </CardContent>
      </Card>

      <StockUpdateDialog
        open={Boolean(stockTarget)}
        onOpenChange={(open) => !open && setStockTarget(null)}
        product={stockTarget}
        defaultAction={defaultAction}
      />
    </div>
  );
}
