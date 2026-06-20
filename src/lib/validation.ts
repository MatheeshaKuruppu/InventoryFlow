import * as Yup from 'yup';

/** Yup schemas shared by the Formik forms. Single source of truth for rules. */

export const productValidationSchema = Yup.object({
  name: Yup.string()
    .trim()
    .required('Product name is required')
    .min(3, 'Name must be at least 3 characters')
    .max(80, 'Name must be 80 characters or fewer'),
  id: Yup.string()
    .trim()
    .required('Product ID is required')
    .matches(/^[A-Za-z0-9-]+$/, 'Use letters, numbers and hyphens only')
    .min(3, 'Product ID must be at least 3 characters'),
  categoryId: Yup.string().required('Please select a category'),
  price: Yup.number()
    .typeError('Price must be a number')
    .required('Price is required')
    .positive('Price must be greater than 0')
    .max(10_000_000, 'Price looks too large'),
  quantity: Yup.number()
    .typeError('Quantity must be a number')
    .required('Quantity is required')
    .integer('Quantity must be a whole number')
    .min(0, 'Quantity cannot be negative')
    .max(1_000_000, 'Quantity looks too large'),
});

export const categoryValidationSchema = Yup.object({
  name: Yup.string()
    .trim()
    .required('Category name is required')
    .min(3, 'Name must be at least 3 characters')
    .max(40, 'Name must be 40 characters or fewer'),
  description: Yup.string().trim().max(160, 'Description must be 160 characters or fewer'),
});

export const stockUpdateValidationSchema = Yup.object({
  action: Yup.mixed<'RESTOCK' | 'SALE'>().oneOf(['RESTOCK', 'SALE']).required(),
  amount: Yup.number()
    .typeError('Amount must be a number')
    .required('Amount is required')
    .integer('Amount must be a whole number')
    .positive('Amount must be greater than 0')
    .max(1_000_000, 'Amount looks too large'),
});
