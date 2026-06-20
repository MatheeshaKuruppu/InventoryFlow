import { useMemo } from 'react';
import { Boxes, DollarSign, FolderTree, Package, PieChart as PieIcon, BarChart3, Activity as ActivityIcon } from 'lucide-react';
import { useInventoryStore } from '@/store/inventoryStore';
import { useDelayedReady } from '@/hooks/useDelayedReady';
import { PageHeader } from '@/components/layout/page-header';
import { KpiCard } from '@/features/dashboard/kpi-card';
import { LowStockAlert } from '@/features/dashboard/low-stock-alert';
import { RecentActivity } from '@/features/dashboard/recent-activity';
import { DashboardSkeleton } from '@/features/dashboard/dashboard-skeleton';
import { ChartCard } from '@/components/charts/chart-card';
import { CategoryPieChart } from '@/components/charts/category-pie-chart';
import { ValueBarChart } from '@/components/charts/value-bar-chart';
import { StockDonutChart } from '@/components/charts/stock-donut-chart';
import {
  computeMetrics,
  lowStockProducts,
  productCountByCategory,
  stockStatusBreakdown,
  valueByCategory,
} from '@/utils/analytics';

export function DashboardPage() {
  const products = useInventoryStore((s) => s.products);
  const categories = useInventoryStore((s) => s.categories);
  const activity = useInventoryStore((s) => s.activity);
  const ready = useDelayedReady();

  const metrics = useMemo(() => computeMetrics(products, categories), [products, categories]);
  const pieData = useMemo(() => productCountByCategory(categories, products), [categories, products]);
  const barData = useMemo(() => valueByCategory(categories, products), [categories, products]);
  const donutData = useMemo(() => stockStatusBreakdown(products), [products]);
  const lowStock = useMemo(() => lowStockProducts(products), [products]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="A real-time overview of your inventory health and performance."
      />

      {!ready ? (
        <DashboardSkeleton />
      ) : (
        <>
          {/* KPI row */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <KpiCard title="Total Products" value={metrics.totalProducts} icon={Package} trend={8.2} accent="primary" index={0} />
            <KpiCard title="Total Categories" value={metrics.totalCategories} icon={FolderTree} trend={3.1} accent="violet" index={1} />
            <KpiCard title="Inventory Value" value={metrics.totalValue} icon={DollarSign} format="currency" trend={12.4} accent="emerald" index={2} />
            <KpiCard title="Units In Stock" value={metrics.totalUnits} icon={Boxes} trend={-2.7} accent="amber" index={3} />
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <ChartCard title="Category Distribution" description="Products per category" icon={PieIcon}>
              <CategoryPieChart data={pieData} />
            </ChartCard>
            <ChartCard title="Inventory Value" description="Value by category" icon={BarChart3}>
              <ValueBarChart data={barData} />
            </ChartCard>
            <ChartCard title="Stock Status" description="Availability overview" icon={ActivityIcon}>
              <StockDonutChart data={donutData} />
            </ChartCard>
          </div>

          {/* Alerts + activity */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <LowStockAlert products={lowStock} />
            <RecentActivity activity={activity} />
          </div>
        </>
      )}
    </div>
  );
}
