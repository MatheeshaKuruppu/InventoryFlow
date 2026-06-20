import { useEffect, useMemo, useState } from 'react';
import type { Product, StockStatus } from '@/types';
import { getStockStatus } from '@/types';
import { inventoryValue } from '@/utils/analytics';
import { useDebounce } from '@/hooks/useDebounce';

export type SortKey = 'name' | 'price' | 'quantity' | 'value';
export type SortDir = 'asc' | 'desc';
export type StatusFilter = 'all' | StockStatus;
export type CategoryFilter = 'all' | string;

const PAGE_SIZE = 10;

export interface ProductFiltersState {
  search: string;
  setSearch: (value: string) => void;
  categoryFilter: CategoryFilter;
  setCategoryFilter: (value: CategoryFilter) => void;
  statusFilter: StatusFilter;
  setStatusFilter: (value: StatusFilter) => void;
  sortKey: SortKey;
  sortDir: SortDir;
  toggleSort: (key: SortKey) => void;
  page: number;
  setPage: (page: number) => void;
  pageCount: number;
  pageSize: number;
  /** The fully filtered + sorted list (all pages). */
  filtered: Product[];
  /** Just the current page slice. */
  paged: Product[];
  totalCount: number;
  filteredCount: number;
  hasActiveFilters: boolean;
  resetFilters: () => void;
}

const SORT_ACCESSORS: Record<SortKey, (product: Product) => number | string> = {
  name: (p) => p.name.toLowerCase(),
  price: (p) => p.price,
  quantity: (p) => p.quantity,
  value: (p) => inventoryValue(p),
};

export function useProductFilters(products: Product[]): ProductFiltersState {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [sortKey, setSortKey] = useState<SortKey>('name');
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const [page, setPage] = useState(1);

  const debouncedSearch = useDebounce(search, 250);

  const filtered = useMemo(() => {
    const query = debouncedSearch.trim().toLowerCase();

    const result = products.filter((product) => {
      const matchesQuery =
        query === '' ||
        product.name.toLowerCase().includes(query) ||
        product.id.toLowerCase().includes(query);
      const matchesCategory = categoryFilter === 'all' || product.categoryId === categoryFilter;
      const matchesStatus =
        statusFilter === 'all' || getStockStatus(product.quantity) === statusFilter;
      return matchesQuery && matchesCategory && matchesStatus;
    });

    const accessor = SORT_ACCESSORS[sortKey];
    const direction = sortDir === 'asc' ? 1 : -1;
    return result.sort((a, b) => {
      const av = accessor(a);
      const bv = accessor(b);
      if (av < bv) return -1 * direction;
      if (av > bv) return 1 * direction;
      return 0;
    });
  }, [products, debouncedSearch, categoryFilter, statusFilter, sortKey, sortDir]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));

  // Keep the current page in range as filters change.
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, categoryFilter, statusFilter, sortKey, sortDir]);

  useEffect(() => {
    if (page > pageCount) setPage(pageCount);
  }, [page, pageCount]);

  const paged = useMemo(
    () => filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [filtered, page],
  );

  const toggleSort = (key: SortKey) => {
    if (key === sortKey) {
      setSortDir((dir) => (dir === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir(key === 'name' ? 'asc' : 'desc');
    }
  };

  const hasActiveFilters =
    search.trim() !== '' || categoryFilter !== 'all' || statusFilter !== 'all';

  const resetFilters = () => {
    setSearch('');
    setCategoryFilter('all');
    setStatusFilter('all');
  };

  return {
    search,
    setSearch,
    categoryFilter,
    setCategoryFilter,
    statusFilter,
    setStatusFilter,
    sortKey,
    sortDir,
    toggleSort,
    page,
    setPage,
    pageCount,
    pageSize: PAGE_SIZE,
    filtered,
    paged,
    totalCount: products.length,
    filteredCount: filtered.length,
    hasActiveFilters,
    resetFilters,
  };
}
