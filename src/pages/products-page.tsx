import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { Download, Package, PackageX, Plus, SearchX } from 'lucide-react';
import type { Product } from '@/types';
import { useInventoryStore } from '@/store/inventoryStore';
import { useProductFilters } from '@/features/products/useProductFilters';
import { useSelection } from '@/hooks/useSelection';
import { useDelayedReady } from '@/hooks/useDelayedReady';
import { exportProductsToCsv } from '@/utils/csv';
import { formatNumber } from '@/utils/format';

import { PageHeader } from '@/components/layout/page-header';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { Pagination } from '@/components/ui/pagination';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';

import { ProductToolbar } from '@/features/products/product-toolbar';
import { ProductTable } from '@/features/products/product-table';
import { ProductTableSkeleton } from '@/features/products/product-table-skeleton';
import { BulkActionBar } from '@/features/products/bulk-action-bar';
import { BulkRestockDialog } from '@/features/products/bulk-restock-dialog';
import { ProductFormDialog } from '@/features/products/product-form-dialog';
import { StockUpdateDialog } from '@/features/stock/stock-update-dialog';

export function ProductsPage() {
  const products = useInventoryStore((s) => s.products);
  const categories = useInventoryStore((s) => s.categories);
  const deleteProduct = useInventoryStore((s) => s.deleteProduct);
  const deleteProducts = useInventoryStore((s) => s.deleteProducts);
  const bulkRestock = useInventoryStore((s) => s.bulkRestock);

  const ready = useDelayedReady();
  const filters = useProductFilters(products);
  const selection = useSelection();

  // Honor a ?category=<id> deep link from the Categories page.
  const [searchParams, setSearchParams] = useSearchParams();
  const { setCategoryFilter } = filters;
  useEffect(() => {
    const categoryId = searchParams.get('category');
    if (categoryId && categories.some((c) => c.id === categoryId)) {
      setCategoryFilter(categoryId);
      searchParams.delete('category');
      setSearchParams(searchParams, { replace: true });
    }
    // Run once on mount for the incoming deep link.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Dialog state
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [stockTarget, setStockTarget] = useState<Product | null>(null);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [bulkRestockOpen, setBulkRestockOpen] = useState(false);

  const pageIds = useMemo(() => filters.paged.map((p) => p.id), [filters.paged]);
  const allSelected = pageIds.length > 0 && pageIds.every((id) => selection.isSelected(id));
  const someSelected = pageIds.some((id) => selection.isSelected(id));

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (product: Product) => {
    setEditing(product);
    setFormOpen(true);
  };

  const handleExport = () => {
    if (products.length === 0) {
      toast.error('Nothing to export', { description: 'Add some products first.' });
      return;
    }
    exportProductsToCsv(filters.filtered.length ? filters.filtered : products);
    toast.success('Export ready', {
      description: `${formatNumber((filters.filtered.length ? filters.filtered : products).length)} products exported to CSV.`,
    });
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    deleteProduct(deleteTarget.id);
    selection.toggle(deleteTarget.id);
    toast.success('Product deleted', { description: deleteTarget.name });
  };

  const confirmBulkDelete = () => {
    const ids = selection.selectedIds;
    deleteProducts(ids);
    selection.clear();
    toast.success(`${ids.length} products deleted`);
  };

  const confirmBulkRestock = (amount: number) => {
    const ids = selection.selectedIds;
    bulkRestock(ids, amount);
    toast.success(`Restocked ${ids.length} products`, { description: `+${amount} units each` });
    selection.clear();
  };

  const isEmpty = products.length === 0;
  const noResults = !isEmpty && filters.filteredCount === 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Products"
        description="Manage your full product catalog, stock levels and pricing."
        actions={
          <>
            <Button variant="outline" onClick={handleExport} className="gap-2">
              <Download className="size-4" />
              <span className="hidden sm:inline">Export CSV</span>
            </Button>
            <Button onClick={openCreate} className="gap-2">
              <Plus className="size-4" />
              Add Product
            </Button>
          </>
        }
      />

      {isEmpty && ready ? (
        <EmptyState
          icon={Package}
          title="No products yet"
          description="Get started by adding your first product to the inventory."
          action={
            <Button onClick={openCreate} className="gap-2">
              <Plus className="size-4" />
              Add your first product
            </Button>
          }
        />
      ) : (
        <Card className="overflow-hidden">
          <div className="border-b border-border p-4">
            <ProductToolbar filters={filters} categories={categories} />
          </div>

          {!ready ? (
            <ProductTableSkeleton />
          ) : noResults ? (
            <EmptyState
              icon={SearchX}
              title="No matching products"
              description="Try adjusting your search or filters to find what you're looking for."
              className="border-0 bg-transparent"
              action={
                <Button variant="outline" onClick={filters.resetFilters}>
                  Clear filters
                </Button>
              }
            />
          ) : (
            <ProductTable
              products={filters.paged}
              sortKey={filters.sortKey}
              sortDir={filters.sortDir}
              onSort={filters.toggleSort}
              isSelected={selection.isSelected}
              onToggle={selection.toggle}
              onToggleAll={() => selection.toggleAll(pageIds)}
              allSelected={allSelected}
              someSelected={someSelected}
              onEdit={openEdit}
              onDelete={setDeleteTarget}
              onUpdateStock={setStockTarget}
            />
          )}

          {ready && !noResults && (
            <div className="flex flex-col items-center justify-between gap-3 border-t border-border p-4 sm:flex-row">
              <p className="text-sm text-muted-foreground">
                Showing{' '}
                <span className="font-medium text-foreground">
                  {(filters.page - 1) * filters.pageSize + 1}–
                  {Math.min(filters.page * filters.pageSize, filters.filteredCount)}
                </span>{' '}
                of <span className="font-medium text-foreground">{formatNumber(filters.filteredCount)}</span>
              </p>
              <Pagination
                page={filters.page}
                pageCount={filters.pageCount}
                onPageChange={filters.setPage}
              />
            </div>
          )}
        </Card>
      )}

      {/* Floating bulk action bar */}
      <BulkActionBar
        count={selection.count}
        onClear={selection.clear}
        onRestock={() => setBulkRestockOpen(true)}
        onDelete={() => setBulkDeleteOpen(true)}
      />

      {/* Dialogs */}
      <ProductFormDialog open={formOpen} onOpenChange={setFormOpen} product={editing} />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete product?"
        description={
          <>
            This will permanently remove{' '}
            <span className="font-medium text-foreground">{deleteTarget?.name}</span> and its stock
            history. This action cannot be undone.
          </>
        }
        confirmLabel="Delete"
        onConfirm={confirmDelete}
      />

      <ConfirmDialog
        open={bulkDeleteOpen}
        onOpenChange={setBulkDeleteOpen}
        title={`Delete ${selection.count} products?`}
        description={
          <>
            You're about to permanently delete{' '}
            <span className="font-medium text-foreground">{selection.count} products</span> and their
            stock history. This action cannot be undone.
          </>
        }
        confirmLabel="Delete all"
        icon={PackageX}
        onConfirm={confirmBulkDelete}
      />

      <BulkRestockDialog
        open={bulkRestockOpen}
        onOpenChange={setBulkRestockOpen}
        count={selection.count}
        onConfirm={confirmBulkRestock}
      />

      <StockUpdateDialog
        open={Boolean(stockTarget)}
        onOpenChange={(open) => !open && setStockTarget(null)}
        product={stockTarget}
      />
    </div>
  );
}
