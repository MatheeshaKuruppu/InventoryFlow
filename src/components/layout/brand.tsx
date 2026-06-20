import { cn } from '@/lib/utils';

/** The InventoryFlow wordmark + gem logo. */
export function Brand({ className, collapsed }: { className?: string; collapsed?: boolean }) {
  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      <div className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-violet-500 shadow-sm shadow-primary/30">
        <svg viewBox="0 0 32 32" className="size-5 text-white" aria-hidden>
          <path
            d="M9 11.5 16 8l7 3.5v9L16 24l-7-3.5v-9Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
          <path
            d="M9 11.5 16 15l7-3.5M16 15v9"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      {!collapsed && (
        <div className="flex flex-col leading-none">
          <span className="text-[15px] font-bold tracking-tight text-foreground">InventoryFlow</span>
          <span className="text-[11px] font-medium text-muted-foreground">Inventory Suite</span>
        </div>
      )}
    </div>
  );
}
