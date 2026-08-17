interface SaveBarProps {
  dirtyCount: number;
  isBulkSaving: boolean;
  bulkErrors: { id: number; title: string; error: string }[];
  onSaveAll: () => void;
  onDismissErrors: () => void;
}

export function SaveBar({
  dirtyCount,
  isBulkSaving,
  bulkErrors,
  onSaveAll,
  onDismissErrors,
}: SaveBarProps) {
  if (dirtyCount === 0 && bulkErrors.length === 0) return null;

  return (
    <div className="flex items-center justify-between gap-4 p-3 bg-slate-900 border-t border-slate-800 z-10 animate-in slide-in-from-bottom-2 duration-150" role="region" aria-label="Save actions">
      <div className="flex flex-col gap-1 min-w-0">
        {dirtyCount > 0 && (
          <span className="flex items-center gap-2 text-xs font-medium text-amber-400">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            {dirtyCount} unsaved row{dirtyCount !== 1 ? 's' : ''}
          </span>
        )}
        {bulkErrors.length > 0 && (
          <div className="flex flex-col gap-1" role="alert">
            <span className="text-xs font-medium text-red-400">
              ⚠ {bulkErrors.length} row{bulkErrors.length !== 1 ? 's' : ''} failed to save:
            </span>
            <ul className="text-[11px] text-slate-400 space-y-0.5">
              {bulkErrors.map(e => (
                <li key={e.id}>
                  <strong className="text-slate-300">{e.title}</strong> — {e.error}
                </li>
              ))}
            </ul>
            <button
              id="dismiss-errors-btn"
              className="text-[11px] text-slate-400 hover:text-slate-200 underline self-start cursor-pointer mt-0.5"
              onClick={onDismissErrors}
              type="button"
            >
              Dismiss
            </button>
          </div>
        )}
      </div>

      <div className="shrink-0">
        {dirtyCount > 0 && (
          <button
            id="save-all-btn"
            className="flex items-center gap-2 h-9 px-4 bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs rounded-lg transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={onSaveAll}
            disabled={isBulkSaving}
            type="button"
          >
            {isBulkSaving ? (
              <><span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving…</>
            ) : (
              <>Save all changed ({dirtyCount})</>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
