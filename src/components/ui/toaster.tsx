import { Toaster as SonnerToaster } from 'sonner';
import { useTheme } from '@/components/providers/theme-provider';

/** Theme-aware toast host. Mount once near the app root. */
export function Toaster() {
  const { resolvedTheme } = useTheme();
  return (
    <SonnerToaster
      theme={resolvedTheme}
      position="top-center"
      richColors
      closeButton
      toastOptions={{
        classNames: {
          toast: 'rounded-xl border border-border shadow-lg',
        },
      }}
    />
  );
}
