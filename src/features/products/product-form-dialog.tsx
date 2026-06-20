import { useMemo } from 'react';
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
  /** When provided the dialog edits this product; otherwise it creates one. */
  product?: Product | null;
  onCreateCategory?: () => void;
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

  const isEdit = Boolean(product);

  const initialValues = useMemo<ProductFormValues>(() => {
    if (product) {
      return {
        name: product.name,
        id: product.id,
        categoryId: product.categoryId,
        price: String(product.price),
        quantity: String(product.quantity),
      };
    }
    return emptyProductValues();
    // Re-derive whenever the dialog target changes.
  }, [product]);

  const reservedIds = useMemo(
    () => products.filter((p) => p.id !== product?.id).map((p) => p.id),
    [products, product?.id],
  );

  const handleSubmit = (values: ProductFormValues) => {
    const payload = {
      id: values.id.trim(),
      name: values.name,
      categoryId: values.categoryId,
      price: Number(values.price),
      quantity: Number(values.quantity),
    };

    if (isEdit && product) {
      updateProduct(product.id, payload);
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
              : 'Fill in the details below to add a product to your inventory.'}
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
          // key forces a fresh Formik instance per target so fields reset correctly.
          <ProductForm
            key={product?.id ?? 'new'}
            categories={categories}
            initialValues={initialValues}
            reservedIds={reservedIds}
            submitLabel={isEdit ? 'Save changes' : 'Add product'}
            onSubmit={handleSubmit}
            onCancel={() => onOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
