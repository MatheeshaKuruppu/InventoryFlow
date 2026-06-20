import type { TooltipProps } from 'recharts';
import { cn } from '@/lib/utils';

interface ChartTooltipProps extends TooltipProps<number, string> {
  /** Optional formatter for the numeric value (e.g. currency). */
  valueFormatter?: (value: number) => string;
  labelSuffix?: string;
}

/** Shared, theme-aware tooltip card for all Recharts visualizations. */
export function ChartTooltip({
  active,
  payload,
  label,
  valueFormatter = (v) => String(v),
  labelSuffix,
}: ChartTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;

  return (
    <div className="rounded-lg border border-border bg-popover px-3 py-2 shadow-lg">
      {label != null && (
        <p className="mb-1 text-xs font-semibold text-foreground">{String(label)}</p>
      )}
      <div className="space-y-1">
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center gap-2 text-xs">
            <span
              className={cn('size-2 rounded-full')}
              style={{ backgroundColor: entry.color ?? entry.payload?.fill }}
            />
            <span className="text-muted-foreground">{entry.name ?? 'Value'}</span>
            <span className="ml-auto font-semibold text-foreground">
              {valueFormatter(Number(entry.value))}
              {labelSuffix}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
