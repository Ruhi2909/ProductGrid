import { forwardRef } from 'react';

interface SearchBoxProps {
  value: string;
  onChange: (value: string) => void;
  loading: boolean;
  error: string | null;
  total: number | null;
  isSynced: boolean;
}

export const SearchBox = forwardRef<HTMLInputElement, SearchBoxProps>(
  ({ value, onChange, loading, error, total, isSynced }, ref) => {
    return (
      <div className="flex-1 max-w-xl" role="search">
        <div className="relative flex items-center">
          {/* Search Icon */}
          <svg className="absolute left-3 text-slate-500 w-4 h-4 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>

          <input
            ref={ref}
            id="search-input"
            type="search"
            className={`w-full h-9 pl-9 pr-9 bg-slate-950 text-slate-100 placeholder-slate-500 text-sm rounded-md border transition-all outline-none ${
              !isSynced
                ? 'border-amber-500 focus:ring-2 focus:ring-amber-500/20'
                : 'border-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
            }`}
            placeholder="Search products…"
            value={value}
            onChange={e => onChange(e.target.value)}
            autoComplete="off"
            spellCheck={false}
            aria-label="Search products"
            aria-busy={loading}
          />

          {loading && (
            <span className="absolute right-3 w-4 h-4 border-2 border-slate-700 border-t-blue-500 rounded-full animate-spin" role="status" />
          )}

          {!loading && value && (
            <button
              id="search-clear-btn"
              className="absolute right-2 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded p-1 text-xs"
              onClick={() => onChange('')}
              type="button"
              aria-label="Clear search"
            >
              ✕
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 mt-1 min-h-[18px] text-xs">
          {error && (
            <span className="text-red-400 flex items-center gap-1">
              ⚠ {error}
            </span>
          )}
          {!error && !loading && total !== null && (
            <span className="text-slate-400">
              {total === 0 ? 'No products found' : `${total.toLocaleString()} product${total === 1 ? '' : 's'}`}
            </span>
          )}
          {!isSynced && (
            <span className="text-amber-400 font-medium flex items-center gap-1">
              ⚡ Pending decision
            </span>
          )}
        </div>
      </div>
    );
  },
);

SearchBox.displayName = 'SearchBox';
