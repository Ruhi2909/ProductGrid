export interface Product {
  id: number;
  title: string;
  price: number;
  stock: number;
  rating: number;
  brand: string;
  category: string;
  thumbnail: string;
  description: string;
  discountPercentage?: number;
}

/** The four fields the user can edit */
export type EditableField = 'title' | 'price' | 'stock' | 'rating';

/** Raw string values inside the active inputs (one per editable field) */
export type DraftRecord = Record<EditableField, string>;

/** Per-row edit state stored in the EditMap, keyed by product.id */
export interface RowEditState {
  /** Raw string values being typed by the user */
  draft: DraftRecord;
  /** Inline validation errors per field */
  errors: Partial<Record<EditableField, string>>;
  /** Fields whose parsed value differs from the original product */
  dirtyFields: ReadonlySet<EditableField>;
  /** Whether a save request is in-flight for this row */
  saveStatus: 'idle' | 'saving' | 'error';
  /** Error message from a failed save */
  saveError?: string;
}

/** Edit state for the whole grid, keyed by product ID */
export type EditMap = Map<number, RowEditState>;

export interface SortConfig {
  sortBy: 'title' | 'price' | 'rating' | 'stock';
  order: 'asc' | 'desc';
}

/** The params that are actually committed (driving the current fetch) */
export interface CommittedParams {
  query: string;
  category: string;
  sort: SortConfig;
}

/** Response shape from DummyJSON /products endpoints */
export interface ProductsResponse {
  products: Product[];
  total: number;
  skip: number;
  limit: number;
}

export interface Category {
  slug: string;
  name: string;
  url: string;
}
