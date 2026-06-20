import type { LucideIcon } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface ChartCardProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  action?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}

/** Card chrome shared by every dashboard chart. */
export function ChartCard({
  title,
  description,
  icon: Icon,
  action,
  className,
  children,
}: ChartCardProps) {
  return (
    <Card className={cn('flex flex-col', className)}>
      <CardHeader className="flex-row items-start justify-between gap-4 space-y-0 pb-2">
        <div className="space-y-1">
          <CardTitle className="flex items-center gap-2 text-base">
            {Icon && <Icon className="size-4 text-muted-foreground" />}
            {title}
          </CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </div>
        {action}
      </CardHeader>
      <CardContent className="flex-1 pt-2">{children}</CardContent>
    </Card>
  );
}

export function ChartEmpty({ message = 'No data to display yet.' }: { message?: string }) {
  return (
    <div className="flex h-full min-h-[240px] flex-col items-center justify-center text-center">
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );
}
