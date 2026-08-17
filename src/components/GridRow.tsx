import { memo } from 'react';
import type { Product, EditableField, RowEditState } from '../types';
import { EditableCell } from './EditableCell';
import { isRowValid } from '../validation';
import { ROW_HEIGHT } from '../hooks/useVirtualScroller';

interface GridRowProps {
  product: Product;
  top: number;
  editState: RowEditState | undefined;
  onCellChange: (productId: number, field: EditableField, value: string) => void;
  onCellBlur: (productId: number, field: EditableField) => void;
  onSaveRow: (productId: number) => void;
  onDiscardRow: (productId: number) => void;
}

function GridRowInner({
  product,
  top,
  editState,
  onCellChange,
  onCellBlur,
  onSaveRow,
  onDiscardRow,
}: GridRowProps) {
  const isDirty = editState !== undefined && editState.dirtyFields.size > 0;
  const isSaving = editState?.saveStatus === 'saving';
  const hasSaveError = editState?.saveStatus === 'error';
  const hasErrors = editState ? !isRowValid(editState.errors) : false;
  const canSave = isDirty && !hasErrors && !isSaving;

  function getValue(field: EditableField): string {
    if (editState) return editState.draft[field];
    return String(product[field]);
  }

  function isFieldDirty(field: EditableField): boolean {
    return editState?.dirtyFields.has(field) ?? false;
  }

  return (
    <div
      className={`grid grid-cols-product min-w-[950px] border-b border-slate-800/80 transition-colors absolute left-0 right-0 ${
        isDirty ? 'bg-amber-500/5 border-l-2 border-l-amber-500' : 'bg-slate-900 hover:bg-slate-850'
      } ${isSaving ? 'opacity-60 pointer-events-none' : ''} ${hasSaveError ? 'border-l-2 border-l-red-500' : ''}`}
      style={{ top, height: ROW_HEIGHT }}
      role="row"
      aria-label={`Product: ${product.title}`}
    >
      {/* ID */}
      <div className="flex items-center justify-center px-2 min-w-0 border-r border-slate-800" role="gridcell">
        <span className="text-xs text-slate-500 font-mono">#{product.id}</span>
      </div>

      {/* Title */}
      <EditableCell
        id={`cell-title-${product.id}`}
        field="title"
        value={getValue('title')}
        error={editState?.errors.title}
        isDirty={isFieldDirty('title')}
        onChange={(f, v) => onCellChange(product.id, f, v)}
        onBlur={f => onCellBlur(product.id, f)}
      />

      {/* Category */}
      <div className="flex items-center px-2.5 min-w-0 border-r border-slate-800" role="gridcell">
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-800 border border-slate-700 text-slate-300 truncate max-w-[130px]">
          {product.category}
        </span>
      </div>

      {/* Brand */}
      <div className="flex items-center px-2.5 min-w-0 border-r border-slate-800" role="gridcell">
        <span className="text-xs text-slate-400 truncate">{product.brand ?? '—'}</span>
      </div>

      {/* Price */}
      <EditableCell
        id={`cell-price-${product.id}`}
        field="price"
        value={getValue('price')}
        error={editState?.errors.price}
        isDirty={isFieldDirty('price')}
        onChange={(f, v) => onCellChange(product.id, f, v)}
        onBlur={f => onCellBlur(product.id, f)}
      />

      {/* Stock */}
      <EditableCell
        id={`cell-stock-${product.id}`}
        field="stock"
        value={getValue('stock')}
        error={editState?.errors.stock}
        isDirty={isFieldDirty('stock')}
        onChange={(f, v) => onCellChange(product.id, f, v)}
        onBlur={f => onCellBlur(product.id, f)}
      />

      {/* Rating */}
      <EditableCell
        id={`cell-rating-${product.id}`}
        field="rating"
        value={getValue('rating')}
        error={editState?.errors.rating}
        isDirty={isFieldDirty('rating')}
        onChange={(f, v) => onCellChange(product.id, f, v)}
        onBlur={f => onCellBlur(product.id, f)}
      />

      {/* Actions */}
      <div className="flex items-center gap-1.5 px-2.5 min-w-0" role="gridcell">
        {isDirty && (
          <>
            <button
              id={`save-row-${product.id}`}
              className={`flex items-center gap-1 px-2.5 h-7 rounded text-[11px] font-medium transition-colors border cursor-pointer ${
                canSave
                  ? 'bg-emerald-950/80 border-emerald-700 text-emerald-400 hover:bg-emerald-900/80'
                  : 'opacity-45 cursor-not-allowed bg-slate-800 border-slate-700 text-slate-500'
              }`}
              onClick={() => onSaveRow(product.id)}
              disabled={!canSave}
              type="button"
            >
              {isSaving ? (
                <><span className="w-3 h-3 border-2 border-emerald-400/30 border-t-emerald-400 rounded-full animate-spin" /> Saving…</>
              ) : (
                <>Save row</>
              )}
            </button>
            {!isSaving && (
              <button
                id={`discard-row-${product.id}`}
                className="w-6 h-6 flex items-center justify-center rounded text-slate-400 hover:text-red-400 hover:bg-red-950/40 text-xs transition-colors cursor-pointer"
                onClick={() => onDiscardRow(product.id)}
                type="button"
                title="Discard changes"
              >
                ✕
              </button>
            )}
          </>
        )}
        {hasSaveError && (
          <span className="text-[11px] text-red-400 font-medium truncate" title={editState?.saveError} role="alert">
            ⚠ Failed
          </span>
        )}
        {!isDirty && !hasSaveError && (
          <span className="text-xs text-slate-600">—</span>
        )}
      </div>
    </div>
  );
}

export const GridRow = memo(GridRowInner, (prev, next) => {
  return (
    prev.product === next.product &&
    prev.top === next.top &&
    prev.editState === next.editState
  );
});
