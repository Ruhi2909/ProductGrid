import type { ChangeEvent } from 'react';
import type { Category, SortConfig } from '../types';

interface FilterBarProps {
  categories: Category[];
  loadingCategories: boolean;
  category: string;
  sort: SortConfig;
  onCategoryChange: (slug: string) => void;
  onSortChange: (sort: SortConfig) => void;
}

const SORT_COLUMNS = [
  { value: 'title', label: 'Title' },
  { value: 'price', label: 'Price' },
  { value: 'rating', label: 'Rating' },
  { value: 'stock', label: 'Stock' },
] as const;

export function FilterBar({
  categories,
  loadingCategories,
  category,
  sort,
  onCategoryChange,
  onSortChange,
}: FilterBarProps) {
  function handleSortByChange(e: ChangeEvent<HTMLSelectElement>) {
    onSortChange({ ...sort, sortBy: e.target.value as SortConfig['sortBy'] });
  }

  function handleOrderToggle() {
    onSortChange({ ...sort, order: sort.order === 'asc' ? 'desc' : 'asc' });
  }

  function handleCategoryChange(e: ChangeEvent<HTMLSelectElement>) {
    onCategoryChange(e.target.value);
  }

  return (
    <div className="flex flex-wrap items-center gap-3 pb-3" role="toolbar" aria-label="Grid filters">
      {/* Category Filter */}
      <div className="flex items-center gap-2">
        <label htmlFor="category-select" className="text-xs font-medium text-slate-400 whitespace-nowrap">
          Category
        </label>
        <select
          id="category-select"
          className="h-8 pl-2.5 pr-8 bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-md focus:border-blue-500 focus:outline-none disabled:opacity-50 cursor-pointer"
          value={category}
          onChange={handleCategoryChange}
          disabled={loadingCategories}
        >
          <option value="">All categories</option>
          {categories.map(cat => (
            <option key={cat.slug} value={cat.slug}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      <div className="w-px h-5 bg-slate-800 hidden sm:block" />

      {/* Sort Column */}
      <div className="flex items-center gap-2">
        <label htmlFor="sort-by-select" className="text-xs font-medium text-slate-400 whitespace-nowrap">
          Sort by
        </label>
        <select
          id="sort-by-select"
          className="h-8 pl-2.5 pr-8 bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-md focus:border-blue-500 focus:outline-none cursor-pointer"
          value={sort.sortBy}
          onChange={handleSortByChange}
        >
          {SORT_COLUMNS.map(col => (
            <option key={col.value} value={col.value}>{col.label}</option>
          ))}
        </select>
      </div>

      {/* Order Toggle */}
      <button
        id="sort-order-btn"
        className={`flex items-center gap-1.5 h-8 px-3 text-xs rounded-md border font-medium transition-all cursor-pointer ${
          sort.order === 'desc'
            ? 'bg-blue-950/80 border-blue-600 text-blue-400'
            : 'bg-slate-800 border-slate-700 text-slate-300 hover:border-blue-500 hover:text-blue-400'
        }`}
        onClick={handleOrderToggle}
        type="button"
        aria-label={`Sort order: ${sort.order}. Click to toggle.`}
      >
        <span>{sort.order === 'asc' ? '↑ Asc' : '↓ Desc'}</span>
      </button>
    </div>
  );
}
