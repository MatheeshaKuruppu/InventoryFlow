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

// Custom hook: owns ALL the products-table controls (search, filters, sort,
// pagination) in one place. A page component calls it and gets back both the
// current values and the setters to change them. Keeping this logic in a hook
// keeps the page component small and makes the behavior easy to reason about.
export function useProductFilters(products: Product[]): ProductFiltersState {
  // Each piece of UI control is a piece of React state.
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [sortKey, setSortKey] = useState<SortKey>('name');
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const [page, setPage] = useState(1);

  // Debounce the search so we don't re-filter on every keystroke (waits 250ms
  // after the user stops typing). See src/hooks/useDebounce.ts.
  const debouncedSearch = useDebounce(search, 250);

  // Derive the filtered + sorted list. useMemo caches the result and only
  // recomputes when one of the dependencies below changes - not on every render.
  const filtered = useMemo(() => {
    const query = debouncedSearch.trim().toLowerCase();

    // 1) FILTER: keep products that match the search AND category AND status.
    const result = products.filter((product) => {
      const matchesQuery =
        query === '' ||
        product.name.toLowerCase().includes(query) ||
        product.id.toLowerCase().includes(query); // search by name OR id
      const matchesCategory = categoryFilter === 'all' || product.categoryId === categoryFilter;
      const matchesStatus =
        statusFilter === 'all' || getStockStatus(product.quantity) === statusFilter;
      return matchesQuery && matchesCategory && matchesStatus;
    });

    // 2) SORT: pick the value to sort by, then compare. direction flips asc/desc.
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

  // How many pages given 10 items per page (at least 1).
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));

  // When any filter/sort changes, jump back to page 1 (results changed).
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, categoryFilter, statusFilter, sortKey, sortDir]);

  // If the list shrank below the current page, clamp the page into range.
  useEffect(() => {
    if (page > pageCount) setPage(pageCount);
  }, [page, pageCount]);

  // The current page's slice of the filtered list (what the table renders).
  const paged = useMemo(
    () => filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [filtered, page],
  );

  // Clicking a column header: same column -> flip direction; new column -> select it.
  const toggleSort = (key: SortKey) => {
    if (key === sortKey) {
      setSortDir((dir) => (dir === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir(key === 'name' ? 'asc' : 'desc'); // names default A-Z, numbers high-first
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
