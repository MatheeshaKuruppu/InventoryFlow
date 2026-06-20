import { Skeleton } from '@/components/ui/skeleton';

export function ProductTableSkeleton({ rows = 8 }: { rows?: number }) {
  return (
    <div className="divide-y divide-border">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 px-4 py-3.5">
          <Skeleton className="size-4 rounded" />
          <Skeleton className="size-9 rounded-lg" />
          <div className="flex-1 space-y-1.5">
            <Skeleton className="h-3.5 w-40" />
            <Skeleton className="h-3 w-24" />
          </div>
          <Skeleton className="hidden h-3.5 w-20 md:block" />
          <Skeleton className="h-3.5 w-16" />
          <Skeleton className="h-5 w-20 rounded-full" />
          <Skeleton className="size-8 rounded-md" />
        </div>
      ))}
    </div>
  );
}
