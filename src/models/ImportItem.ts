import type { Product } from './Product';

// ── Entity ───────────────────────────────────

/**
 * Import Item entity (database row representation)
 */
export interface ImportItem {
  id: number;
  import_order_id: number;
  product_id: number;
  quantity: number;
  import_price: number;
  created_at: string | null;
  
  /** Nested relations – populated via Supabase joins */
  products?: Product;
}

/** Form-level representation for import item in CreateImport */
export interface ImportItemForm {
  productId: number;
  productName: string;
  productSku: string;
  quantity: number;
  importPrice: number;
  subtotal: number;
}

export const ImportItemFields = {
  ID: 'id',
  IMPORT_ORDER_ID: 'import_order_id',
  PRODUCT_ID: 'product_id',
  QUANTITY: 'quantity', 
  IMPORT_PRICE: 'import_price',
  CREATED_AT: 'created_at',
} as const;

// ── Factory / builder helpers ────────────────

/** Creates an import item form from a product */
export const createImportItemFromProduct = (product: Product, defaultQuantity: number = 1, defaultPrice: number = 0): ImportItemForm => ({
  productId: product.id,
  productName: product.name,
  productSku: product.sku,
  quantity: defaultQuantity,
  importPrice: defaultPrice,
  subtotal: defaultQuantity * defaultPrice,
});

/** Builds the insert payload for import items */
export const buildImportItemsPayload = (
  importOrderId: number,
  items: ImportItemForm[],
): Omit<ImportItem, 'id' | 'created_at' | 'products'>[] => {
  return items.map(item => ({
    import_order_id: importOrderId,
    product_id: item.productId,
    quantity: item.quantity,
    import_price: item.importPrice,
  }));
};

/** Updates subtotal for an import item form */
export const updateImportItemSubtotal = (item: ImportItemForm): ImportItemForm => ({
  ...item,
  subtotal: item.quantity * item.importPrice,
});

/** Calculates total amount from import items */
export const calculateImportTotal = (items: ImportItemForm[]): number => {
  return items.reduce((total, item) => total + item.subtotal, 0);
};

/** Maps database import item to form representation */
export const mapImportItemRowToForm = (importItem: ImportItem): ImportItemForm => ({
  productId: importItem.product_id,
  productName: importItem.products?.name || '',
  productSku: importItem.products?.sku || '',
  quantity: importItem.quantity,
  importPrice: importItem.import_price,
  subtotal: importItem.quantity * importItem.import_price,
});