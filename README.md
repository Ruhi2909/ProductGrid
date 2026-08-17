# ProductGrid — Frontend Take-Home

A single-screen searchable, server-sorted, inline-editable product grid built with React 19 + TypeScript (Vite).

## Running locally

```bash
npm install
npm run dev
```

Opens at `http://localhost:5173`.

---

## Key decisions

### 1. Edit state keyed by `product.id`, not row index

`editMap` is a `Map<number, RowEditState>` in App.tsx. When the virtual scroller recycles DOM rows as you scroll, it looks up the edit state by `product.id` from the products array. An index-keyed approach would assign the edit state of row 3 to whatever product happens to appear at position 3 after a scroll — a bug that's invisible until it bites you in review.

### 2. Cache key = `query|category|sortBy|order|skip`

The full parameter set forms the cache key. This means:
- Changing sort order on the same query is a separate cache slot (you can't reuse results sorted differently without re-fetching)
- Re-typing a recent query **with the same sort** is an instant cache hit
- The LRU evicts at 10 entries — enough to handle typical back-and-forth without unbounded memory growth

### 3. Race safety: monotonic request ID + AbortController

Every call to `fetchPage` in `useSearchQuery` increments a `requestSeqRef`. The response only commits to state if `mySeq === requestSeqRef.current`. This handles the "type fast, slow network" case where an older response arrives after a newer one — the stale data is simply dropped.

`AbortController.abort()` cancels the in-flight network request when params change, reducing wasted bandwidth. (The race guard is a second line of defence — network cancellation alone doesn't prevent a response from landing before the abort propagates.)

### 4. Custom virtualizer

A `useVirtualScroller` hook with:
- **Fixed row height** (56 px, matched in CSS via `--row-h`)
- **ResizeObserver** to measure the scroll container accurately on mount and window resize
- **Overscan of 3 rows** above and below the visible window to prevent flicker on fast scrolling
- **Infinite scroll**: when `scrollTop + containerHeight` is within 5 row-heights of the total content height, `onNearBottom()` fires → `loadMore()` appends the next page

No `react-window` or `react-virtual` — the hook is ~60 lines and demonstrates the underlying mechanics clearly.

### 5. Unsaved-edit guard covers all three triggers

`tryNavigate(newParams)` is the single gate. Every param change — search input debounce, sort column click, sort order toggle, category dropdown — passes through it. If `dirtyCount > 0`, a modal blocks the navigation. On **Discard**, `editMap` is cleared and the new params commit. On **Keep editing**, `inputQuery` is reset to `committedParams.query` so the search box shows what's actually loaded, not what the user typed.

### 6. Partial-failure bulk save

`handleSaveAll` fires all dirty rows with `Promise.allSettled`. Fulfilled rows clear from `editMap`; rejected rows get `saveStatus: 'error'` and their product IDs collected into `bulkErrors` for inline reporting in the SaveBar.

### 7. Optimistic save / server echo

DummyJSON's PUT returns the "saved" product. On success, that echoed product replaces the local entry in `productOverrides`, and `editMap` for that row is cleared. On a real backend, this is the correct pattern: don't re-fetch to confirm, trust the echo.

---

## What I'd do with more time

- **React Query** instead of the manual cache — cache invalidation, background refetch, and stale-while-revalidate for free
- **Column resizing** — the grid column widths are fixed CSS; a drag handle would make title-heavy data much easier to read
- **Row-level optimistic rollback** — currently a failed save leaves the row in error state; a better UX would let you retry or revert to the last known-good server values
- **Keyboard navigation** — Tab through cells, Enter to confirm, Escape to discard a cell edit
- **URL sync** — encode `q`, `category`, `sortBy`, `order` in the query string so the view is shareable and survives a refresh
- **Proper TypeScript strictness** — a few `as` casts exist where React Query's typed returns would eliminate them
- **E2E tests** — Playwright scenarios covering the race condition (delay param), edit-then-sort guard, and partial bulk-save failure
# ProductGrid
