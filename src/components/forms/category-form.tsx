import { Formik, Form } from 'formik';
import { categoryValidationSchema } from '@/lib/validation';
import { Field } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

export interface CategoryFormValues {
  name: string;
  description: string;
}

interface CategoryFormProps {
  initialValues: CategoryFormValues;
  submitLabel: string;
  onSubmit: (values: CategoryFormValues) => void;
  onCancel: () => void;
}

export const emptyCategoryValues = (): CategoryFormValues => ({ name: '', description: '' });

export function CategoryForm({ initialValues, submitLabel, onSubmit, onCancel }: CategoryFormProps) {
  return (
    <Formik
      initialValues={initialValues}
      validationSchema={categoryValidationSchema}
      onSubmit={(values) => onSubmit(values)}
    >
      {({ values, errors, touched, handleChange, handleBlur }) => (
        <Form className="space-y-4">
          <Field label="Category Name" htmlFor="name" required error={errors.name} touched={touched.name}>
            <Input
              id="name"
              name="name"
              placeholder="e.g. Electronics"
              value={values.name}
              onChange={handleChange}
              onBlur={handleBlur}
              invalid={Boolean(touched.name && errors.name)}
              autoFocus
            />
          </Field>

          <Field
            label="Description"
            htmlFor="description"
            error={errors.description}
            touched={touched.description}
            hint={`${values.description.length}/160`}
          >
            <Textarea
              id="description"
              name="description"
              placeholder="What kind of products belong here?"
              value={values.description}
              onChange={handleChange}
              onBlur={handleBlur}
              invalid={Boolean(touched.description && errors.description)}
              rows={3}
            />
          </Field>

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
