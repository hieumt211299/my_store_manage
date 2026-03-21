import type { OrderItem } from './OrderItem';
import type { Product } from './Product';

export interface OrderResaleItem {
  id: number;
  order_resale_id: number;
  order_item_id: number;
  product_id: number;
  quantity: number;
  resale_price: number;
  created_at: string | null;
  products?: Product;
}

export interface OrderResaleItemForm {
  orderItemId: number;
  productId: number;
  productName: string;
  productSku: string;
  productImageUrl: string;
  quantity: number;
  resalePrice: number;
  subtotal: number;
}

export const OrderResaleItemFields = {
  ID: 'id',
  ORDER_RESALE_ID: 'order_resale_id',
  ORDER_ITEM_ID: 'order_item_id',
  PRODUCT_ID: 'product_id',
  QUANTITY: 'quantity',
  RESALE_PRICE: 'resale_price',
  CREATED_AT: 'created_at',
} as const;

export const createOrderResaleItemFromOrderItem = (item: OrderItem): OrderResaleItemForm => ({
  orderItemId: item.id,
  productId: item.product_id,
  productName: item.products?.name || 'Sản phẩm không xác định',
  productSku: item.products?.sku || '',
  productImageUrl: item.products?.image_url || '',
  quantity: item.quantity,
  resalePrice: item.selling_price,
  subtotal: item.quantity * item.selling_price,
});

export const updateOrderResaleItemSubtotal = (
  item: OrderResaleItemForm,
  resalePrice: number,
): OrderResaleItemForm => ({
  ...item,
  resalePrice,
  subtotal: item.quantity * resalePrice,
});

export const buildOrderResaleItemsPayload = (
  items: OrderResaleItemForm[],
  orderResaleId: number,
): Pick<OrderResaleItem, 'order_resale_id' | 'order_item_id' | 'product_id' | 'quantity' | 'resale_price'>[] =>
  items.map((item) => ({
    order_resale_id: orderResaleId,
    order_item_id: item.orderItemId,
    product_id: item.productId,
    quantity: item.quantity,
    resale_price: item.resalePrice,
  }));
