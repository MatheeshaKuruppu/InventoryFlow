import { useState } from 'react';
import { toast } from 'sonner';
import { Check, Database, Download, Moon, Sun, Trash2, Palette } from 'lucide-react';

import { useInventoryStore } from '@/store/inventoryStore';
import { useTheme, type Theme } from '@/components/providers/theme-provider';
import { exportProductsToCsv } from '@/utils/csv';
import { formatNumber } from '@/utils/format';

import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { cn } from '@/lib/utils';

const THEME_OPTIONS: Array<{ value: Theme; label: string; icon: typeof Sun }> = [
  { value: 'light', label: 'Light', icon: Sun },
  { value: 'dark', label: 'Dark', icon: Moon },
];

export function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const products = useInventoryStore((s) => s.products);
  const categories = useInventoryStore((s) => s.categories);
  const stockHistory = useInventoryStore((s) => s.stockHistory);
  const clearAllData = useInventoryStore((s) => s.clearAllData);

  const [clearOpen, setClearOpen] = useState(false);

  const handleExport = () => {
    if (products.length === 0) {
      toast.error('Nothing to export', { description: 'Add some products first.' });
      return;
    }
    exportProductsToCsv(products);
    toast.success('Export ready', {
      description: `${formatNumber(products.length)} products exported to CSV.`,
    });
  };

  const handleClear = () => {
    clearAllData();
    toast.success('All data cleared', { description: 'Your inventory has been reset.' });
  };

  const dataStats = [
    { label: 'Products', value: products.length },
    { label: 'Categories', value: categories.length },
    { label: 'Stock movements', value: stockHistory.length },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Settings" description="Manage appearance and your local data." />

      <div className="mx-auto w-full max-w-3xl space-y-6">
        {/* Appearance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Palette className="size-4 text-muted-foreground" />
              Appearance
            </CardTitle>
            <CardDescription>Choose how InventoryFlow looks. Saved to your browser.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 sm:max-w-md">
              {THEME_OPTIONS.map((option) => {
                const active = theme === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setTheme(option.value)}
                    className={cn(
                      'group relative flex flex-col items-start gap-3 rounded-xl border-2 p-4 text-left transition-colors',
                      active ? 'border-primary' : 'border-border hover:border-muted-foreground/40',
                    )}
                    aria-pressed={active}
                  >
                    {/* Mini preview */}
                    <div
                      className={cn(
                        'flex h-16 w-full items-center gap-2 overflow-hidden rounded-lg border p-2',
                        option.value === 'dark'
                          ? 'border-slate-700 bg-slate-900'
                          : 'border-slate-200 bg-white',
                      )}
                    >
                      <div
                        className={cn(
                          'h-full w-8 rounded',
                          option.value === 'dark' ? 'bg-slate-700' : 'bg-slate-100',
                        )}
                      />
                      <div className="flex-1 space-y-1.5">
                        <div className="h-2 w-3/4 rounded bg-primary/70" />
                        <div className={cn('h-2 w-full rounded', option.value === 'dark' ? 'bg-slate-700' : 'bg-slate-200')} />
                        <div className={cn('h-2 w-1/2 rounded', option.value === 'dark' ? 'bg-slate-700' : 'bg-slate-200')} />
                      </div>
                    </div>
                    <div className="flex w-full items-center justify-between">
                      <span className="flex items-center gap-2 text-sm font-medium text-foreground">
                        <option.icon className="size-4" />
                        {option.label}
                      </span>
                      {active && (
                        <span className="flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                          <Check className="size-3" strokeWidth={3} />
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Data management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Database className="size-4 text-muted-foreground" />
              Data Management
            </CardTitle>
            <CardDescription>Export your inventory or reset everything stored locally.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* Stats */}
            <div className="grid grid-cols-3 gap-3">
              {dataStats.map((stat) => (
                <div key={stat.label} className="rounded-lg border border-border bg-muted/30 p-3 text-center">
                  <p className="text-2xl font-bold tabular-nums text-foreground">
                    {formatNumber(stat.value)}
                  </p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </div>

            <Separator />

            {/* Export */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">Export inventory</p>
                <p className="text-sm text-muted-foreground">Download all products as a CSV file.</p>
              </div>
              <Button variant="outline" onClick={handleExport} className="gap-2">
                <Download className="size-4" />
                Export CSV
              </Button>
            </div>

            <Separator />

            {/* Danger zone */}
            <div className="flex flex-col gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-medium text-destructive">Clear all data</p>
                <p className="text-sm text-muted-foreground">
                  Permanently delete all products, categories and history.
                </p>
              </div>
              <Button variant="destructive" onClick={() => setClearOpen(true)} className="gap-2">
                <Trash2 className="size-4" />
                Clear data
              </Button>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground">
          InventoryFlow · Frontend demo · All data is stored locally via your browser's localStorage.
        </p>
      </div>

      <ConfirmDialog
        open={clearOpen}
        onOpenChange={setClearOpen}
        title="Clear all data?"
        description={
          <>
            This permanently deletes <span className="font-medium text-foreground">all products,
            categories and stock history</span>. This action cannot be undone.
          </>
        }
        confirmLabel="Yes, clear everything"
        onConfirm={handleClear}
      />
    </div>
  );
}
