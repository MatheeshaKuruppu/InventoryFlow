import { Formik, Form, type FormikHelpers } from 'formik';
import { RefreshCw } from 'lucide-react';
import type { Category } from '@/types';
import { productValidationSchema } from '@/lib/validation';
import { generateSku } from '@/utils/id';
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
  initialValues: ProductFormValues;
  /** Existing product IDs used to enforce uniqueness (excludes the one being edited). */
  reservedIds: string[];
  submitLabel: string;
  onSubmit: (values: ProductFormValues) => void;
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
  initialValues,
  reservedIds,
  submitLabel,
  onSubmit,
  onCancel,
}: ProductFormProps) {
  const handleSubmit = (
    values: ProductFormValues,
    helpers: FormikHelpers<ProductFormValues>,
  ) => {
    const normalizedId = values.id.trim();
    if (reservedIds.includes(normalizedId)) {
      helpers.setFieldError('id', 'This Product ID is already in use');
      helpers.setSubmitting(false);
      return;
    }
    onSubmit(values);
  };

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={productValidationSchema}
      onSubmit={handleSubmit}
      validateOnBlur
    >
      {({ values, errors, touched, handleChange, handleBlur, setFieldValue, setFieldTouched }) => (
        <Form className="space-y-4">
          <Field label="Product Name" htmlFor="name" required error={errors.name} touched={touched.name}>
            <Input
              id="name"
              name="name"
              placeholder="e.g. Aurora Wireless Headphones"
              value={values.name}
              onChange={handleChange}
              onBlur={handleBlur}
              invalid={Boolean(touched.name && errors.name)}
              autoFocus
            />
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
      )}
    </Formik>
  );
}
