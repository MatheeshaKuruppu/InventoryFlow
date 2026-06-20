import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { ChartEmpty } from './chart-card';
import { ChartTooltip } from './chart-tooltip';
import { CHART_PALETTE, useChartColors } from './chart-theme';
import type { NamedValue } from '@/utils/analytics';
import { formatCompactCurrency, formatCurrency } from '@/utils/format';

/** Inventory value per category. */
export function ValueBarChart({ data }: { data: NamedValue[] }) {
  const colors = useChartColors();
  if (data.length === 0) return <ChartEmpty message="Add products to see inventory value." />;

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} vertical={false} />
        <XAxis
          dataKey="name"
          tick={{ fill: colors.axis, fontSize: 11 }}
          tickLine={false}
          axisLine={{ stroke: colors.grid }}
          interval={0}
          tickFormatter={(value: string) => (value.length > 10 ? `${value.slice(0, 9)}…` : value)}
        />
        <YAxis
          tick={{ fill: colors.axis, fontSize: 11 }}
          tickLine={false}
          axisLine={false}
          width={56}
          tickFormatter={(value: number) => formatCompactCurrency(value)}
        />
        <Tooltip
          content={<ChartTooltip valueFormatter={formatCurrency} />}
          cursor={{ fill: colors.grid, opacity: 0.4 }}
        />
        <Bar dataKey="value" name="Value" radius={[6, 6, 0, 0]} maxBarSize={48}>
          {data.map((_, index) => (
            <Cell key={index} fill={CHART_PALETTE[index % CHART_PALETTE.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
