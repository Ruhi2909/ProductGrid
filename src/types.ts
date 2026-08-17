/** Product item structure returned from DummyJSON API */
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

/** The four columns editable by the user */
export type EditableField = 'title' | 'price' | 'stock' | 'rating';

/** Raw string values entered by the user per row */
export type DraftRecord = Record<EditableField, string>;

/** Edit tracking state per row, keyed by product ID (not index) */
export interface RowEditState {
  draft: DraftRecord;
  errors: Partial<Record<EditableField, string>>;
  dirtyFields: ReadonlySet<EditableField>;
  saveStatus: 'idle' | 'saving' | 'error';
  saveError?: string;
}

/** Map of all active row edits, keyed by product.id */
export type EditMap = Map<number, RowEditState>;

/** Server-side sorting configuration */
export interface SortConfig {
  sortBy: 'title' | 'price' | 'rating' | 'stock';
  order: 'asc' | 'desc';
}

/** Currently committed parameters active in grid view */
export interface CommittedParams {
  query: string;
  category: string;
  sort: SortConfig;
}

/** Response payload from /products endpoints */
export interface ProductsResponse {
  products: Product[];
  total: number;
  skip: number;
  limit: number;
}

/** Product category item */
export interface Category {
  slug: string;
  name: string;
  url: string;
}
