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
      <div className="flex items-center px-2.5 min-w-0 border-r border-slate-800">
        <span className="text-xs text-slate-300 truncate">{value}</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col justify-center px-2 py-1 min-w-0 border-r border-slate-800 relative">
      <input
        id={id}
        className={`w-full h-7 px-2 bg-slate-950 text-slate-100 text-xs rounded border transition-all outline-none ${
          error
            ? 'border-red-500 focus:ring-1 focus:ring-red-500'
            : isDirty
            ? 'border-amber-500/80 bg-amber-500/5 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
            : 'border-slate-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
        }`}
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
        <span id={`${id}-error`} className="text-[10px] text-red-400 mt-0.5 truncate leading-none" role="alert">
          {error}
        </span>
      )}
    </div>
  );
}
