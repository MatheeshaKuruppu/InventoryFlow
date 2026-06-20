import { Formik, Form, type FormikHelpers } from 'formik';
import { Minus, Plus } from 'lucide-react';
import type { Product, StockAction } from '@/types';
import { stockUpdateValidationSchema } from '@/lib/validation';
import { Field } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface StockUpdateValues {
  action: StockAction;
  amount: string;
}

interface StockUpdateFormProps {
  product: Product;
  defaultAction?: StockAction;
  onSubmit: (values: { action: StockAction; amount: number }) => void;
  onCancel: () => void;
}

export function StockUpdateForm({
  product,
  defaultAction = 'RESTOCK',
  onSubmit,
  onCancel,
}: StockUpdateFormProps) {
  const handleSubmit = (values: StockUpdateValues, helpers: FormikHelpers<StockUpdateValues>) => {
    const amount = Number(values.amount);
    if (values.action === 'SALE' && amount > product.quantity) {
      helpers.setFieldError('amount', `Only ${product.quantity} in stock — cannot reduce by ${amount}`);
      helpers.setSubmitting(false);
      return;
    }
    onSubmit({ action: values.action, amount });
  };

  return (
    <Formik
      initialValues={{ action: defaultAction, amount: '' } as StockUpdateValues}
      validationSchema={stockUpdateValidationSchema}
      onSubmit={handleSubmit}
    >
      {({ values, errors, touched, handleChange, handleBlur, setFieldValue }) => {
        const amountNum = Number(values.amount) || 0;
        const projected =
          values.action === 'RESTOCK'
            ? product.quantity + amountNum
            : Math.max(0, product.quantity - amountNum);

        return (
          <Form className="space-y-4">
            {/* Action toggle */}
            <div className="grid grid-cols-2 gap-2">
              {(['RESTOCK', 'SALE'] as const).map((action) => {
                const active = values.action === action;
                const isRestock = action === 'RESTOCK';
                return (
                  <button
                    key={action}
                    type="button"
                    onClick={() => setFieldValue('action', action)}
                    className={cn(
                      'flex items-center justify-center gap-2 rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors',
                      active
                        ? isRestock
                          ? 'border-success bg-success/10 text-success'
                          : 'border-destructive bg-destructive/10 text-destructive'
                        : 'border-input text-muted-foreground hover:bg-accent/60',
                    )}
                  >
                    {isRestock ? <Plus className="size-4" /> : <Minus className="size-4" />}
                    {isRestock ? 'Restock' : 'Reduce'}
                  </button>
                );
              })}
            </div>

            <Field
              label="Amount"
              htmlFor="amount"
              required
              error={errors.amount}
              touched={touched.amount}
            >
              <Input
                id="amount"
                name="amount"
                type="number"
                min="1"
                step="1"
                placeholder="Enter quantity"
                value={values.amount}
                onChange={handleChange}
                onBlur={handleBlur}
                invalid={Boolean(touched.amount && errors.amount)}
                autoFocus
              />
            </Field>

            {/* Live projection */}
            <div className="flex items-center justify-between rounded-lg border border-border bg-muted/40 px-4 py-3 text-sm">
              <span className="text-muted-foreground">New quantity</span>
              <span className="flex items-center gap-2 font-semibold">
                <span className="text-muted-foreground">{product.quantity}</span>
                <span className="text-muted-foreground">→</span>
                <span
                  className={cn(
                    values.action === 'RESTOCK' ? 'text-success' : 'text-destructive',
                  )}
                >
                  {projected}
                </span>
              </span>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
              <Button type="submit" disabled={amountNum <= 0}>
                Confirm {values.action === 'RESTOCK' ? 'Restock' : 'Reduction'}
              </Button>
            </div>
          </Form>
        );
      }}
    </Formik>
  );
}
