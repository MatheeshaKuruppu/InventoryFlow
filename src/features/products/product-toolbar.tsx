import { ArrowUpDown, Search, SlidersHorizontal, X } from 'lucide-react';
import type { Category } from '@/types';
import { STOCK_STATUS_LABEL } from '@/types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { ProductFiltersState, SortKey } from './useProductFilters';
import { cn } from '@/lib/utils';

const SORT_OPTIONS: Array<{ key: SortKey; label: string }> = [
  { key: 'name', label: 'Name' },
  { key: 'price', label: 'Price' },
  { key: 'quantity', label: 'Quantity' },
  { key: 'value', label: 'Inventory Value' },
];

interface ProductToolbarProps {
  filters: ProductFiltersState;
  categories: Category[];
}

export function ProductToolbar({ filters, categories }: ProductToolbarProps) {
  const activeSort = SORT_OPTIONS.find((option) => option.key === filters.sortKey);

  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
      {/* Search */}
      <div className="relative flex-1 lg:max-w-sm">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search by name or product ID…"
          value={filters.search}
          onChange={(event) => filters.setSearch(event.target.value)}
          className="pl-9 pr-9"
          aria-label="Search products"
        />
        {filters.search && (
          <button
            type="button"
            onClick={() => filters.setSearch('')}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md p-0.5 text-muted-foreground hover:text-foreground"
            aria-label="Clear search"
          >
            <X className="size-4" />
          </button>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {/* Category filter */}
        <Select
          value={filters.categoryFilter}
          onValueChange={(value) => filters.setCategoryFilter(value)}
        >
          <SelectTrigger className="w-full min-w-[150px] sm:w-auto">
            <SlidersHorizontal className="size-4 text-muted-foreground" />
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Status filter */}
        <Select
          value={filters.statusFilter}
          onValueChange={(value) => filters.setStatusFilter(value as ProductFiltersState['statusFilter'])}
        >
          <SelectTrigger className="w-full min-w-[140px] sm:w-auto">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="in-stock">{STOCK_STATUS_LABEL['in-stock']}</SelectItem>
            <SelectItem value="low-stock">{STOCK_STATUS_LABEL['low-stock']}</SelectItem>
            <SelectItem value="out-of-stock">{STOCK_STATUS_LABEL['out-of-stock']}</SelectItem>
          </SelectContent>
        </Select>

        {/* Sort */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="gap-2">
              <ArrowUpDown className="size-4" />
              <span className="hidden sm:inline">
                {activeSort?.label} · {filters.sortDir === 'asc' ? 'Asc' : 'Desc'}
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>Sort by</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {SORT_OPTIONS.map((option) => (
              <DropdownMenuItem
                key={option.key}
                onClick={() => filters.toggleSort(option.key)}
                className={cn('justify-between', option.key === filters.sortKey && 'text-primary')}
              >
                {option.label}
                {option.key === filters.sortKey && (
                  <span className="text-xs">{filters.sortDir === 'asc' ? '↑' : '↓'}</span>
                )}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {filters.hasActiveFilters && (
          <Button variant="ghost" onClick={filters.resetFilters} className="gap-1.5 text-muted-foreground">
            <X className="size-4" />
            Clear
          </Button>
        )}
      </div>
    </div>
  );
}
