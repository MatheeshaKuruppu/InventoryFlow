import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Field } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface BulkRestockDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  count: number;
  onConfirm: (amount: number) => void;
}

export function BulkRestockDialog({ open, onOpenChange, count, onConfirm }: BulkRestockDialogProps) {
  const [amount, setAmount] = useState('');
  const [touched, setTouched] = useState(false);

  const numeric = Number(amount);
  const error =
    amount.trim() === ''
      ? 'Amount is required'
      : !Number.isInteger(numeric) || numeric <= 0
        ? 'Enter a whole number greater than 0'
        : undefined;

  const reset = () => {
    setAmount('');
    setTouched(false);
  };

  const handleConfirm = () => {
    setTouched(true);
    if (error) return;
    onConfirm(numeric);
    reset();
    onOpenChange(false);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) reset();
        onOpenChange(next);
      }}
    >
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Restock {count} products</DialogTitle>
          <DialogDescription>
            Add the same number of units to every selected product.
          </DialogDescription>
        </DialogHeader>
        <Field label="Units to add (per product)" htmlFor="bulk-amount" required error={error} touched={touched}>
          <Input
            id="bulk-amount"
            type="number"
            min="1"
            step="1"
            placeholder="e.g. 25"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            onBlur={() => setTouched(true)}
            invalid={Boolean(touched && error)}
            autoFocus
          />
        </Field>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleConfirm}>Restock all</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
