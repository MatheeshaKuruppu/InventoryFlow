import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import type { Product } from '@/types';
import { useInventoryStore } from '@/store/inventoryStore';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { EmptyState } from '@/components/ui/empty-state';
import { Button } from '@/components/ui/button';
import { FolderTree } from 'lucide-react';
import {
  ProductForm,
  emptyProductValues,
  type ProductFormValues,
} from '@/components/forms/product-form';

interface ProductFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** When provided the dialog opens directly in edit mode for this product. */
  product?: Product | null;
  onCreateCategory?: () => void;
}

// Turns a stored Product into the string-based form values Formik expects.
function toFormValues(product: Product): ProductFormValues {
  return {
    name: product.name,
    id: product.id,
    categoryId: product.categoryId,
    price: String(product.price),
    quantity: String(product.quantity),
  };
}

export function ProductFormDialog({
  open,
  onOpenChange,
  product,
  onCreateCategory,
}: ProductFormDialogProps) {
  const categories = useInventoryStore((s) => s.categories);
  const products = useInventoryStore((s) => s.products);
  const addProduct = useInventoryStore((s) => s.addProduct);
  const updateProduct = useInventoryStore((s) => s.updateProduct);

  // The product currently being edited. Null = we're creating a new product.
  // It starts from the `product` prop but can change if the user picks an
  // existing product from the name typeahead.
  const [editTarget, setEditTarget] = useState<Product | null>(product ?? null);

  // Whenever the dialog (re)opens, reset the edit target to the incoming prop.
  useEffect(() => {
    if (open) setEditTarget(product ?? null);
  }, [open, product]);

  const isEdit = editTarget !== null;

  // Initial form values: the target's data when editing, else blank + new SKU.
  const initialValues = useMemo<ProductFormValues>(
    () => (editTarget ? toFormValues(editTarget) : emptyProductValues()),
    [editTarget],
  );

  // IDs that are already taken - excluding the one we're editing, so its own
  // ID doesn't count as a duplicate.
  const reservedIds = useMemo(
    () => products.filter((p) => p.id !== editTarget?.id).map((p) => p.id),
    [products, editTarget?.id],
  );

  const handleSubmit = (values: ProductFormValues) => {
    const payload = {
      id: values.id.trim(),
      name: values.name,
      categoryId: values.categoryId,
      price: Number(values.price),
      quantity: Number(values.quantity),
    };

    if (isEdit && editTarget) {
      updateProduct(editTarget.id, payload);
      toast.success('Product updated', { description: payload.name });
    } else {
      addProduct(payload);
      toast.success('Product added', { description: payload.name });
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit product' : 'Add new product'}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Update the details for this product.'
              : 'Fill in the details below, or start typing a name to edit an existing product.'}
          </DialogDescription>
        </DialogHeader>

        {categories.length === 0 ? (
          <EmptyState
            icon={FolderTree}
            title="No categories yet"
            description="You need at least one category before adding products."
            action={
              <Button
                onClick={() => {
                  onOpenChange(false);
                  onCreateCategory?.();
                }}
              >
                Create a category
              </Button>
            }
          />
        ) : (
          // The `key` forces a fresh Formik instance whenever the edit target
          // changes (new product, or a suggestion was picked), so the fields
          // reload with the correct initial values.
          <ProductForm
            key={editTarget?.id ?? 'new'}
            categories={categories}
            products={products}
            initialValues={initialValues}
            reservedIds={reservedIds}
            isEditing={isEdit}
            submitLabel={isEdit ? 'Save changes' : 'Add product'}
            onSubmit={handleSubmit}
            onSelectExisting={(selected) => setEditTarget(selected)}
            onCreateNew={() => setEditTarget(null)}
            onCancel={() => onOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
