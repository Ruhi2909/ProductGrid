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
    <div className="filter-bar" role="toolbar" aria-label="Grid filters">
      {/* Category filter */}
      <div className="filter-group">
        <label htmlFor="category-select" className="filter-label">Category</label>
        <select
          id="category-select"
          className="filter-select"
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

      <div className="filter-divider" aria-hidden="true" />

      {/* Sort column */}
      <div className="filter-group">
        <label htmlFor="sort-by-select" className="filter-label">Sort by</label>
        <select
          id="sort-by-select"
          className="filter-select"
          value={sort.sortBy}
          onChange={handleSortByChange}
        >
          {SORT_COLUMNS.map(col => (
            <option key={col.value} value={col.value}>{col.label}</option>
          ))}
        </select>
      </div>

      {/* Sort order toggle */}
      <button
        id="sort-order-btn"
        className={`sort-order-btn${sort.order === 'desc' ? ' sort-order-btn--desc' : ''}`}
        onClick={handleOrderToggle}
        type="button"
        aria-label={`Sort order: ${sort.order === 'asc' ? 'ascending' : 'descending'}. Click to toggle.`}
        title={sort.order === 'asc' ? 'Ascending — click for descending' : 'Descending — click for ascending'}
      >
        <svg viewBox="0 0 16 16" fill="currentColor" width="14" height="14" aria-hidden="true">
          {sort.order === 'asc' ? (
            <path d="M3.5 2.5a.5.5 0 0 0-1 0v8.793L1.146 9.94a.5.5 0 1 0-.707.707l2 2a.5.5 0 0 0 .707 0l2-2a.5.5 0 0 0-.707-.707L3.5 11.293V2.5zm4 1a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1H8a.5.5 0 0 1-.5-.5zM8 7.5a.5.5 0 0 0 0 1h5a.5.5 0 0 0 0-1H8zm0 3a.5.5 0 0 0 0 1h3a.5.5 0 0 0 0-1H8z" />
          ) : (
            <path d="M3.5 13.5a.5.5 0 0 1-1 0V4.707L1.146 6.06a.5.5 0 1 1-.707-.707l2-2a.5.5 0 0 1 .707 0l2 2a.5.5 0 1 1-.707.707L3.5 4.707V13.5zm4-11a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1H8a.5.5 0 0 1-.5-.5zM8 4.5a.5.5 0 0 0 0 1h5a.5.5 0 0 0 0-1H8zm0 3a.5.5 0 0 0 0 1h3a.5.5 0 0 0 0-1H8z" />
          )}
        </svg>
        {sort.order === 'asc' ? 'Asc' : 'Desc'}
      </button>
    </div>
  );
}
