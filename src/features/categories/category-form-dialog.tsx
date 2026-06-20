import { useMemo } from 'react';
import { toast } from 'sonner';
import type { Category } from '@/types';
import { useInventoryStore } from '@/store/inventoryStore';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  CategoryForm,
  emptyCategoryValues,
  type CategoryFormValues,
} from '@/components/forms/category-form';

interface CategoryFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category?: Category | null;
}

export function CategoryFormDialog({ open, onOpenChange, category }: CategoryFormDialogProps) {
  const addCategory = useInventoryStore((s) => s.addCategory);
  const updateCategory = useInventoryStore((s) => s.updateCategory);
  const isEdit = Boolean(category);

  const initialValues = useMemo<CategoryFormValues>(
    () =>
      category
        ? { name: category.name, description: category.description }
        : emptyCategoryValues(),
    [category],
  );

  const handleSubmit = (values: CategoryFormValues) => {
    if (isEdit && category) {
      updateCategory(category.id, values);
      toast.success('Category updated', { description: values.name });
    } else {
      addCategory(values);
      toast.success('Category created', { description: values.name });
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit category' : 'Create category'}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Update the name or description for this category.'
              : 'Group related products together with a new category.'}
          </DialogDescription>
        </DialogHeader>
        <CategoryForm
          key={category?.id ?? 'new'}
          initialValues={initialValues}
          submitLabel={isEdit ? 'Save changes' : 'Create category'}
          onSubmit={handleSubmit}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
