import type { ImportItem } from './ImportItem';
import type { Product } from './Product';

export interface ImportOrderResaleItem {
  id: number;
  import_order_resale_id: number;
  import_item_id: number;
  product_id: number;
  quantity: number;
  resale_price: number;
  created_at: string | null;
  products?: Product;
}

export interface ImportOrderResaleItemForm {
  importItemId: number;
  productId: number;
  productName: string;
  productSku: string;
  productImageUrl: string;
  quantity: number;
  resalePrice: number;
  subtotal: number;
}

export const ImportOrderResaleItemFields = {
  ID: 'id',
  IMPORT_ORDER_RESALE_ID: 'import_order_resale_id',
  IMPORT_ITEM_ID: 'import_item_id',
  PRODUCT_ID: 'product_id',
  QUANTITY: 'quantity',
  RESALE_PRICE: 'resale_price',
  CREATED_AT: 'created_at',
} as const;

export const createImportOrderResaleItemFromImportItem = (item: ImportItem): ImportOrderResaleItemForm => ({
  importItemId: item.id,
  productId: item.product_id,
  productName: item.products?.name || 'Sản phẩm không xác định',
  productSku: item.products?.sku || '',
  productImageUrl: item.products?.image_url || '',
  quantity: item.quantity,
  resalePrice: item.import_price,
  subtotal: item.quantity * item.import_price,
});

export const updateImportOrderResaleItemSubtotal = (
  item: ImportOrderResaleItemForm,
  resalePrice: number,
): ImportOrderResaleItemForm => ({
  ...item,
  resalePrice,
  subtotal: item.quantity * resalePrice,
});

export const buildImportOrderResaleItemsPayload = (
  items: ImportOrderResaleItemForm[],
  importOrderResaleId: number,
): Pick<ImportOrderResaleItem, 'import_order_resale_id' | 'import_item_id' | 'product_id' | 'quantity' | 'resale_price'>[] =>
  items.map((item) => ({
    import_order_resale_id: importOrderResaleId,
    import_item_id: item.importItemId,
    product_id: item.productId,
    quantity: item.quantity,
    resale_price: item.resalePrice,
  }));
