import type { Product } from './Product';

/**
 * OrderItem entity (junction between Order ↔ Product)
 */
export interface OrderItem {
  id: number;
  order_id: number;
  product_id: number;
  quantity: number;
  selling_price: number;
  created_at: string | null;
  /** Nested relation – populated when using Supabase select joins */
  products?: Product;
}

/** Client-side representation used in order forms */
export interface OrderItemForm {
  productId: number;
  productName: string;
  productSku: string;
  quantity: number;
  sellingPrice: number;
  subtotal: number;
}

export const OrderItemFields = {
  ID: 'id',
  ORDER_ID: 'order_id',
  PRODUCT_ID: 'product_id',
  QUANTITY: 'quantity',
  SELLING_PRICE: 'selling_price',
  CREATED_AT: 'created_at',
} as const;

// ── Helpers ──────────────────────────────────

/** Creates a form-level order-item from a selected product */
export const createOrderItemFromProduct = (product: Product): OrderItemForm => ({
  productId: product.id,
  productName: product.name,
  productSku: product.sku,
  quantity: 1,
  sellingPrice: 0,
  subtotal: 0,
});

/** Builds the insert payload for a batch of order items */
export const buildOrderItemsPayload = (
  items: OrderItemForm[],
  orderId: number,
): Pick<OrderItem, 'order_id' | 'product_id' | 'quantity' | 'selling_price'>[] =>
  items.map((item) => ({
    order_id: orderId,
    product_id: item.productId,
    quantity: item.quantity,
    selling_price: item.sellingPrice,
  }));
