import { useEffect, useRef } from 'react';

interface UnsavedEditsModalProps {
  dirtyCount: number;
  onDiscard: () => void;
  onKeep: () => void;
}

export function UnsavedEditsModal({ dirtyCount, onDiscard, onKeep }: UnsavedEditsModalProps) {
  const keepBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    keepBtnRef.current?.focus();
  }, []);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onKeep();
    }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [onKeep]);

  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      aria-describedby="modal-body"
      onClick={e => { if (e.target === e.currentTarget) onKeep(); }}
    >
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 max-w-md w-full flex flex-col items-center gap-3 text-center shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        <div className="w-12 h-12 text-amber-500 flex items-center justify-center" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="m10.29 3.86-8.49 14.67A2 2 0 0 0 3.52 21h16.96a2 2 0 0 0 1.72-3l-8.49-14.67a2 2 0 0 0-3.44-.47Z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
        </div>

        <h2 id="modal-title" className="text-lg font-semibold text-slate-100">
          Unsaved edits
        </h2>

        <p id="modal-body" className="text-sm text-slate-400 leading-relaxed">
          You have unsaved edits on{' '}
          <strong className="text-slate-200">{dirtyCount} row{dirtyCount !== 1 ? 's' : ''}</strong>.
          <br />
          Loading new results will discard them.
        </p>

        <div className="flex flex-col gap-2 w-full mt-2">
          <button
            id="modal-discard-btn"
            className="w-full h-10 px-4 bg-red-600 hover:bg-red-500 text-white font-medium text-sm rounded-lg transition-colors cursor-pointer"
            onClick={onDiscard}
            type="button"
          >
            Discard edits &amp; load new results
          </button>
          <button
            id="modal-keep-btn"
            ref={keepBtnRef}
            className="w-full h-10 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-slate-100 font-medium text-sm rounded-lg border border-slate-700 transition-colors cursor-pointer"
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
