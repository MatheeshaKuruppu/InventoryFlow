import {
  FolderPlus,
  PackagePlus,
  PencilLine,
  RefreshCcw,
  Trash2,
  History,
  type LucideIcon,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import type { Activity, ActivityType } from '@/types';
import { formatRelativeTime } from '@/utils/format';
import { cn } from '@/lib/utils';

const ICONS: Record<ActivityType, LucideIcon> = {
  PRODUCT_CREATED: PackagePlus,
  PRODUCT_UPDATED: PencilLine,
  PRODUCT_DELETED: Trash2,
  STOCK_UPDATED: RefreshCcw,
  CATEGORY_CREATED: FolderPlus,
  CATEGORY_UPDATED: PencilLine,
  CATEGORY_DELETED: Trash2,
};

const TONE: Record<ActivityType, string> = {
  PRODUCT_CREATED: 'bg-success/12 text-success',
  PRODUCT_UPDATED: 'bg-primary/12 text-primary',
  PRODUCT_DELETED: 'bg-destructive/12 text-destructive',
  STOCK_UPDATED: 'bg-violet-500/12 text-violet-500',
  CATEGORY_CREATED: 'bg-success/12 text-success',
  CATEGORY_UPDATED: 'bg-primary/12 text-primary',
  CATEGORY_DELETED: 'bg-destructive/12 text-destructive',
};

export function RecentActivity({ activity }: { activity: Activity[] }) {
  return (
    <Card className="flex h-full flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <History className="size-4 text-muted-foreground" />
          Recent Activity
        </CardTitle>
        <CardDescription>Latest changes across your inventory</CardDescription>
      </CardHeader>
      <CardContent className="flex-1">
        {activity.length === 0 ? (
          <EmptyState
            icon={History}
            title="No activity yet"
            description="Your recent product and stock changes will appear here."
            className="border-0 bg-transparent py-10"
          />
        ) : (
          <ol className="relative space-y-1">
            {activity.slice(0, 7).map((entry) => {
              const Icon = ICONS[entry.type];
              return (
                <li
                  key={entry.id}
                  className="flex items-start gap-3 rounded-lg px-1 py-2 transition-colors hover:bg-muted/40"
                >
                  <span
                    className={cn(
                      'mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full',
                      TONE[entry.type],
                    )}
                  >
                    <Icon className="size-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-foreground">
                      {entry.message}
                      {entry.detail && (
                        <span className="ml-1 font-medium text-muted-foreground">· {entry.detail}</span>
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground">{formatRelativeTime(entry.timestamp)}</p>
                  </div>
                </li>
              );
            })}
          </ol>
        )}
      </CardContent>
    </Card>
  );
}
