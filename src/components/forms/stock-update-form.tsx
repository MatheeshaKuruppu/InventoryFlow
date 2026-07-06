// Stock update form: lets the user RESTOCK (add) or reduce (SALE) a product's
// quantity. Built with Formik (form state) + Yup (validation). The key business
// rule enforced here is that stock can never be reduced below zero.
import { Formik, Form, type FormikHelpers } from 'formik';
import { Minus, Plus } from 'lucide-react';
import type { Product, StockAction } from '@/types';
import { stockUpdateValidationSchema } from '@/lib/validation';
import { Field } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// The shape of the form's fields. `amount` is a string because HTML inputs
// always hold strings; we convert it to a number only when we submit.
export interface StockUpdateValues {
  action: StockAction; // 'RESTOCK' | 'SALE'
  amount: string;
}

interface StockUpdateFormProps {
  product: Product; // the product whose stock we're changing
  defaultAction?: StockAction; // which button starts selected
  // Called with a clean, typed payload once the form passes validation.
  onSubmit: (values: { action: StockAction; amount: number }) => void;
  onCancel: () => void; // close the dialog without saving
}

export function StockUpdateForm({
  product,
  defaultAction = 'RESTOCK',
  onSubmit,
  onCancel,
}: StockUpdateFormProps) {
  // Formik calls this when the user submits AND Yup validation has passed.
  // `helpers` lets us set extra errors or stop the submitting state manually.
  const handleSubmit = (values: StockUpdateValues, helpers: FormikHelpers<StockUpdateValues>) => {
    const amount = Number(values.amount); // string -> number

    // Guard #1 (form-level): block a reduction bigger than what's in stock.
    // This gives the user a helpful message instead of silently clamping to 0.
    // (The store also clamps with Math.max(0, ...) as a second safety net.)
    if (values.action === 'SALE' && amount > product.quantity) {
      helpers.setFieldError('amount', `Only ${product.quantity} in stock — cannot reduce by ${amount}`);
      helpers.setSubmitting(false);
      return; // stop here; do not call onSubmit
    }

    // Valid -> hand a clean payload back to the parent (which calls the store).
    onSubmit({ action: values.action, amount });
  };

  return (
    <Formik
      // The form's starting values. `defaultAction` decides the selected button.
      initialValues={{ action: defaultAction, amount: '' } as StockUpdateValues}
      // Yup schema that validates `amount` (required, whole number, > 0).
      validationSchema={stockUpdateValidationSchema}
      onSubmit={handleSubmit}
    >
      {/*
        Formik's "render prop" pattern: it passes us the live form state and
        helpers so we can build the UI. Destructured below:
        - values: current field values
        - errors / touched: validation messages, and which fields were visited
        - handleChange / handleBlur: wire native inputs to Formik
        - setFieldValue: set a field manually (used for the RESTOCK/SALE toggle)
      */}
      {({ values, errors, touched, handleChange, handleBlur, setFieldValue }) => {
        // Live preview math: what will the new quantity be?
        const amountNum = Number(values.amount) || 0;
        const projected =
          values.action === 'RESTOCK'
            ? product.quantity + amountNum
            : Math.max(0, product.quantity - amountNum); // never below zero

        return (
          <Form className="space-y-4">
            {/* Action toggle: two buttons that set `values.action` via setFieldValue. */}
            <div className="grid grid-cols-2 gap-2">
              {(['RESTOCK', 'SALE'] as const).map((action) => {
                const active = values.action === action; // is this button selected?
                const isRestock = action === 'RESTOCK';
                return (
                  <button
                    key={action}
                    type="button" // type="button" so it doesn't submit the form
                    onClick={() => setFieldValue('action', action)}
                    className={cn(
                      'flex items-center justify-center gap-2 rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors',
                      // Green when Restock is active, red when Reduce is active.
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

            {/* Amount input. `Field` renders the label + any validation error. */}
            <Field
              label="Amount"
              htmlFor="amount"
              required
              error={errors.amount}
              touched={touched.amount}
            >
              <Input
                id="amount"
                name="amount" // must match the key in initialValues for Formik
                type="number"
                min="1"
                step="1"
                placeholder="Enter quantity"
                value={values.amount}
                onChange={handleChange} // updates values.amount
                onBlur={handleBlur} // marks the field "touched" so errors can show
                // Only show the red invalid style once the field was touched.
                invalid={Boolean(touched.amount && errors.amount)}
                autoFocus
              />
            </Field>

            {/* Live projection: shows "current -> new" quantity as the user types. */}
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

            {/* Footer actions. Submit is disabled until a positive amount is entered. */}
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
