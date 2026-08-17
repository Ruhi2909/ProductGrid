import { forwardRef } from 'react';

interface SearchBoxProps {
  value: string;
  onChange: (value: string) => void;
  loading: boolean;
  error: string | null;
  total: number | null;
  /** True when the search box value matches the committed (loaded) params */
  isSynced: boolean;
}

export const SearchBox = forwardRef<HTMLInputElement, SearchBoxProps>(
  ({ value, onChange, loading, error, total, isSynced }, ref) => {
    return (
      <div className="search-box" role="search">
        <div className="search-input-wrapper">
          {/* Search icon */}
          <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>

          <input
            ref={ref}
            id="search-input"
            type="search"
            className={`search-input${!isSynced ? ' search-input--pending' : ''}`}
            placeholder="Search products…"
            value={value}
            onChange={e => onChange(e.target.value)}
            autoComplete="off"
            spellCheck={false}
            aria-label="Search products"
            aria-busy={loading}
          />

          {loading && (
            <span className="search-spinner" role="status" aria-label="Searching…" />
          )}

          {!loading && value && (
            <button
              id="search-clear-btn"
              className="search-clear"
              onClick={() => onChange('')}
              aria-label="Clear search"
              type="button"
              tabIndex={-1}
            >
              ✕
            </button>
          )}
        </div>

        <div className="search-meta" aria-live="polite" aria-atomic="true">
          {error && (
            <span className="search-status search-status--error">
              <svg viewBox="0 0 16 16" fill="currentColor" width="14" height="14" aria-hidden="true"><path d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1zm-.75 4a.75.75 0 0 1 1.5 0v3a.75.75 0 0 1-1.5 0V5zm.75 6a1 1 0 1 1 0-2 1 1 0 0 1 0 2z"/></svg>
              {error}
            </span>
          )}
          {!error && !loading && total !== null && (
            <span className="search-status">
              {total === 0
                ? 'No products found'
                : `${total.toLocaleString()} product${total === 1 ? '' : 's'}`}
            </span>
          )}
          {!isSynced && (
            <span className="search-status search-status--pending" title="Results pending your decision">
              ⚡ Pending
            </span>
          )}
        </div>
      </div>
    );
  },
);

SearchBox.displayName = 'SearchBox';
