import { CustomerFields } from './Customer';
import { ProductFields } from './Product';
import { OrderFields } from './Order';
import { OrderItemFields } from './OrderItem';
import { ImportOrderFields } from './ImportOrder';
import { ImportItemFields } from './ImportItem';

/**
 * Select fragment: order with its items and nested products.
 */
export const OrderSelectWithItems = `
  *,
  order_items (
    ${OrderItemFields.ID},
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
 * Select fragment: order with customer (inner join) and items.
 */
export const OrderSelectWithCustomerAndItems = `
  *,
  customers!inner (
    ${CustomerFields.ID},
    ${CustomerFields.NAME},
    ${CustomerFields.ID_NUMBER},
    ${CustomerFields.PHONE}
  ),
  order_items (
    ${OrderItemFields.ID},
    ${OrderItemFields.QUANTITY},
    ${OrderItemFields.SELLING_PRICE},
    products (
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
 * Select fragment: import order with its items and nested products.
 */
export const ImportOrderSelectWithItems = `
  *,
  import_items (
    ${ImportItemFields.ID},
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
