import { CustomerFields } from './Customer';
import { ProductFields } from './Product';
import { OrderFields } from './Order';
import { OrderItemFields } from './OrderItem';
import { ImportOrderFields } from './ImportOrder';
import { ImportItemFields } from './ImportItem';
import { ImportOrderResaleFields } from './ImportOrderResale';
import { ImportOrderResaleItemFields } from './ImportOrderResaleItem';
import { OrderResaleFields } from './OrderResale';
import { OrderResaleItemFields } from './OrderResaleItem';

/**
 * Select fragment: order with its items and nested products.
 */
export const OrderSelectWithItems = `
  *,
  order_items (
    ${OrderItemFields.ID},
    ${OrderItemFields.PRODUCT_ID},
    ${OrderItemFields.QUANTITY},
    ${OrderItemFields.SELLING_PRICE},
    products (
      ${ProductFields.ID},
      ${ProductFields.NAME},
      ${ProductFields.SKU},
      ${ProductFields.IMAGE_URL}
    )
  )
`;

/**
 * Select fragment: order with customer and items.
 */
export const OrderSelectWithCustomerAndItems = `
  *,
  customers (
    ${CustomerFields.ID},
    ${CustomerFields.NAME},
    ${CustomerFields.ID_NUMBER},
    ${CustomerFields.PHONE},
    ${CustomerFields.EMAIL},
    ${CustomerFields.ID_ISSUED_DATE},
    ${CustomerFields.ADDRESS}
  ),
  order_items (
    ${OrderItemFields.ID},
    ${OrderItemFields.PRODUCT_ID},
    ${OrderItemFields.QUANTITY},
    ${OrderItemFields.SELLING_PRICE},
    products (
      ${ProductFields.ID},
      ${ProductFields.NAME},
      ${ProductFields.SKU}
    )
  )
`;

/**
 * Select fragment: order items with product and order info for sales reports.
 */
export const ProductSalesSelect = `
  ${OrderItemFields.QUANTITY},
  ${OrderItemFields.SELLING_PRICE},
  products!inner (
    ${ProductFields.ID},
    ${ProductFields.NAME},
    ${ProductFields.SKU}
  ),
  orders!inner (
    ${OrderFields.CREATED_DATE}
  )
`;

/**
 * Lightweight selects for cashflow analytics.
 */
export const RevenueOrderSelect = `
  ${OrderFields.ID},
  ${OrderFields.CREATED_DATE},
  ${OrderFields.TOTAL_AMOUNT},
  ${OrderFields.STATUS}
`;

export const RevenueImportOrderSelect = `
  ${ImportOrderFields.ID},
  ${ImportOrderFields.IMPORT_DATE},
  ${ImportOrderFields.TOTAL_AMOUNT},
  ${ImportOrderFields.STATUS},
  ${ImportOrderFields.SOURCE_TYPE}
`;

export const RevenueOrderResaleSelect = `
  ${OrderResaleFields.ID},
  ${OrderResaleFields.RESALE_DATE},
  ${OrderResaleFields.TOTAL_AMOUNT},
  ${OrderResaleFields.STATUS}
`;

export const RevenueImportOrderResaleSelect = `
  ${ImportOrderResaleFields.ID},
  ${ImportOrderResaleFields.RESALE_DATE},
  ${ImportOrderResaleFields.TOTAL_AMOUNT},
  ${ImportOrderResaleFields.STATUS}
`;

export const DueSoonOrderSelect = `
  ${OrderFields.ID},
  ${OrderFields.CUSTOMER_NAME},
  ${OrderFields.ORDER_TYPE},
  ${OrderFields.EXPECTED_DELIVERY_DATE},
  ${OrderFields.TOTAL_AMOUNT},
  ${OrderFields.STATUS}
`;

export const DueSoonImportOrderSelect = `
  ${ImportOrderFields.ID},
  ${ImportOrderFields.SOURCE_TYPE},
  ${ImportOrderFields.ANCARAT_INVOICE_NUMBER},
  ${ImportOrderFields.EXPECTED_RETURN_DATE},
  ${ImportOrderFields.TOTAL_AMOUNT},
  ${ImportOrderFields.STATUS}
`;

/**
 * Select fragment: import order with its items and nested products.
 */
export const ImportOrderSelectWithItems = `
  *,
  import_items (
    ${ImportItemFields.ID},
    ${ImportItemFields.PRODUCT_ID},
    ${ImportItemFields.QUANTITY},
    ${ImportItemFields.IMPORT_PRICE},
    products (
      ${ProductFields.ID},
      ${ProductFields.NAME},
      ${ProductFields.SKU},
      ${ProductFields.IMAGE_URL}
    )
  )
`;

/**
 * Select fragment: import items with product and import order info for reports.
 */
export const ImportItemSelectWithProductAndOrder = `
  ${ImportItemFields.QUANTITY},
  ${ImportItemFields.IMPORT_PRICE},
  products!inner (
    ${ProductFields.ID},
    ${ProductFields.NAME},
    ${ProductFields.SKU}
  ),
  import_orders!inner (
    ${ImportOrderFields.IMPORT_DATE},
    ${ImportOrderFields.SOURCE_TYPE}
  )
`;

/**
 * Optimized select fragment: import orders for analytics (no item details).
 */
export const ImportOrderSelectForAnalytics = `
  ${ImportOrderFields.ID},
  ${ImportOrderFields.IMPORT_DATE},
  ${ImportOrderFields.TOTAL_AMOUNT},
  ${ImportOrderFields.STATUS},
  ${ImportOrderFields.SOURCE_TYPE}
`;

/**
 * Select fragment: order resale with original order and resale items.
 */
export const OrderResaleSelectWithItems = `
  *,
  orders (
    ${OrderFields.ID},
    ${OrderFields.STATUS},
    ${OrderFields.ORDER_TYPE},
    ${OrderFields.EXPECTED_DELIVERY_DATE}
  ),
  order_resale_items (
    ${OrderResaleItemFields.ID},
    ${OrderResaleItemFields.ORDER_ITEM_ID},
    ${OrderResaleItemFields.PRODUCT_ID},
    ${OrderResaleItemFields.QUANTITY},
    ${OrderResaleItemFields.RESALE_PRICE},
    products (
      ${ProductFields.ID},
      ${ProductFields.NAME},
      ${ProductFields.SKU},
      ${ProductFields.IMAGE_URL}
    )
  )
`;

/**
 * Lightweight select for existence checks and list pages.
 */
export const OrderResaleSelectSummary = `
  ${OrderResaleFields.ID},
  ${OrderResaleFields.ORDER_ID},
  ${OrderResaleFields.RESALE_DATE},
  ${OrderResaleFields.STATUS},
  ${OrderResaleFields.TOTAL_AMOUNT},
  ${OrderResaleFields.EXPECTED_PAYMENT_DATE},
  ${OrderResaleFields.PAID_AT},
  ${OrderResaleFields.CUSTOMER_NAME},
  ${OrderResaleFields.CUSTOMER_PHONE},
  ${OrderResaleFields.CREATED_BY}
`;

export const ImportOrderResaleSelectWithItems = `
  *,
  import_orders (
    ${ImportOrderFields.ID},
    ${ImportOrderFields.STATUS},
    ${ImportOrderFields.SOURCE_TYPE},
    ${ImportOrderFields.EXPECTED_RETURN_DATE}
  ),
  import_order_resale_items (
    ${ImportOrderResaleItemFields.ID},
    ${ImportOrderResaleItemFields.IMPORT_ITEM_ID},
    ${ImportOrderResaleItemFields.PRODUCT_ID},
    ${ImportOrderResaleItemFields.QUANTITY},
    ${ImportOrderResaleItemFields.RESALE_PRICE},
    products (
      ${ProductFields.ID},
      ${ProductFields.NAME},
      ${ProductFields.SKU},
      ${ProductFields.IMAGE_URL}
    )
  )
`;

export const ImportOrderResaleSelectSummary = `
  ${ImportOrderResaleFields.ID},
  ${ImportOrderResaleFields.IMPORT_ORDER_ID},
  ${ImportOrderResaleFields.RESALE_DATE},
  ${ImportOrderResaleFields.STATUS},
  ${ImportOrderResaleFields.TOTAL_AMOUNT},
  ${ImportOrderResaleFields.EXPECTED_RECEIVED_DATE},
  ${ImportOrderResaleFields.RECEIVED_AT},
  ${ImportOrderResaleFields.ANCARAT_INVOICE_NUMBER},
  ${ImportOrderResaleFields.CREATED_BY}
`;
