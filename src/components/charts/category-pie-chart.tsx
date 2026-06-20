import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { ChartEmpty } from './chart-card';
import { ChartTooltip } from './chart-tooltip';
import { CHART_PALETTE } from './chart-theme';
import type { NamedValue } from '@/utils/analytics';
import { formatNumber } from '@/utils/format';

/** Category distribution by product count. */
export function CategoryPieChart({ data }: { data: NamedValue[] }) {
  if (data.length === 0) return <ChartEmpty message="Add products to see category distribution." />;

  return (
    <ResponsiveContainer width="100%" height={280}>
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          innerRadius={0}
          outerRadius={92}
          paddingAngle={2}
          stroke="hsl(var(--card))"
          strokeWidth={2}
        >
          {data.map((_, index) => (
            <Cell key={index} fill={CHART_PALETTE[index % CHART_PALETTE.length]} />
          ))}
        </Pie>
        <Tooltip
          content={<ChartTooltip valueFormatter={(v) => `${formatNumber(v)} products`} />}
          cursor={false}
        />
        <Legend
          verticalAlign="bottom"
          iconType="circle"
          iconSize={8}
          formatter={(value) => <span className="text-xs text-muted-foreground">{value}</span>}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
