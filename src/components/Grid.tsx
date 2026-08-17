import type { Product, EditableField, EditMap, SortConfig } from '../types';
import { GridRow } from './GridRow';
import { useVirtualScroller } from '../hooks/useVirtualScroller';
import { ROW_HEIGHT } from '../hooks/useVirtualScroller';

interface GridProps {
  products: Product[];
  total: number;
  loading: boolean;
  loadingMore: boolean;
  error: string | null;
  hasMore: boolean;
  editMap: EditMap;
  sort: SortConfig;
  onSortChange: (sort: SortConfig) => void;
  onCellChange: (productId: number, field: EditableField, value: string) => void;
  onCellBlur: (productId: number, field: EditableField) => void;
  onSaveRow: (productId: number) => void;
  onDiscardRow: (productId: number) => void;
  onLoadMore: () => void;
}

const COLUMNS: {
  key: string;
  label: string;
  sortBy?: SortConfig['sortBy'];
  className: string;
}[] = [
  { key: 'id',       label: '#',        className: 'col-id' },
  { key: 'title',    label: 'Title',    sortBy: 'title',  className: 'col-title' },
  { key: 'category', label: 'Category', className: 'col-category' },
  { key: 'brand',    label: 'Brand',    className: 'col-brand' },
  { key: 'price',    label: 'Price ($)', sortBy: 'price',  className: 'col-price' },
  { key: 'stock',    label: 'Stock',    sortBy: 'stock',  className: 'col-stock' },
  { key: 'rating',   label: 'Rating',   sortBy: 'rating', className: 'col-rating' },
  { key: 'actions',  label: 'Actions',  className: 'col-actions' },
];

/** Skeleton rows shown during the initial page load */
function SkeletonRows() {
  return (
    <>
      {Array.from({ length: 12 }, (_, i) => (
        <div key={i} className="grid-row grid-row--skeleton" style={{ position: 'absolute', top: i * ROW_HEIGHT, left: 0, right: 0, height: ROW_HEIGHT }}>
          {COLUMNS.map(col => (
            <div key={col.key} className={`grid-cell ${col.className}`}>
              <div className="skeleton-bar" style={{ width: col.key === 'title' ? '70%' : '60%' }} />
            </div>
          ))}
        </div>
      ))}
    </>
  );
}

export function Grid({
  products,
  total,
  loading,
  loadingMore,
  error,
  hasMore,
  editMap,
  sort,
  onSortChange,
  onCellChange,
  onCellBlur,
  onSaveRow,
  onDiscardRow,
  onLoadMore,
}: GridProps) {
  const { virtualItems, totalHeight, onScroll, containerRef } = useVirtualScroller(
    products.length,
    hasMore && !loadingMore ? onLoadMore : undefined,
  );

  function handleHeaderSort(sortBy: SortConfig['sortBy'] | undefined) {
    if (!sortBy) return;
    if (sort.sortBy === sortBy) {
      onSortChange({ ...sort, order: sort.order === 'asc' ? 'desc' : 'asc' });
    } else {
      onSortChange({ sortBy, order: 'asc' });
    }
  }

  function sortIndicator(sortBy: SortConfig['sortBy'] | undefined) {
    if (!sortBy || sort.sortBy !== sortBy) return <span className="sort-indicator sort-indicator--inactive">↕</span>;
    return (
      <span className="sort-indicator sort-indicator--active">
        {sort.order === 'asc' ? '↑' : '↓'}
      </span>
    );
  }

  return (
    <div className="grid-wrapper" role="grid" aria-label="Products grid" aria-rowcount={total}>
      {/* ── Sticky header ── */}
      <div className="grid-header" role="row">
        {COLUMNS.map(col => (
          <div
            key={col.key}
            className={`grid-header-cell ${col.className}${col.sortBy ? ' grid-header-cell--sortable' : ''}`}
            role="columnheader"
            aria-sort={
              col.sortBy
                ? sort.sortBy === col.sortBy
                  ? sort.order === 'asc' ? 'ascending' : 'descending'
                  : 'none'
                : undefined
            }
            onClick={() => handleHeaderSort(col.sortBy)}
            tabIndex={col.sortBy ? 0 : undefined}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') handleHeaderSort(col.sortBy); }}
          >
            {col.label}
            {col.sortBy && sortIndicator(col.sortBy)}
          </div>
        ))}
      </div>

      {/* ── Scroll body ── */}
      <div
        ref={containerRef}
        className="grid-body"
        onScroll={onScroll}
        role="presentation"
      >
        {/* Full-page loading state */}
        {loading && (
          <div className="grid-overlay" style={{ height: ROW_HEIGHT * 12, position: 'relative' }}>
            <SkeletonRows />
          </div>
        )}

        {/* Error state */}
        {!loading && error && (
          <div className="grid-empty">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="40" height="40" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            <p className="grid-empty-title">Failed to load products</p>
            <p className="grid-empty-subtitle">{error}</p>
          </div>
        )}

        {/* No-results state */}
        {!loading && !error && products.length === 0 && (
          <div className="grid-empty">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="40" height="40" aria-hidden="true"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            <p className="grid-empty-title">No products found</p>
            <p className="grid-empty-subtitle">Try a different search term or category</p>
          </div>
        )}

        {/* Virtual rows */}
        {!loading && !error && products.length > 0 && (
          <div style={{ position: 'relative', height: totalHeight }} role="presentation">
            {virtualItems.map(item => {
              const product = products[item.index];
              if (!product) return null;
              return (
                <GridRow
                  key={product.id}
                  product={product}
                  top={item.top}
                  editState={editMap.get(product.id)}
                  onCellChange={onCellChange}
                  onCellBlur={onCellBlur}
                  onSaveRow={onSaveRow}
                  onDiscardRow={onDiscardRow}
                />
              );
            })}
          </div>
        )}

        {/* Load-more spinner */}
        {loadingMore && (
          <div className="load-more-spinner" aria-label="Loading more products…">
            <span className="btn-spinner btn-spinner--large" />
          </div>
        )}

        {/* End-of-list marker */}
        {!loading && !loadingMore && !hasMore && products.length > 0 && (
          <div className="load-more-end">
            All {total.toLocaleString()} products loaded
          </div>
        )}
      </div>
    </div>
  );
}
