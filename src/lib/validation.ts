// ============================================================================
// validation.ts - all form validation rules in ONE place (Yup schemas).
// ----------------------------------------------------------------------------
// Yup lets you describe what "valid" data looks like as a schema. Formik runs
// these schemas automatically and puts any failures into its `errors` object,
// which our forms display inline. Keeping the rules here (not in the UI) means
// they are readable, reusable, and easy to change in one spot.
//
// How to read a rule, e.g. Yup.string().required('...').min(3, '...'):
//   - the type comes first (string / number / mixed)
//   - then constraints chain on, each with the message shown when it fails.
// ============================================================================
import * as Yup from 'yup';

// Rules for the Add/Edit Product form.
export const productValidationSchema = Yup.object({
  name: Yup.string()
    .trim() // ignore leading/trailing spaces
    .required('Product name is required')
    .min(3, 'Name must be at least 3 characters')
    .max(80, 'Name must be 80 characters or fewer'),
  id: Yup.string()
    .trim()
    .required('Product ID is required')
    // Only letters, numbers and hyphens are allowed (regex pattern).
    .matches(/^[A-Za-z0-9-]+$/, 'Use letters, numbers and hyphens only')
    .min(3, 'Product ID must be at least 3 characters'),
  categoryId: Yup.string().required('Please select a category'),
  price: Yup.number()
    .typeError('Price must be a number') // shown if the value isn't numeric
    .required('Price is required')
    .positive('Price must be greater than 0') // > 0
    .max(10_000_000, 'Price looks too large'),
  quantity: Yup.number()
    .typeError('Quantity must be a number')
    .required('Quantity is required')
    .integer('Quantity must be a whole number') // no decimals
    .min(0, 'Quantity cannot be negative') // >= 0
    .max(1_000_000, 'Quantity looks too large'),
});

// Rules for the Create/Edit Category form.
export const categoryValidationSchema = Yup.object({
  name: Yup.string()
    .trim()
    .required('Category name is required')
    .min(3, 'Name must be at least 3 characters')
    .max(40, 'Name must be 40 characters or fewer'),
  // description is optional (no .required()), but capped in length.
  description: Yup.string().trim().max(160, 'Description must be 160 characters or fewer'),
});

// Rules for the Stock update form (restock / reduce).
export const stockUpdateValidationSchema = Yup.object({
  // `mixed().oneOf([...])` restricts the value to exactly these two strings.
  action: Yup.mixed<'RESTOCK' | 'SALE'>().oneOf(['RESTOCK', 'SALE']).required(),
  amount: Yup.number()
    .typeError('Amount must be a number')
    .required('Amount is required')
    .integer('Amount must be a whole number')
    .positive('Amount must be greater than 0')
    .max(1_000_000, 'Amount looks too large'),
});
