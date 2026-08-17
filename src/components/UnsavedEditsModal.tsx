import { useEffect, useRef } from 'react';

interface UnsavedEditsModalProps {
  dirtyCount: number;
  onDiscard: () => void;
  onKeep: () => void;
}

/**
 * Blocking confirmation modal shown when a new search/sort/filter would
 * replace results while there are unsaved edits in the grid.
 */
export function UnsavedEditsModal({ dirtyCount, onDiscard, onKeep }: UnsavedEditsModalProps) {
  const keepBtnRef = useRef<HTMLButtonElement>(null);

  // Focus the "Keep editing" button by default so pressing Enter is safe
  useEffect(() => {
    keepBtnRef.current?.focus();
  }, []);

  // Close on Escape
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onKeep();
    }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [onKeep]);

  return (
    <div
      className="modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      aria-describedby="modal-body"
      onClick={e => { if (e.target === e.currentTarget) onKeep(); }}
    >
      <div className="modal">
        <div className="modal-warning-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="m10.29 3.86-8.49 14.67A2 2 0 0 0 3.52 21h16.96a2 2 0 0 0 1.72-3l-8.49-14.67a2 2 0 0 0-3.44-.47Z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
        </div>

        <h2 id="modal-title" className="modal-title">Unsaved edits</h2>

        <p id="modal-body" className="modal-body">
          You have unsaved edits on{' '}
          <strong>{dirtyCount} row{dirtyCount !== 1 ? 's' : ''}</strong>.
          <br />
          Loading new results will discard them.
        </p>

        <div className="modal-actions">
          <button
            id="modal-discard-btn"
            className="btn btn-danger"
            onClick={onDiscard}
            type="button"
          >
            Discard edits &amp; load new results
          </button>
          <button
            id="modal-keep-btn"
            ref={keepBtnRef}
            className="btn btn-ghost"
            onClick={onKeep}
            type="button"
          >
            Keep editing
          </button>
        </div>
      </div>
    </div>
  );
}
