import { useEffect, useState } from 'react';
import { useTheme } from '@/components/providers/theme-provider';

/** Categorical palette used across pie/bar charts — readable in both themes. */
export const CHART_PALETTE = [
  '#6366f1', // indigo
  '#8b5cf6', // violet
  '#06b6d4', // cyan
  '#10b981', // emerald
  '#f59e0b', // amber
  '#ec4899', // pink
  '#3b82f6', // blue
  '#14b8a6', // teal
];

/** Semantic colors for stock-status visualizations. */
export const STATUS_COLORS = {
  'in-stock': '#10b981',
  'low-stock': '#f59e0b',
  'out-of-stock': '#ef4444',
} as const;

export interface ChartColors {
  grid: string;
  axis: string;
  tooltipBg: string;
  tooltipBorder: string;
}

/**
 * Resolves theme-dependent chart chrome colors from the live CSS variables.
 * Recharts applies these as SVG attributes, so concrete values are required.
 */
export function useChartColors(): ChartColors {
  const { resolvedTheme } = useTheme();
  const [colors, setColors] = useState<ChartColors>(() => resolve());

  useEffect(() => {
    setColors(resolve());
  }, [resolvedTheme]);

  return colors;
}

function resolve(): ChartColors {
  if (typeof window === 'undefined') {
    return { grid: '#e5e7eb', axis: '#6b7280', tooltipBg: '#ffffff', tooltipBorder: '#e5e7eb' };
  }
  const styles = getComputedStyle(document.documentElement);
  const read = (token: string) => `hsl(${styles.getPropertyValue(token).trim()})`;
  return {
    grid: read('--border'),
    axis: read('--muted-foreground'),
    tooltipBg: read('--popover'),
    tooltipBorder: read('--border'),
  };
}
