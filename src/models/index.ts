// ── Entity interfaces & helpers ───────────────
export { CustomerFields, createDefaultCustomerForm, mapCustomerRowToForm, buildCustomerInsertPayload } from './Customer';
export { ProductFields, buildProductInsertPayload } from './Product';
export { OrderItemFields, createOrderItemFromProduct, buildOrderItemsPayload } from './OrderItem';
export {
  OrderResaleItemFields,
  createOrderResaleItemFromOrderItem,
  updateOrderResaleItemSubtotal,
  buildOrderResaleItemsPayload,
} from './OrderResaleItem';
export {
  ImportOrderResaleItemFields,
  createImportOrderResaleItemFromImportItem,
  updateImportOrderResaleItemSubtotal,
  buildImportOrderResaleItemsPayload,
} from './ImportOrderResaleItem';
export {
  OrderFields,
  OrderStatus, OrderStatusLabels, OrderStatusOptions, OrderStatusBadgeColors, OrderStatusChartColors,
  PaymentMethod, PaymentMethodLabels, PaymentMethodBadgeColors,
  CustomerType, CustomerTypeLabels, CustomerTypeBadgeColors,
  CustomerDiscoverySource, CustomerDiscoverySourceLabels, CustomerDiscoverySourceOptions,
  OrderType, OrderTypeLabels, OrderTypeBadgeColors,
  createDefaultOrderForm, createWarrantyOrderForm, updateOrderFormForType, buildOrderInsertPayload,
  getStatusDisplay, getStatusBadgeColor,
  getPaymentMethodLabel, getPaymentMethodBadgeColor,
  getCustomerTypeLabel, getCustomerTypeBadgeColor,
  getCustomerDiscoverySourceLabel,
  getOrderTypeLabel, getOrderTypeBadgeColor,
} from './Order';
export {
  OrderResaleFields,
  OrderResaleStatus, OrderResaleStatusLabels, OrderResaleStatusBadgeColors,
  createOrderResaleFormFromOrder, calculateOrderResaleTotal, buildOrderResaleInsertPayload,
  getOrderResaleStatusDisplay, getOrderResaleStatusBadgeColor,
} from './OrderResale';
export { ImportItemFields, createImportItemFromProduct, buildImportItemsPayload, mapImportItemRowToForm, updateImportItemSubtotal, calculateImportTotal } from './ImportItem';
export {
  ImportOrderFields,
  ImportOrderStatus, ImportOrderStatusLabels, ImportOrderStatusBadgeColors,
  ImportOrderSourceType, ImportOrderSourceTypeLabels, ImportOrderSourceTypeBadgeColors,
  createDefaultImportOrderForm, buildImportOrderInsertPayload, mapImportOrderRowToForm, validateImportOrderForm,
  getImportStatusDisplay, getImportStatusBadgeColor,
  getImportSourceTypeLabel, getImportSourceTypeBadgeColor,
} from './ImportOrder';
export {
  ImportOrderResaleFields,
  ImportOrderResaleStatus, ImportOrderResaleStatusLabels, ImportOrderResaleStatusBadgeColors,
  createImportOrderResaleFormFromImportOrder, calculateImportOrderResaleTotal, buildImportOrderResaleInsertPayload,
  getImportOrderResaleStatusDisplay, getImportOrderResaleStatusBadgeColor,
} from './ImportOrderResale';
export {
  EmployeeFields,
  EmployeeRole, EmployeeRoleLabels, EmployeeRoleBadgeColors,
  EmployeeStatus, EmployeeStatusLabels, EmployeeStatusBadgeColors,
  createDefaultEmployeeForm, mapEmployeeRowToForm, buildEmployeeInsertPayload, buildEmployeeUpdatePayload, generateEmployeeCode,
  getRoleDisplay, getRoleBadgeColor, getStatusDisplay as getEmployeeStatusDisplay, getStatusBadgeColor as getEmployeeStatusBadgeColor,
} from './Employee';

// ── Types (re-export for convenience) ────────
export type { Customer, CustomerForm } from './Customer';
export type { Product } from './Product';
export type { OrderItem, OrderItemForm } from './OrderItem';
export type { OrderResaleItem, OrderResaleItemForm } from './OrderResaleItem';
export type { ImportOrderResaleItem, ImportOrderResaleItemForm } from './ImportOrderResaleItem';
export type {
  Order,
  OrderForm,
  OrderStatusValue,
  PaymentMethodValue,
  CustomerTypeValue,
  CustomerDiscoverySourceValue,
  OrderTypeValue,
} from './Order';
export type { OrderResale, OrderResaleForm, OrderResaleStatusValue } from './OrderResale';
export type { ImportItem, ImportItemForm } from './ImportItem';
export type { ImportOrder, ImportOrderForm, ImportOrderStatusValue, ImportOrderSourceTypeValue } from './ImportOrder';
export type { ImportOrderResale, ImportOrderResaleForm, ImportOrderResaleStatusValue } from './ImportOrderResale';
export type { Employee, EmployeeForm, EmployeeRoleValue, EmployeeStatusValue } from './Employee';

// ── Shared constants ─────────────────────────
export { Tables, StorageBuckets } from './constants';

// ── Formatting utilities ─────────────────────
export { formatCurrency, formatDate, formatDateTime, numberToVietnameseCurrencyWords } from './formatters';
export { toTitleCase, capitalize, toUpperCase, toLowerCase, trim } from '../utils/stringHelpers';

// ── Query fragments ──────────────────────────
export {
  OrderSelectWithItems,
  OrderSelectWithCustomerAndItems,
  ProductSalesSelect,
  RevenueOrderSelect,
  RevenueImportOrderSelect,
  RevenueOrderResaleSelect,
  RevenueImportOrderResaleSelect,
  DueSoonOrderSelect,
  DueSoonImportOrderSelect,
  ImportOrderSelectWithItems,
  ImportItemSelectWithProductAndOrder,
  ImportOrderSelectForAnalytics,
  OrderResaleSelectWithItems,
  OrderResaleSelectSummary,
  ImportOrderResaleSelectWithItems,
  ImportOrderResaleSelectSummary,
} from './queries';
