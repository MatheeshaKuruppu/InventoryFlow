import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { ChartEmpty } from './chart-card';
import { ChartTooltip } from './chart-tooltip';
import { STATUS_COLORS } from './chart-theme';
import type { StockStatusBucket } from '@/utils/analytics';
import { formatNumber } from '@/utils/format';

/** Stock status overview rendered as a donut with a centered total. */
export function StockDonutChart({ data }: { data: StockStatusBucket[] }) {
  const total = data.reduce((sum, entry) => sum + entry.value, 0);
  if (total === 0) return <ChartEmpty message="Add products to see stock status." />;

  return (
    <div className="relative">
      <ResponsiveContainer width="100%" height={280}>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius={68}
            outerRadius={94}
            paddingAngle={3}
            stroke="hsl(var(--card))"
            strokeWidth={2}
          >
            {data.map((entry) => (
              <Cell key={entry.key} fill={STATUS_COLORS[entry.key]} />
            ))}
          </Pie>
          <Tooltip
            content={<ChartTooltip valueFormatter={(v) => `${formatNumber(v)} products`} />}
            cursor={false}
          />
        </PieChart>
      </ResponsiveContainer>

      {/* Centered total overlay */}
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold tracking-tight text-foreground">{formatNumber(total)}</span>
        <span className="text-xs text-muted-foreground">Total Products</span>
      </div>

      <div className="mt-2 flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
        {data.map((entry) => (
          <div key={entry.key} className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-full" style={{ backgroundColor: STATUS_COLORS[entry.key] }} />
            <span className="text-xs text-muted-foreground">
              {entry.name} <span className="font-semibold text-foreground">{entry.value}</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
