import type { EditableField } from '../types';

interface EditableCellProps {
  id: string;
  field: EditableField;
  value: string;
  error?: string;
  isDirty?: boolean;
  readOnly?: boolean;
  onChange: (field: EditableField, value: string) => void;
  onBlur?: (field: EditableField) => void;
}

const PLACEHOLDERS: Record<EditableField, string> = {
  title: 'Product title',
  price: '0.00',
  stock: '0',
  rating: '0.0',
};

const INPUT_TYPES: Record<EditableField, string> = {
  title: 'text',
  price: 'number',
  stock: 'number',
  rating: 'number',
};

/** Cell that shows an inline input when not read-only, with live validation feedback. */
export function EditableCell({
  id,
  field,
  value,
  error,
  isDirty,
  readOnly,
  onChange,
  onBlur,
}: EditableCellProps) {
  if (readOnly) {
    return (
      <div className="grid-cell grid-cell--readonly">
        <span className="cell-value">{value}</span>
      </div>
    );
  }

  return (
    <div className={`grid-cell grid-cell--editable${error ? ' grid-cell--error' : ''}${isDirty ? ' grid-cell--dirty' : ''}`}>
      <input
        id={id}
        className="cell-input"
        type={INPUT_TYPES[field]}
        value={value}
        placeholder={PLACEHOLDERS[field]}
        onChange={e => onChange(field, e.target.value)}
        onBlur={() => onBlur?.(field)}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
        step={field === 'price' ? '0.01' : field === 'rating' ? '0.1' : '1'}
        min={field === 'stock' ? '0' : field === 'rating' ? '0' : undefined}
        max={field === 'rating' ? '5' : undefined}
      />
      {error && (
        <span id={`${id}-error`} className="cell-error" role="alert">
          {error}
        </span>
      )}
    </div>
  );
}
