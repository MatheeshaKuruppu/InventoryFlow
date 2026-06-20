import { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import { TooltipProvider } from '@/components/ui/tooltip';
import { ThemeProvider } from '@/components/providers/theme-provider';
import { Toaster } from '@/components/ui/toaster';
import { useInventoryStore } from '@/store/inventoryStore';
import { router } from '@/routes/router';

export function App() {
  const initialize = useInventoryStore((s) => s.initialize);

  // Hydrate persisted data (and seed demo data on first launch) once.
  useEffect(() => {
    initialize();
  }, [initialize]);

  return (
    <ThemeProvider>
      <TooltipProvider delayDuration={200}>
        <RouterProvider router={router} />
        <Toaster />
      </TooltipProvider>
    </ThemeProvider>
  );
}
