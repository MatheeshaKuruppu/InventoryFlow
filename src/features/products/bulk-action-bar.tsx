import { AnimatePresence, motion } from 'framer-motion';
import { PackagePlus, Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BulkActionBarProps {
  count: number;
  onClear: () => void;
  onRestock: () => void;
  onDelete: () => void;
}

/** Floating action bar that appears when one or more products are selected. */
export function BulkActionBar({ count, onClear, onRestock, onDelete }: BulkActionBarProps) {
  return (
    <AnimatePresence>
      {count > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 24, x: '-50%' }}
          animate={{ opacity: 1, y: 0, x: '-50%' }}
          exit={{ opacity: 0, y: 24, x: '-50%' }}
          transition={{ type: 'spring', stiffness: 380, damping: 30 }}
          className="fixed bottom-6 left-1/2 z-40 flex items-center gap-2 rounded-full border border-border bg-popover/95 p-1.5 pl-4 shadow-xl backdrop-blur"
        >
          <span className="text-sm font-medium text-foreground">
            {count} selected
          </span>
          <span className="mx-1 h-5 w-px bg-border" />
          <Button variant="ghost" size="sm" className="gap-1.5" onClick={onRestock}>
            <PackagePlus className="size-4" />
            Restock
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="gap-1.5 text-destructive hover:bg-destructive/10 hover:text-destructive"
            onClick={onDelete}
          >
            <Trash2 className="size-4" />
            Delete
          </Button>
          <Button variant="ghost" size="icon" className="size-8 rounded-full" onClick={onClear} aria-label="Clear selection">
            <X className="size-4" />
          </Button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
