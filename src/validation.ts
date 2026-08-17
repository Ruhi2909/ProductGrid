import type { EditableField, DraftRecord } from './types';

/**
 * Validate a single field value.
 * Returns an error message string, or undefined if valid.
 */
export function validateField(field: EditableField, value: string): string | undefined {
  switch (field) {
    case 'title': {
      if (!value) return 'Title is required';
      if (value !== value.trim()) return 'No leading or trailing whitespace';
      if (value.trim().length < 3) return 'Min 3 characters';
      if (value.trim().length > 100) return 'Max 100 characters';
      return undefined;
    }
    case 'price': {
      const trimmed = value.trim();
      if (!trimmed) return 'Price is required';
      if (!/^(\d+\.?\d*|\.\d+)$/.test(trimmed)) return 'Must be a positive number';
      const n = Number(trimmed);
      if (isNaN(n) || n <= 0) return 'Must be greater than 0';
      if (n > 999999) return 'Max 999,999';
      if (/\.(\d{3,})$/.test(trimmed)) return 'Max 2 decimal places';
      return undefined;
    }
    case 'stock': {
      const trimmed = value.trim();
      if (!trimmed) return 'Stock is required';
      if (!/^\d+$/.test(trimmed)) return 'Must be a whole number ≥ 0';
      const n = Number(trimmed);
      if (n > 100000) return 'Max 100,000';
      return undefined;
    }
    case 'rating': {
      const trimmed = value.trim();
      if (!trimmed) return 'Rating is required';
      if (!/^(\d+\.?\d*|\.\d+)$/.test(trimmed)) return 'Must be a number 0–5';
      const n = Number(trimmed);
      if (n < 0 || n > 5) return 'Must be between 0 and 5';
      if (/\.(\d{2,})$/.test(trimmed)) return 'Max 1 decimal place';
      return undefined;
    }
  }
}

/** Validate all editable fields in a draft, returns an errors object. */
export function validateDraft(draft: DraftRecord): Partial<Record<EditableField, string>> {
  const errors: Partial<Record<EditableField, string>> = {};
  const fields: EditableField[] = ['title', 'price', 'stock', 'rating'];
  for (const field of fields) {
    const err = validateField(field, draft[field] ?? '');
    if (err) errors[field] = err;
  }
  return errors;
}

/** Returns true if there are no validation errors. */
export function isRowValid(errors: Partial<Record<EditableField, string>>): boolean {
  return Object.keys(errors).length === 0;
}
