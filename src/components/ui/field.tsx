import { AnimatePresence, motion } from 'framer-motion';
import { Label } from './label';
import { cn } from '@/lib/utils';

interface FieldProps {
  label: string;
  htmlFor: string;
  error?: string;
  touched?: boolean;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
  className?: string;
}

/**
 * Form field wrapper providing a label, optional hint and an animated
 * inline error message — the standard layout for all Formik fields.
 */
export function Field({
  label,
  htmlFor,
  error,
  touched,
  required,
  hint,
  children,
  className,
}: FieldProps) {
  const showError = Boolean(touched && error);
  return (
    <div className={cn('space-y-1.5', className)}>
      <div className="flex items-center justify-between">
        <Label htmlFor={htmlFor}>
          {label}
          {required && <span className="ml-0.5 text-destructive">*</span>}
        </Label>
        {hint && !showError && <span className="text-xs text-muted-foreground">{hint}</span>}
      </div>
      {children}
      <AnimatePresence initial={false}>
        {showError && (
          <motion.p
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.15 }}
            className="text-xs font-medium text-destructive"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
