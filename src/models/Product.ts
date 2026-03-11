/**
 * Product entity
 */
export interface Product {
  id: number;
  name: string;
  sku: string;
  image_url: string | null;
  created_at: string | null;
  deleted_at: string | null;
  stock_quantity?: number; // Optional field for current stock level, not stored in DB but calculated from orders/imports
}

export const ProductFields = {
  ID: 'id',
  NAME: 'name',
  SKU: 'sku',
  IMAGE_URL: 'image_url',
  CREATED_AT: 'created_at',
  DELETED_AT: 'deleted_at',
  STOCK_QUANTITY: 'stock_quantity',

} as const;

// ── Helpers ──────────────────────────────────

/** Builds the insert payload for a new product */
export const buildProductInsertPayload = (
  name: string,
  sku: string,
  imageUrl: string | null,
): Omit<Product, 'id' | 'deleted_at'> => ({
  name,
  sku,
  image_url: imageUrl,
  created_at: new Date().toISOString(),
});
