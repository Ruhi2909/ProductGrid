import { useState, useCallback, useRef, useEffect } from 'react';
import type {
  Product,
  EditableField,
  EditMap,
  RowEditState,
  CommittedParams,
  SortConfig,
  DraftRecord,
} from './types';
import { useSearchQuery } from './hooks/useSearchQuery';
import { useDebounce } from './hooks/useDebounce';
import { useCategories } from './hooks/useCategories';
import { SearchBox } from './components/SearchBox';
import { FilterBar } from './components/FilterBar';
import { Grid } from './components/Grid';
import { SaveBar } from './components/SaveBar';
import { UnsavedEditsModal } from './components/UnsavedEditsModal';
import { validateField, validateDraft, isRowValid } from './validation';
import { saveProduct } from './api';

// ─── Helpers ───────────────────────────────────────────────────────────────────

function productToDraft(product: Product): DraftRecord {
  return {
    title: product.title,
    price: String(product.price),
    stock: String(product.stock),
    rating: String(product.rating),
  };
}

function computeDirtyFields(
  product: Product,
  draft: DraftRecord,
): ReadonlySet<EditableField> {
  const dirty = new Set<EditableField>();
  if (draft.title !== product.title) dirty.add('title');
  if (parseFloat(draft.price) !== product.price) dirty.add('price');
  if (parseInt(draft.stock, 10) !== product.stock) dirty.add('stock');
  if (parseFloat(draft.rating) !== product.rating) dirty.add('rating');
  return dirty;
}

function buildPatch(
  draft: DraftRecord,
  dirtyFields: ReadonlySet<EditableField>,
): Record<string, string | number> {
  const patch: Record<string, string | number> = {};
  if (dirtyFields.has('title')) patch.title = draft.title;
  if (dirtyFields.has('price')) patch.price = parseFloat(draft.price);
  if (dirtyFields.has('stock')) patch.stock = parseInt(draft.stock, 10);
  if (dirtyFields.has('rating')) patch.rating = parseFloat(draft.rating);
  return patch;
}

// ─── App ───────────────────────────────────────────────────────────────────────

export default function App() {
  // ── The params that are ACTUALLY loaded in the grid right now ──────────────
  const [committedParams, setCommittedParams] = useState<CommittedParams>({
    query: '',
    category: '',
    sort: { sortBy: 'title', order: 'asc' },
  });

  // ── The raw text in the search input (may differ from committedParams.query)
  const [inputQuery, setInputQuery] = useState('');

  // ── Guard state: pending navigation that's waiting for user confirmation ──
  const [pendingParams, setPendingParams] = useState<CommittedParams | null>(null);
  const [showGuard, setShowGuard] = useState(false);

  // ── Edit state keyed by product.id ────────────────────────────────────────
  const [editMap, setEditMap] = useState<EditMap>(new Map());

  // ── Bulk save state ───────────────────────────────────────────────────────
  const [isBulkSaving, setIsBulkSaving] = useState(false);
  const [bulkErrors, setBulkErrors] = useState<{ id: number; title: string; error: string }[]>([]);

  // ── Data fetching ─────────────────────────────────────────────────────────
  const { products, total, loading, loadingMore, error, hasMore, loadMore } =
    useSearchQuery(committedParams);

  // ── Categories ────────────────────────────────────────────────────────────
  const { categories, loading: loadingCategories } = useCategories();

  // ── Search box ref (never steal focus on re-render) ───────────────────────
  const searchRef = useRef<HTMLInputElement>(null);

  // ── Debounced input query → triggers navigation attempt ──────────────────
  const debouncedQuery = useDebounce(inputQuery, 300);

  useEffect(() => {
    if (debouncedQuery === committedParams.query) return;
    tryNavigate({ ...committedParams, query: debouncedQuery });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedQuery]);

  // ─────────────────────────────────────────────────────────────────────────
  // Guard: before ANY params change, check for unsaved edits
  // ─────────────────────────────────────────────────────────────────────────

  const dirtyCount = [...editMap.values()].filter(s => s.dirtyFields.size > 0).length;

  function tryNavigate(newParams: CommittedParams) {
    if (dirtyCount > 0) {
      setPendingParams(newParams);
      setShowGuard(true);
    } else {
      commit(newParams);
    }
  }

  function commit(newParams: CommittedParams) {
    setCommittedParams(newParams);
    setInputQuery(newParams.query);
    // Clear any stale bulk errors when loading new results
    setBulkErrors([]);
  }

  function handleDiscard() {
    setEditMap(new Map());
    setBulkErrors([]);
    if (pendingParams) commit(pendingParams);
    setPendingParams(null);
    setShowGuard(false);
  }

  function handleKeepEditing() {
    // Reset the search box to show the committed query
    setInputQuery(committedParams.query);
    setPendingParams(null);
    setShowGuard(false);
  }

  // ── Search box handler (just updates input; debounce handles navigation) ──
  function handleInputChange(value: string) {
    setInputQuery(value);
  }

  // ── Filter / sort handlers (synchronous — no debounce needed) ────────────
  function handleCategoryChange(slug: string) {
    tryNavigate({ ...committedParams, category: slug, query: inputQuery });
  }

  function handleSortChange(sort: SortConfig) {
    tryNavigate({ ...committedParams, sort, query: inputQuery });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Edit state management
  // ─────────────────────────────────────────────────────────────────────────

  const handleCellChange = useCallback(
    (productId: number, field: EditableField, value: string) => {
      setEditMap(prev => {
        const next = new Map(prev);
        const product = products.find(p => p.id === productId);
        if (!product) return prev;

        const existing = next.get(productId);
        const draft: DraftRecord = existing
          ? { ...existing.draft, [field]: value }
          : { ...productToDraft(product), [field]: value };

        // Validate only the changed field live (other fields on blur)
        const currentErrors = existing?.errors ?? {};
        const fieldError = validateField(field, value);
        const errors = { ...currentErrors };
        if (fieldError) {
          errors[field] = fieldError;
        } else {
          delete errors[field];
        }

        const dirtyFields = computeDirtyFields(product, draft);

        const nextState: RowEditState = {
          draft,
          errors,
          dirtyFields,
          saveStatus: 'idle',
        };
        next.set(productId, nextState);
        return next;
      });
    },
    [products],
  );

  const handleCellBlur = useCallback(
    (productId: number, field: EditableField) => {
      setEditMap(prev => {
        const existing = prev.get(productId);
        if (!existing) return prev;
        const fieldError = validateField(field, existing.draft[field]);
        const errors = { ...existing.errors };
        if (fieldError) {
          errors[field] = fieldError;
        } else {
          delete errors[field];
        }
        const next = new Map(prev);
        next.set(productId, { ...existing, errors });
        return next;
      });
    },
    [],
  );

  const handleDiscardRow = useCallback((productId: number) => {
    setEditMap(prev => {
      const next = new Map(prev);
      next.delete(productId);
      return next;
    });
  }, []);

  // ─────────────────────────────────────────────────────────────────────────
  // Save a single row
  // ─────────────────────────────────────────────────────────────────────────

  const handleSaveRow = useCallback(
    async (productId: number) => {
      const state = editMap.get(productId);
      const product = products.find(p => p.id === productId);
      if (!state || !product) return;

      // Re-validate everything before saving
      const errors = validateDraft(state.draft);
      if (!isRowValid(errors)) {
        setEditMap(prev => {
          const next = new Map(prev);
          const existing = next.get(productId);
          if (existing) next.set(productId, { ...existing, errors });
          return next;
        });
        return;
      }

      const patch = buildPatch(state.draft, state.dirtyFields);
      if (Object.keys(patch).length === 0) {
        // Nothing actually changed — clear the edit state
        setEditMap(prev => { const n = new Map(prev); n.delete(productId); return n; });
        return;
      }

      // Mark saving
      setEditMap(prev => {
        const next = new Map(prev);
        const existing = next.get(productId);
        if (existing) next.set(productId, { ...existing, saveStatus: 'saving', saveError: undefined });
        return next;
      });

      try {
        const updated = await saveProduct(productId, patch);
        // Success: use server-echoed values as new baseline, clear dirty state
        setEditMap(prev => {
          const next = new Map(prev);
          // Build new draft from updated product so dirtyFields computes to empty
          const newDraft = productToDraft(updated);
          const newDirty = computeDirtyFields(updated, newDraft);
          if (newDirty.size === 0) {
            next.delete(productId); // fully clean
          } else {
            next.set(productId, {
              draft: newDraft,
              errors: {},
              dirtyFields: newDirty,
              saveStatus: 'idle',
            });
          }
          return next;
        });
        // Also patch the product in our local products list via a products state update
        // Since useSearchQuery owns products state, we optimistically update it here
        // by mutating the ref — the server echo is the source of truth.
        // (A real app would use a query cache like React Query for this.)
        updateProductInList(updated);
      } catch (err) {
        const errMsg = (err as Error).message ?? 'Save failed';
        setEditMap(prev => {
          const next = new Map(prev);
          const existing = next.get(productId);
          if (existing) next.set(productId, { ...existing, saveStatus: 'error', saveError: errMsg });
          return next;
        });
      }
    },
    [editMap, products],
  );

  // Local products list override for optimistic updates after save
  const [productOverrides, setProductOverrides] = useState<Map<number, Product>>(new Map());

  function updateProductInList(updated: Product) {
    setProductOverrides(prev => new Map(prev).set(updated.id, updated));
  }

  // Merge server products with local overrides
  const mergedProducts = products.map(p => productOverrides.get(p.id) ?? p);

  // ─────────────────────────────────────────────────────────────────────────
  // Bulk save
  // ─────────────────────────────────────────────────────────────────────────

  async function handleSaveAll() {
    if (isBulkSaving) return;
    const dirtyEntries = [...editMap.entries()].filter(
      ([, state]) => state.dirtyFields.size > 0 && isRowValid(state.errors),
    );
    if (dirtyEntries.length === 0) return;

    setIsBulkSaving(true);
    setBulkErrors([]);

    // Save all in parallel
    const results = await Promise.allSettled(
      dirtyEntries.map(async ([productId, state]) => {
        const product = mergedProducts.find(p => p.id === productId);
        if (!product) throw new Error('Product not found');
        const patch = buildPatch(state.draft, state.dirtyFields);
        const updated = await saveProduct(productId, patch);
        return { productId, updated };
      }),
    );

    setIsBulkSaving(false);

    const newErrors: { id: number; title: string; error: string }[] = [];

    setEditMap(prev => {
      const next = new Map(prev);
      results.forEach((result, i) => {
        const [productId] = dirtyEntries[i];
        if (result.status === 'fulfilled') {
          const { updated } = result.value;
          next.delete(productId);
          updateProductInList(updated);
        } else {
          // Failed: keep dirty, update save status
          const product = mergedProducts.find(p => p.id === productId);
          const errMsg = (result.reason as Error)?.message ?? 'Save failed';
          newErrors.push({ id: productId, title: product?.title ?? String(productId), error: errMsg });
          const existing = next.get(productId);
          if (existing) next.set(productId, { ...existing, saveStatus: 'error', saveError: errMsg });
        }
      });
      return next;
    });

    setBulkErrors(newErrors);
  }

  // Clear overrides when params change (new search results arrive)
  useEffect(() => {
    setProductOverrides(new Map());
  }, [committedParams]);

  // ─────────────────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────────────────

  const isSynced = inputQuery === committedParams.query;

  return (
    <div className="app">
      {/* ── Header ── */}
      <header className="app-header">
        <div className="app-header-inner">
          <div className="app-logo">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="22" height="22" aria-hidden="true">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <path d="M3 9h18M9 21V9" />
            </svg>
            <span className="app-logo-text">ProductGrid</span>
          </div>

          <SearchBox
            ref={searchRef}
            value={inputQuery}
            onChange={handleInputChange}
            loading={loading}
            error={error}
            total={!loading && !error ? total : null}
            isSynced={isSynced}
          />
        </div>

        <FilterBar
          categories={categories}
          loadingCategories={loadingCategories}
          category={committedParams.category}
          sort={committedParams.sort}
          onCategoryChange={handleCategoryChange}
          onSortChange={handleSortChange}
        />
      </header>

      {/* ── Grid ── */}
      <main className="app-main">
        <Grid
          products={mergedProducts}
          total={total}
          loading={loading}
          loadingMore={loadingMore}
          error={error}
          hasMore={hasMore}
          editMap={editMap}
          sort={committedParams.sort}
          onSortChange={handleSortChange}
          onCellChange={handleCellChange}
          onCellBlur={handleCellBlur}
          onSaveRow={handleSaveRow}
          onDiscardRow={handleDiscardRow}
          onLoadMore={loadMore}
        />
      </main>

      {/* ── Save bar ── */}
      <SaveBar
        dirtyCount={dirtyCount}
        isBulkSaving={isBulkSaving}
        bulkErrors={bulkErrors}
        onSaveAll={handleSaveAll}
        onDismissErrors={() => setBulkErrors([])}
      />

      {/* ── Unsaved edits guard modal ── */}
      {showGuard && (
        <UnsavedEditsModal
          dirtyCount={dirtyCount}
          onDiscard={handleDiscard}
          onKeep={handleKeepEditing}
        />
      )}
    </div>
  );
}
