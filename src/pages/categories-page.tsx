import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { FolderPlus, FolderTree, Plus } from 'lucide-react';
import type { CategoryWithStats } from '@/types';
import { useInventoryStore } from '@/store/inventoryStore';
import { useDelayedReady } from '@/hooks/useDelayedReady';
import { computeCategoryStats } from '@/utils/analytics';

import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';

import { CategoryCard } from '@/features/categories/category-card';
import { CategoryFormDialog } from '@/features/categories/category-form-dialog';

export function CategoriesPage() {
  const categories = useInventoryStore((s) => s.categories);
  const products = useInventoryStore((s) => s.products);
  const deleteCategory = useInventoryStore((s) => s.deleteCategory);
  const ready = useDelayedReady();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<CategoryWithStats | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<CategoryWithStats | null>(null);

  const stats = useMemo(
    () =>
      computeCategoryStats(categories, products).sort((a, b) => b.productCount - a.productCount),
    [categories, products],
  );

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    deleteCategory(deleteTarget.id);
    toast.success('Category deleted', { description: deleteTarget.name });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Categories"
        description="Organize your products into meaningful groups."
        actions={
          <Button onClick={openCreate} className="gap-2">
            <Plus className="size-4" />
            New Category
          </Button>
        }
      />

      {!ready ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="p-5">
              <Skeleton className="size-11 rounded-xl" />
              <Skeleton className="mt-4 h-4 w-32" />
              <Skeleton className="mt-2 h-3 w-full" />
              <Skeleton className="mt-6 h-10 w-full" />
            </Card>
          ))}
        </div>
      ) : categories.length === 0 ? (
        <EmptyState
          icon={FolderTree}
          title="No categories yet"
          description="Create your first category to start organizing your inventory."
          action={
            <Button onClick={openCreate} className="gap-2">
              <FolderPlus className="size-4" />
              Create a category
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {stats.map((category, index) => (
            <CategoryCard
              key={category.id}
              category={category}
              index={index}
              onEdit={(target) => {
                setEditing(target);
                setFormOpen(true);
              }}
              onDelete={setDeleteTarget}
            />
          ))}
        </div>
      )}

      <CategoryFormDialog open={formOpen} onOpenChange={setFormOpen} category={editing} />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete category?"
        description={
          <>
            This will permanently remove the{' '}
            <span className="font-medium text-foreground">{deleteTarget?.name}</span> category. This
            action cannot be undone.
          </>
        }
        confirmLabel="Delete"
        onConfirm={confirmDelete}
      />
    </div>
  );
}
