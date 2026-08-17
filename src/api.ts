import type { Product, ProductsResponse, Category } from './types';

const BASE = 'https://dummyjson.com';
export const PAGE_LIMIT = 20;

interface SearchParams {
  query: string;
  category: string;
  sortBy: string;
  order: string;
  skip: number;
  limit?: number;
}

/**
 * Fetch a page of products.
 * Uses /products/category/:slug when category is set, otherwise /products/search.
 */
export async function searchProducts(
  params: SearchParams,
  signal: AbortSignal
): Promise<ProductsResponse> {
  const { query, category, sortBy, order, skip, limit = PAGE_LIMIT } = params;

  const qs = new URLSearchParams({
    limit: String(limit),
    skip: String(skip),
    sortBy,
    order,
  });

  let url: string;
  if (category) {
    url = `${BASE}/products/category/${encodeURIComponent(category)}?${qs}`;
  } else {
    qs.set('q', query);
    url = `${BASE}/products/search?${qs}`;
  }

  const res = await fetch(url, { signal });
  if (!res.ok) throw new Error(`Server error ${res.status}`);
  return res.json() as Promise<ProductsResponse>;
}

/** Fetch the full list of product categories. */
export async function fetchCategories(): Promise<Category[]> {
  const res = await fetch(`${BASE}/products/categories`);
  if (!res.ok) throw new Error(`Server error ${res.status}`);
  return res.json() as Promise<Category[]>;
}

/**
 * Save a partial product update.
 * Only sends the fields that changed (caller is responsible for building the patch).
 * Returns the server-echoed updated product.
 */
export async function saveProduct(
  id: number,
  patch: Record<string, string | number>,
  signal?: AbortSignal
): Promise<Product> {
  const res = await fetch(`${BASE}/products/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(patch),
    signal,
  });
  if (!res.ok) throw new Error(`Server error ${res.status}`);
  return res.json() as Promise<Product>;
}
