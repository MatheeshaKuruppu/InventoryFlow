import { motion } from 'framer-motion';
import { ArrowDownRight, ArrowUpRight, type LucideIcon } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { useCountUp } from '@/hooks/useCountUp';
import { formatCurrency, formatNumber } from '@/utils/format';
import { cn } from '@/lib/utils';

export interface KpiCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  format?: 'number' | 'currency';
  /** Optional period-over-period trend, e.g. 12.4 for +12.4%. */
  trend?: number;
  accent?: 'primary' | 'emerald' | 'amber' | 'violet';
  index?: number;
}

const ACCENTS: Record<NonNullable<KpiCardProps['accent']>, string> = {
  primary: 'from-primary/15 to-primary/5 text-primary',
  emerald: 'from-emerald-500/15 to-emerald-500/5 text-emerald-500',
  amber: 'from-amber-500/15 to-amber-500/5 text-amber-500',
  violet: 'from-violet-500/15 to-violet-500/5 text-violet-500',
};

export function KpiCard({
  title,
  value,
  icon: Icon,
  format = 'number',
  trend,
  accent = 'primary',
  index = 0,
}: KpiCardProps) {
  const animated = useCountUp(value, { decimals: format === 'currency' ? 2 : 0 });
  const display = format === 'currency' ? formatCurrency(animated) : formatNumber(animated);
  const trendUp = (trend ?? 0) >= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.06, ease: [0.16, 1, 0.3, 1] }}
    >
      <Card className="relative overflow-hidden p-5">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold tracking-tight tabular-nums text-foreground">
              {display}
            </p>
          </div>
          <div
            className={cn(
              'flex size-11 items-center justify-center rounded-xl bg-gradient-to-br',
              ACCENTS[accent],
            )}
          >
            <Icon className="size-5" />
          </div>
        </div>

        {trend !== undefined && (
          <div className="mt-4 flex items-center gap-1.5 text-xs">
            <span
              className={cn(
                'inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 font-semibold',
                trendUp ? 'bg-success/12 text-success' : 'bg-destructive/12 text-destructive',
              )}
            >
              {trendUp ? <ArrowUpRight className="size-3" /> : <ArrowDownRight className="size-3" />}
              {Math.abs(trend)}%
            </span>
            <span className="text-muted-foreground">vs. last month</span>
          </div>
        )}
      </Card>
    </motion.div>
  );
}
