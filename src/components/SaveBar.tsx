
interface SaveBarProps {
  dirtyCount: number;
  isBulkSaving: boolean;
  bulkErrors: { id: number; title: string; error: string }[];
  onSaveAll: () => void;
  onDismissErrors: () => void;
}

/**
 * Sticky bottom bar that appears when any rows have unsaved edits.
 * Handles bulk save with partial failure reporting.
 */
export function SaveBar({
  dirtyCount,
  isBulkSaving,
  bulkErrors,
  onSaveAll,
  onDismissErrors,
}: SaveBarProps) {
  if (dirtyCount === 0 && bulkErrors.length === 0) return null;

  return (
    <div className="save-bar" role="region" aria-label="Save actions">
      <div className="save-bar-left">
        {dirtyCount > 0 && (
          <span className="save-bar-count">
            <span className="dirty-dot" aria-hidden="true" />
            {dirtyCount} unsaved row{dirtyCount !== 1 ? 's' : ''}
          </span>
        )}
        {bulkErrors.length > 0 && (
          <div className="bulk-errors" role="alert">
            <span className="bulk-errors-title">
              ⚠ {bulkErrors.length} row{bulkErrors.length !== 1 ? 's' : ''} failed to save:
            </span>
            <ul className="bulk-errors-list">
              {bulkErrors.map(e => (
                <li key={e.id} className="bulk-error-item">
                  <strong>{e.title}</strong> — {e.error}
                </li>
              ))}
            </ul>
            <button
              id="dismiss-errors-btn"
              className="btn btn-ghost btn--xs"
              onClick={onDismissErrors}
              type="button"
            >
              Dismiss
            </button>
          </div>
        )}
      </div>

      <div className="save-bar-right">
        {dirtyCount > 0 && (
          <button
            id="save-all-btn"
            className="btn btn-primary"
            onClick={onSaveAll}
            disabled={isBulkSaving}
            type="button"
            aria-busy={isBulkSaving}
          >
            {isBulkSaving ? (
              <><span className="btn-spinner" aria-hidden="true" /> Saving…</>
            ) : (
              <>
                <svg viewBox="0 0 16 16" fill="currentColor" width="14" height="14" aria-hidden="true"><path d="M2 1a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V4.5L10.5 1H2zm.5 1H10v3.5h4V14h-11V2zM9 2v3h3.5L9 2z"/></svg>
                Save all changed ({dirtyCount})
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
