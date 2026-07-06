// Product form (Add / Edit). Formik manages the fields; Yup validates them.
// Notable extras:
//  - an auto-generated SKU (with regenerate + manual edit),
//  - a duplicate-ID check on submit,
//  - a name typeahead: while creating, typing shows existing products with a
//    similar name; selecting one loads its data and switches the form to Edit.
import { useState } from 'react';
import { Formik, Form, type FormikHelpers } from 'formik';
import { Pencil, RefreshCw } from 'lucide-react';
import type { Category, Product } from '@/types';
import { productValidationSchema } from '@/lib/validation';
import { generateSku } from '@/utils/id';
import { formatCurrency } from '@/utils/format';
import { Field } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export interface ProductFormValues {
  name: string;
  id: string;
  categoryId: string;
  price: string;
  quantity: string;
}

interface ProductFormProps {
  categories: Category[];
  /** All products - used to build the name typeahead suggestions. */
  products: Product[];
  initialValues: ProductFormValues;
  /** Existing product IDs used to enforce uniqueness (excludes the edit target). */
  reservedIds: string[];
  /** True when the form is editing an existing product (hides suggestions). */
  isEditing: boolean;
  submitLabel: string;
  onSubmit: (values: ProductFormValues) => void;
  /** Called when the user picks an existing product from the suggestions. */
  onSelectExisting: (product: Product) => void;
  /** Called to leave "edit existing" mode and start a fresh product. */
  onCreateNew: () => void;
  onCancel: () => void;
}

export const emptyProductValues = (): ProductFormValues => ({
  name: '',
  id: generateSku(),
  categoryId: '',
  price: '',
  quantity: '',
});

export function ProductForm({
  categories,
  products,
  initialValues,
  reservedIds,
  isEditing,
  submitLabel,
  onSubmit,
  onSelectExisting,
  onCreateNew,
  onCancel,
}: ProductFormProps) {
  // Whether the name input is focused - controls when suggestions are visible.
  const [nameFocused, setNameFocused] = useState(false);

  // Runs after Yup passes. We do one extra check Yup can't: uniqueness.
  const handleSubmit = (
    values: ProductFormValues,
    helpers: FormikHelpers<ProductFormValues>,
  ) => {
    const normalizedId = values.id.trim();
    // `reservedIds` = all other products' IDs. Reject a duplicate with an
    // inline error instead of creating two products with the same ID.
    if (reservedIds.includes(normalizedId)) {
      helpers.setFieldError('id', 'This Product ID is already in use');
      helpers.setSubmitting(false);
      return;
    }
    onSubmit(values); // valid + unique -> hand off to the parent
  };

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={productValidationSchema}
      onSubmit={handleSubmit}
      validateOnBlur
    >
      {({ values, errors, touched, handleChange, handleBlur, setFieldValue, setFieldTouched }) => {
        // Build the "similar products" list from what the user has typed.
        // Only while CREATING (not editing) and once there's at least 1 char.
        const query = values.name.trim().toLowerCase();
        const suggestions =
          !isEditing && query.length >= 1
            ? products
                .filter((p) => p.name.toLowerCase().includes(query))
                .slice(0, 6) // cap the dropdown length
            : [];
        const showSuggestions = nameFocused && suggestions.length > 0;

        return (
          <Form className="space-y-4">
            {/* Banner shown when editing an existing product (from a suggestion
                or from the table). Lets the user bail back to "create new". */}
            {isEditing && (
              <div className="flex items-center justify-between gap-3 rounded-lg border border-primary/30 bg-primary/5 px-3 py-2 text-sm">
                <span className="flex items-center gap-2 font-medium text-primary">
                  <Pencil className="size-3.5" />
                  Editing an existing product
                </span>
                <button
                  type="button"
                  onClick={onCreateNew}
                  className="text-xs font-medium text-primary underline-offset-2 hover:underline"
                >
                  Create new instead
                </button>
              </div>
            )}

            <Field
              label="Product Name"
              htmlFor="name"
              required
              error={errors.name}
              touched={touched.name}
              hint={!isEditing ? 'Type to find existing' : undefined}
            >
              {/* `relative` so the suggestions dropdown can position under the input. */}
              <div className="relative">
                <Input
                  id="name"
                  name="name"
                  placeholder="e.g. Aurora Wireless Headphones"
                  value={values.name}
                  onChange={handleChange}
                  onFocus={() => setNameFocused(true)}
                  onBlur={(e) => {
                    handleBlur(e); // let Formik mark the field touched
                    setNameFocused(false); // hide suggestions when leaving the field
                  }}
                  invalid={Boolean(touched.name && errors.name)}
                  autoComplete="off"
                  autoFocus
                />

                {showSuggestions && (
                  <div className="absolute z-20 mt-1 w-full overflow-hidden rounded-lg border border-border bg-popover shadow-lg">
                    <p className="border-b border-border px-3 py-1.5 text-xs text-muted-foreground">
                      Existing products - select one to edit it
                    </p>
                    <ul className="max-h-56 overflow-y-auto py-1">
                      {suggestions.map((p) => (
                        <li key={p.id}>
                          {/* onMouseDown (not onClick) fires BEFORE the input's
                              blur event, so the selection isn't cancelled. */}
                          <button
                            type="button"
                            onMouseDown={(e) => {
                              e.preventDefault();
                              onSelectExisting(p);
                            }}
                            className="flex w-full items-center justify-between gap-3 px-3 py-2 text-left transition-colors hover:bg-accent"
                          >
                            <span className="min-w-0">
                              <span className="block truncate text-sm font-medium text-foreground">
                                {p.name}
                              </span>
                              <span className="block truncate text-xs text-muted-foreground">
                                {p.categoryName} · {p.id}
                              </span>
                            </span>
                            <span className="shrink-0 text-xs font-medium text-muted-foreground">
                              {formatCurrency(p.price)} · {p.quantity} in stock
                            </span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </Field>

            <Field
              label="Product ID / SKU"
              htmlFor="id"
              required
              error={errors.id}
              touched={touched.id}
              hint="Auto-generated"
            >
              <div className="flex gap-2">
                <Input
                  id="id"
                  name="id"
                  placeholder="PRD-000000"
                  value={values.id}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  invalid={Boolean(touched.id && errors.id)}
                  className="font-mono"
                />
                {/* Regenerate the SKU. generateSku() returns e.g. "PRD-482910".
                    We also clear the "touched" flag so a stale error doesn't show. */}
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="shrink-0"
                  aria-label="Generate new SKU"
                  onClick={() => {
                    setFieldValue('id', generateSku());
                    setFieldTouched('id', false, false);
                  }}
                >
                  <RefreshCw className="size-4" />
                </Button>
              </div>
            </Field>

            <Field
              label="Category"
              htmlFor="categoryId"
              required
              error={errors.categoryId}
              touched={touched.categoryId}
            >
              <Select
                value={values.categoryId}
                onValueChange={(value) => {
                  setFieldValue('categoryId', value);
                  setFieldTouched('categoryId', true, false);
                }}
              >
                <SelectTrigger
                  id="categoryId"
                  invalid={Boolean(touched.categoryId && errors.categoryId)}
                >
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Price (Rs)" htmlFor="price" required error={errors.price} touched={touched.price}>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={values.price}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  invalid={Boolean(touched.price && errors.price)}
                />
              </Field>

              <Field
                label="Quantity"
                htmlFor="quantity"
                required
                error={errors.quantity}
                touched={touched.quantity}
              >
                <Input
                  id="quantity"
                  name="quantity"
                  type="number"
                  min="0"
                  step="1"
                  placeholder="0"
                  value={values.quantity}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  invalid={Boolean(touched.quantity && errors.quantity)}
                />
              </Field>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
              <Button type="submit">{submitLabel}</Button>
            </div>
          </Form>
        );
      }}
    </Formik>
  );
}
