// ── Entity interfaces & helpers ───────────────
export { CustomerFields, createDefaultCustomerForm, mapCustomerRowToForm, buildCustomerInsertPayload } from './Customer';
export { ProductFields, buildProductInsertPayload } from './Product';
export { OrderItemFields, createOrderItemFromProduct, buildOrderItemsPayload } from './OrderItem';
export {
  OrderFields,
  OrderStatus, OrderStatusLabels, OrderStatusBadgeColors, OrderStatusChartColors,
  PaymentMethod, PaymentMethodLabels, PaymentMethodBadgeColors,
  CustomerType, CustomerTypeLabels, CustomerTypeBadgeColors,
  createDefaultOrderForm, buildOrderInsertPayload,
  getStatusDisplay, getStatusBadgeColor,
  getPaymentMethodLabel, getPaymentMethodBadgeColor,
  getCustomerTypeLabel, getCustomerTypeBadgeColor,
} from './Order';

// ── Types (re-export for convenience) ────────
export type { Customer, CustomerForm } from './Customer';
export type { Product } from './Product';
export type { OrderItem, OrderItemForm } from './OrderItem';
export type { Order, OrderForm, OrderStatusValue, PaymentMethodValue, CustomerTypeValue } from './Order';

// ── Shared constants ─────────────────────────
export { Tables, StorageBuckets } from './constants';

// ── Formatting utilities ─────────────────────
export { formatCurrency, formatDate, formatDateTime } from './formatters';

// ── Query fragments ──────────────────────────
export { OrderSelectWithItems, OrderSelectWithCustomerAndItems, ProductSalesSelect } from './queries';
