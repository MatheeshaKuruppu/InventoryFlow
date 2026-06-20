import { toast } from 'sonner';
import type { Product, StockAction } from '@/types';
import { useInventoryStore } from '@/store/inventoryStore';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { StockUpdateForm } from '@/components/forms/stock-update-form';

interface StockUpdateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: Product | null;
  defaultAction?: StockAction;
}

export function StockUpdateDialog({
  open,
  onOpenChange,
  product,
  defaultAction,
}: StockUpdateDialogProps) {
  const adjustStock = useInventoryStore((s) => s.adjustStock);

  if (!product) return null;

  const handleSubmit = ({ action, amount }: { action: StockAction; amount: number }) => {
    adjustStock(product.id, action, amount);
    const verb = action === 'RESTOCK' ? 'Restocked' : 'Reduced';
    toast.success(`${verb} "${product.name}"`, {
      description: `${action === 'RESTOCK' ? '+' : '-'}${amount} units`,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Update stock</DialogTitle>
          <DialogDescription>
            {product.name} · Current quantity {product.quantity}
          </DialogDescription>
        </DialogHeader>
        <StockUpdateForm
          key={`${product.id}-${defaultAction}`}
          product={product}
          defaultAction={defaultAction}
          onSubmit={handleSubmit}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
