import { CustomerFields } from './Customer';
import { ProductFields } from './Product';
import { OrderFields } from './Order';
import { OrderItemFields } from './OrderItem';

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
