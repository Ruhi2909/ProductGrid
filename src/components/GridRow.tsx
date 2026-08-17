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

  // For each editable field, use draft value if editing, else product value
  function getValue(field: EditableField): string {
    if (editState) return editState.draft[field];
    return String(product[field]);
  }

  function isFieldDirty(field: EditableField): boolean {
    return editState?.dirtyFields.has(field) ?? false;
  }

  return (
    <div
      className={`grid-row${isDirty ? ' grid-row--dirty' : ''}${isSaving ? ' grid-row--saving' : ''}${hasSaveError ? ' grid-row--error' : ''}`}
      style={{ position: 'absolute', top, left: 0, right: 0, height: ROW_HEIGHT }}
      role="row"
      aria-label={`Product: ${product.title}`}
    >
      {/* ID */}
      <div className="grid-cell grid-cell--id" role="gridcell">
        <span className="cell-value cell-value--muted">#{product.id}</span>
      </div>

      {/* Title — editable */}
      <EditableCell
        id={`cell-title-${product.id}`}
        field="title"
        value={getValue('title')}
        error={editState?.errors.title}
        isDirty={isFieldDirty('title')}
        onChange={(f, v) => onCellChange(product.id, f, v)}
        onBlur={f => onCellBlur(product.id, f)}
      />

      {/* Category — read-only */}
      <div className="grid-cell grid-cell--readonly" role="gridcell">
        <span className="cell-badge">{product.category}</span>
      </div>

      {/* Brand — read-only */}
      <div className="grid-cell grid-cell--readonly" role="gridcell">
        <span className="cell-value cell-value--muted">{product.brand ?? '—'}</span>
      </div>

      {/* Price — editable */}
      <EditableCell
        id={`cell-price-${product.id}`}
        field="price"
        value={getValue('price')}
        error={editState?.errors.price}
        isDirty={isFieldDirty('price')}
        onChange={(f, v) => onCellChange(product.id, f, v)}
        onBlur={f => onCellBlur(product.id, f)}
      />

      {/* Stock — editable */}
      <EditableCell
        id={`cell-stock-${product.id}`}
        field="stock"
        value={getValue('stock')}
        error={editState?.errors.stock}
        isDirty={isFieldDirty('stock')}
        onChange={(f, v) => onCellChange(product.id, f, v)}
        onBlur={f => onCellBlur(product.id, f)}
      />

      {/* Rating — editable */}
      <EditableCell
        id={`cell-rating-${product.id}`}
        field="rating"
        value={getValue('rating')}
        error={editState?.errors.rating}
        isDirty={isFieldDirty('rating')}
        onChange={(f, v) => onCellChange(product.id, f, v)}
        onBlur={f => onCellBlur(product.id, f)}
      />

      {/* Row actions */}
      <div className="grid-cell grid-cell--actions" role="gridcell">
        {isDirty && (
          <>
            <button
              id={`save-row-${product.id}`}
              className={`btn btn-save-row${canSave ? '' : ' btn--disabled'}`}
              onClick={() => onSaveRow(product.id)}
              disabled={!canSave}
              type="button"
              aria-label={`Save changes to ${product.title}`}
            >
              {isSaving ? (
                <><span className="btn-spinner" aria-hidden="true" /> Saving…</>
              ) : (
                <>
                  <svg viewBox="0 0 16 16" fill="currentColor" width="13" height="13" aria-hidden="true"><path d="M2 1a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V4.5L10.5 1H2zm.5 1H10v3.5h4V14h-11V2zM9 2v3h3.5L9 2z"/></svg>
                  Save row
                </>
              )}
            </button>
            {!isSaving && (
              <button
                id={`discard-row-${product.id}`}
                className="btn btn-discard-row"
                onClick={() => onDiscardRow(product.id)}
                type="button"
                aria-label={`Discard changes to ${product.title}`}
                title="Discard changes"
              >
                ✕
              </button>
            )}
          </>
        )}
        {hasSaveError && (
          <span
            className="row-save-error"
            title={editState?.saveError}
            role="alert"
          >
            ⚠ Failed
          </span>
        )}
        {!isDirty && !hasSaveError && (
          <span className="cell-value cell-value--muted row-pristine">—</span>
        )}
      </div>
    </div>
  );
}

// Memo prevents re-rendering rows that haven't changed
export const GridRow = memo(GridRowInner, (prev, next) => {
  return (
    prev.product === next.product &&
    prev.top === next.top &&
    prev.editState === next.editState
  );
});
