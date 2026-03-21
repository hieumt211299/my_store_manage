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
  stock_quantity?: number; // Legacy compatibility field, kept in sync with available_quantity
  incoming_quantity?: number;
  reserved_quantity?: number;
  available_quantity?: number;
  average_price?: number; // Snapshot weighted average price refreshed when a new import is created
}

export const ProductFields = {
  ID: 'id',
  NAME: 'name',
  SKU: 'sku',
  IMAGE_URL: 'image_url',
  CREATED_AT: 'created_at',
  DELETED_AT: 'deleted_at',
  STOCK_QUANTITY: 'stock_quantity',
  INCOMING_QUANTITY: 'incoming_quantity',
  RESERVED_QUANTITY: 'reserved_quantity',
  AVAILABLE_QUANTITY: 'available_quantity',
  AVERAGE_PRICE: 'average_price',
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
