import { useState, useEffect } from 'react';
import { fetchCategories } from '../api';
import type { Category } from '../types';

/** Fetches the category list once on mount. */
export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchCategories()
      .then(data => {
        if (!cancelled) {
          setCategories(data);
          setLoading(false);
        }
      })
      .catch(err => {
        if (!cancelled) {
          setError((err as Error).message);
          setLoading(false);
        }
      });
    return () => { cancelled = true; };
  }, []);

  return { categories, loading, error };
}
