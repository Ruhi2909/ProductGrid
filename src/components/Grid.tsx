import type { Product, EditableField, EditMap, SortConfig } from '../types';
import { GridRow } from './GridRow';
import { useVirtualScroller, ROW_HEIGHT } from '../hooks/useVirtualScroller';

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
  className?: string;
}[] = [
  { key: 'id',       label: '#' },
  { key: 'title',    label: 'Title',    sortBy: 'title' },
  { key: 'category', label: 'Category' },
  { key: 'brand',    label: 'Brand' },
  { key: 'price',    label: 'Price ($)', sortBy: 'price' },
  { key: 'stock',    label: 'Stock',    sortBy: 'stock' },
  { key: 'rating',   label: 'Rating',   sortBy: 'rating' },
  { key: 'actions',  label: 'Actions' },
];

function SkeletonRows() {
  return (
    <>
      {Array.from({ length: 12 }, (_, i) => (
        <div key={i} className="grid grid-cols-product min-w-[950px] border-b border-slate-800/60 bg-slate-900 absolute left-0 right-0" style={{ top: i * ROW_HEIGHT, height: ROW_HEIGHT }}>
          {COLUMNS.map(col => (
            <div key={col.key} className="flex items-center px-3 border-r border-slate-800/60">
              <div className="h-3 rounded bg-slate-800 animate-shimmer w-3/4" />
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

  return (
    <div className="flex flex-col h-full overflow-x-auto overflow-y-hidden" role="grid" aria-label="Products grid" aria-rowcount={total}>
      {/* Sticky Header */}
      <div className="grid grid-cols-product min-w-[950px] bg-slate-950 border-b border-slate-800 sticky top-0 z-10 select-none" role="row">
        {COLUMNS.map(col => (
          <div
            key={col.key}
            className={`flex items-center gap-1.5 px-3 h-10 text-xs font-semibold uppercase tracking-wider text-slate-400 border-r border-slate-800/80 ${
              col.sortBy ? 'cursor-pointer hover:text-slate-100 hover:bg-slate-900 transition-colors' : ''
            }`}
            role="columnheader"
            onClick={() => handleHeaderSort(col.sortBy)}
            tabIndex={col.sortBy ? 0 : undefined}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') handleHeaderSort(col.sortBy); }}
          >
            <span>{col.label}</span>
            {col.sortBy && (
              <span className={`text-xs ${sort.sortBy === col.sortBy ? 'text-blue-400 font-bold' : 'text-slate-600'}`}>
                {sort.sortBy === col.sortBy ? (sort.order === 'asc' ? '↑' : '↓') : '↕'}
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Scrollable Virtual Body */}
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-thin relative"
        onScroll={onScroll}
        role="presentation"
      >
        {/* Loading overlay */}
        {loading && (
          <div className="relative" style={{ height: ROW_HEIGHT * 12 }}>
            <SkeletonRows />
          </div>
        )}

        {/* Error state */}
        {!loading && error && (
          <div className="flex flex-col items-center justify-center gap-2 py-20 text-slate-400">
            <span className="text-2xl">⚠</span>
            <p className="text-sm font-medium text-slate-300">Failed to load products</p>
            <p className="text-xs text-slate-500">{error}</p>
          </div>
        )}

        {/* No Results state */}
        {!loading && !error && products.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-2 py-20 text-slate-400">
            <span className="text-2xl">🔍</span>
            <p className="text-sm font-medium text-slate-300">No products found</p>
            <p className="text-xs text-slate-500">Try a different search term or category</p>
          </div>
        )}

        {/* Virtualized Rows */}
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

        {/* Loading More Spinner */}
        {loadingMore && (
          <div className="flex justify-center items-center py-4 bg-slate-900 border-t border-slate-800">
            <span className="w-5 h-5 border-2 border-slate-700 border-t-blue-500 rounded-full animate-spin" />
          </div>
        )}

        {/* End Marker */}
        {!loading && !loadingMore && !hasMore && products.length > 0 && (
          <div className="text-center py-3 text-xs text-slate-500 border-t border-slate-800/60 bg-slate-950">
            All {total.toLocaleString()} products loaded
          </div>
        )}
      </div>
    </div>
  );
}
