// ── Entity interfaces & helpers ───────────────
export { CustomerFields, createDefaultCustomerForm, mapCustomerRowToForm, buildCustomerInsertPayload } from './Customer';
export { ProductFields, buildProductInsertPayload } from './Product';
export { OrderItemFields, createOrderItemFromProduct, buildOrderItemsPayload } from './OrderItem';
export {
  OrderFields,
  OrderStatus, OrderStatusLabels, OrderStatusBadgeColors, OrderStatusChartColors,
  PaymentMethod, PaymentMethodLabels, PaymentMethodBadgeColors,
  CustomerType, CustomerTypeLabels, CustomerTypeBadgeColors,
  OrderType, OrderTypeLabels, OrderTypeBadgeColors,
  createDefaultOrderForm, createWarrantyOrderForm, updateOrderFormForType, buildOrderInsertPayload,
  getStatusDisplay, getStatusBadgeColor,
  getPaymentMethodLabel, getPaymentMethodBadgeColor,
  getCustomerTypeLabel, getCustomerTypeBadgeColor,
  getOrderTypeLabel, getOrderTypeBadgeColor,
} from './Order';
export { ImportItemFields, createImportItemFromProduct, buildImportItemsPayload, mapImportItemRowToForm, updateImportItemSubtotal, calculateImportTotal } from './ImportItem';
export {
  ImportOrderFields,
  ImportOrderStatus, ImportOrderStatusLabels, ImportOrderStatusBadgeColors,
  ImportOrderSourceType, ImportOrderSourceTypeLabels, ImportOrderSourceTypeBadgeColors,
  createDefaultImportOrderForm, buildImportOrderInsertPayload, mapImportOrderRowToForm, validateImportOrderForm,
  getImportStatusDisplay, getImportStatusBadgeColor,
  getImportSourceTypeLabel, getImportSourceTypeBadgeColor,
} from './ImportOrder';

// ── Types (re-export for convenience) ────────
export type { Customer, CustomerForm } from './Customer';
export type { Product } from './Product';
export type { OrderItem, OrderItemForm } from './OrderItem';
export type { Order, OrderForm, OrderStatusValue, PaymentMethodValue, CustomerTypeValue, OrderTypeValue } from './Order';
export type { ImportItem, ImportItemForm } from './ImportItem';
export type { ImportOrder, ImportOrderForm, ImportOrderStatusValue, ImportOrderSourceTypeValue } from './ImportOrder';

// ── Shared constants ─────────────────────────
export { Tables, StorageBuckets } from './constants';

// ── Formatting utilities ─────────────────────
export { formatCurrency, formatDate, formatDateTime } from './formatters';

// ── Query fragments ──────────────────────────
export { OrderSelectWithItems, OrderSelectWithCustomerAndItems, ProductSalesSelect, ImportOrderSelectWithItems, ImportItemSelectWithProductAndOrder } from './queries';
