import type { Customer, CustomerForm } from './Customer';
import type { OrderItem, OrderItemForm } from './OrderItem';
import { createDefaultCustomerForm } from './Customer';

// ── Enums ────────────────────────────────────

export const OrderStatus = {
  RECEIVED: 'received',
  CUSTOMER_HOLDS: 'customer_holds',
  STORE_HOLDS: 'store_holds',
  RESOLD_TO_STORE: 'resold_to_store',
} as const;

export type OrderStatusValue = (typeof OrderStatus)[keyof typeof OrderStatus];

export const OrderStatusLabels: Record<OrderStatusValue, string> = {
  [OrderStatus.RECEIVED]: 'Đã nhận hàng',
  [OrderStatus.CUSTOMER_HOLDS]: 'Khách giữ phiếu',
  [OrderStatus.STORE_HOLDS]: 'Cửa hàng giữ phiếu',
  [OrderStatus.RESOLD_TO_STORE]: 'Đã bán cho cửa hàng',
};

export const OrderStatusOptions = Object.entries(OrderStatusLabels).map(([value, label]) => ({
  value,
  label,
  keywords: label,
}));

export const OrderStatusBadgeColors: Record<OrderStatusValue, string> = {
  [OrderStatus.RECEIVED]: 'bg-green-100 text-green-800',
  [OrderStatus.CUSTOMER_HOLDS]: 'bg-yellow-100 text-yellow-800',
  [OrderStatus.STORE_HOLDS]: 'bg-gray-100 text-gray-800',
  [OrderStatus.RESOLD_TO_STORE]: 'bg-purple-100 text-purple-800',
};

export const OrderStatusChartColors: Record<OrderStatusValue, string> = {
  [OrderStatus.RECEIVED]: '#10B981',
  [OrderStatus.CUSTOMER_HOLDS]: '#F59E0B',
  [OrderStatus.STORE_HOLDS]: '#6B7280',
  [OrderStatus.RESOLD_TO_STORE]: '#7C3AED',
};

export const PaymentMethod = {
  BANK: 'bank',
  CASH: 'cash',
} as const;

export type PaymentMethodValue = (typeof PaymentMethod)[keyof typeof PaymentMethod];

export const PaymentMethodLabels: Record<PaymentMethodValue, string> = {
  [PaymentMethod.BANK]: 'Chuyển khoản',
  [PaymentMethod.CASH]: 'Tiền mặt',
};

export const PaymentMethodBadgeColors: Record<PaymentMethodValue, string> = {
  [PaymentMethod.BANK]: 'bg-blue-100 text-blue-800',
  [PaymentMethod.CASH]: 'bg-green-100 text-green-800',
};

export const CustomerType = {
  ONLINE: 'online',
  OFFLINE: 'offline',
} as const;

export type CustomerTypeValue = (typeof CustomerType)[keyof typeof CustomerType];

export const CustomerTypeLabels: Record<CustomerTypeValue, string> = {
  [CustomerType.ONLINE]: 'Khách online',
  [CustomerType.OFFLINE]: 'Khách offline',
};

export const CustomerTypeBadgeColors: Record<CustomerTypeValue, string> = {
  [CustomerType.ONLINE]: 'bg-blue-100 text-blue-800',
  [CustomerType.OFFLINE]: 'bg-purple-100 text-purple-800',
};

export const CustomerDiscoverySource = {
  FACEBOOK: 'facebook',
  TIKTOK: 'tiktok',
  GOOGLE: 'google',
  FRIEND_REFERRAL: 'friend_referral',
  WALK_IN: 'walk_in',
  RETURNING_CUSTOMER: 'returning_customer',
  OTHER: 'other',
} as const;

export type CustomerDiscoverySourceValue =
  (typeof CustomerDiscoverySource)[keyof typeof CustomerDiscoverySource];

export const CustomerDiscoverySourceLabels: Record<CustomerDiscoverySourceValue, string> = {
  [CustomerDiscoverySource.FACEBOOK]: 'Facebook',
  [CustomerDiscoverySource.TIKTOK]: 'TikTok',
  [CustomerDiscoverySource.GOOGLE]: 'Google',
  [CustomerDiscoverySource.FRIEND_REFERRAL]: 'Bạn bè giới thiệu',
  [CustomerDiscoverySource.WALK_IN]: 'Đi ngang cửa hàng',
  [CustomerDiscoverySource.RETURNING_CUSTOMER]: 'Khách cũ quay lại',
  [CustomerDiscoverySource.OTHER]: 'Nguồn khác',
};

export const CustomerDiscoverySourceOptions = Object.entries(CustomerDiscoverySourceLabels).map(
  ([value, label]) => ({
    value,
    label,
    keywords: label,
  })
);

export const OrderType = {
  ORDER: 'order',
  WARRANTY: 'warranty',
} as const;

export type OrderTypeValue = (typeof OrderType)[keyof typeof OrderType];

export const OrderTypeLabels: Record<OrderTypeValue, string> = {
  [OrderType.ORDER]: 'Đơn hàng',
  [OrderType.WARRANTY]: 'Phiếu đảm bảo',
};

export const OrderTypeBadgeColors: Record<OrderTypeValue, string> = {
  [OrderType.ORDER]: 'bg-blue-100 text-blue-800',
  [OrderType.WARRANTY]: 'bg-orange-100 text-orange-800',
};

// ── Entity ───────────────────────────────────

/**
 * Order entity
 */
export interface Order {
  id: number;
  created_date: string;
  customer_name: string;
  customer_phone: string;
  customer_id_number: string;
  customer_id_issued_date: string | null;
  customer_address: string;
  customer_discovery_source: string | null;
  employee_id: number | null;
  customer_id: number | null;
  customer_type: string | null;
  order_type: string;
  total_amount: number;
  expected_delivery_date: string;
  payment_method: string;
  created_at: string | null;
  created_by: string | null;
  status: string;
  date_received: string | null;
  /** Nested relations – populated via Supabase joins */
  order_items?: OrderItem[];
  customers?: Customer;
}

/** Form-level representation for CreateOrder */
export interface OrderForm {
  createDate: string;
  expectedDeliveryDate: string;
  paymentMethod: string;
  employeeId: string;
  createdBy: string;
  orderType: string;
  customerType: string;
  customerDiscoverySource: string;
  status: string;
  customer: CustomerForm;
  items: OrderItemForm[];
}

export const OrderFields = {
  ID: 'id',
  CREATED_DATE: 'created_date',
  CUSTOMER_NAME: 'customer_name',
  CUSTOMER_PHONE: 'customer_phone',
  CUSTOMER_ID_NUMBER: 'customer_id_number',
  CUSTOMER_ID_ISSUED_DATE: 'customer_id_issued_date',
  CUSTOMER_ADDRESS: 'customer_address',
  CUSTOMER_DISCOVERY_SOURCE: 'customer_discovery_source',
  EMPLOYEE_ID: 'employee_id',
  CUSTOMER_ID: 'customer_id',
  CUSTOMER_TYPE: 'customer_type',
  ORDER_TYPE: 'order_type',
  TOTAL_AMOUNT: 'total_amount',
  EXPECTED_DELIVERY_DATE: 'expected_delivery_date',
  PAYMENT_METHOD: 'payment_method',
  CREATED_AT: 'created_at',
  CREATED_BY: 'created_by',
  STATUS: 'status',
  DATE_RECEIVED: 'date_received',
} as const;

// ── Display helpers ──────────────────────────

export const getStatusDisplay = (status: string): string =>
  OrderStatusLabels[status as OrderStatusValue] || OrderStatusLabels[OrderStatus.STORE_HOLDS];

export const getStatusBadgeColor = (status: string): string =>
  OrderStatusBadgeColors[status as OrderStatusValue] || OrderStatusBadgeColors[OrderStatus.STORE_HOLDS];

export const getPaymentMethodLabel = (method: string): string =>
  PaymentMethodLabels[method as PaymentMethodValue] || method;

export const getPaymentMethodBadgeColor = (method: string): string =>
  PaymentMethodBadgeColors[method as PaymentMethodValue] || '';

export const getCustomerTypeLabel = (type: string): string =>
  CustomerTypeLabels[type as CustomerTypeValue] || type;

export const getCustomerTypeBadgeColor = (type: string): string =>
  CustomerTypeBadgeColors[type as CustomerTypeValue] || '';

export const getOrderTypeLabel = (type: string): string =>
  OrderTypeLabels[type as OrderTypeValue] || OrderTypeLabels[OrderType.ORDER];

export const getOrderTypeBadgeColor = (type: string): string =>
  OrderTypeBadgeColors[type as OrderTypeValue] || OrderTypeBadgeColors[OrderType.ORDER];

// ── Factory / builder helpers ────────────────

const EXPECTED_DELIVERY_OFFSET_DAYS = 95;

export const createDefaultOrderForm = (): OrderForm => {
  const expectedDate = new Date();
  expectedDate.setDate(expectedDate.getDate() + EXPECTED_DELIVERY_OFFSET_DAYS);

  return {
    createDate: new Date().toISOString().split('T')[0],
    expectedDeliveryDate: expectedDate.toISOString().split('T')[0],
    paymentMethod: PaymentMethod.BANK,
    employeeId: '',
    createdBy: '',
    orderType: OrderType.ORDER,
    customerType: CustomerType.ONLINE,
    customerDiscoverySource: '',
    status: OrderStatus.CUSTOMER_HOLDS,
    customer: createDefaultCustomerForm(),
    items: [],
  };
};

/** Create warranty order form with appropriate defaults */
export const createWarrantyOrderForm = (): OrderForm => {
  return {
    createDate: new Date().toISOString().split('T')[0],
    expectedDeliveryDate: new Date().toISOString().split('T')[0], // Current date for warranty
    paymentMethod: PaymentMethod.BANK,
    employeeId: '',
    createdBy: '',
    orderType: OrderType.WARRANTY,
    customerType: CustomerType.ONLINE,
    customerDiscoverySource: '',
    status: OrderStatus.RECEIVED, // Auto received for warranty
    customer: createDefaultCustomerForm(),
    items: [],
  };
};

/** Update order form when order type changes */
export const updateOrderFormForType = (currentForm: OrderForm, orderType: OrderTypeValue): OrderForm => {
  if (orderType === OrderType.WARRANTY) {
    return {
      ...currentForm,
      orderType,
      expectedDeliveryDate: new Date().toISOString().split('T')[0],
      status: OrderStatus.RECEIVED,
    };
  } else {
    // For regular orders
    const expectedDate = new Date();
    expectedDate.setDate(expectedDate.getDate() + EXPECTED_DELIVERY_OFFSET_DAYS);
    
    return {
      ...currentForm,
      orderType,
      expectedDeliveryDate: expectedDate.toISOString().split('T')[0],
      status: OrderStatus.CUSTOMER_HOLDS,
    };
  }
};

/** Builds the insert payload for a new order */
export const buildOrderInsertPayload = (
  orderForm: OrderForm,
  customerId: number,
  totalAmount: number,
  userEmail: string,
): Omit<Order, 'id' | 'created_at' | 'date_received' | 'order_items' | 'customers'> => ({
  created_date: orderForm.createDate,
  customer_id: customerId,
  customer_id_number: orderForm.customer.idNumber,
  customer_name: orderForm.customer.name,
  customer_phone: orderForm.customer.phone,
  customer_id_issued_date: orderForm.customer.idIssuedDate || null,
  customer_address: orderForm.customer.address,
  customer_discovery_source: orderForm.customerDiscoverySource || null,
  employee_id: orderForm.employeeId ? Number(orderForm.employeeId) : null,
  total_amount: totalAmount,
  expected_delivery_date: orderForm.expectedDeliveryDate,
  payment_method: orderForm.paymentMethod,
  order_type: orderForm.orderType,
  created_by: orderForm.createdBy || userEmail,
  customer_type: orderForm.customerType,
  status: orderForm.status,
});

export const getCustomerDiscoverySourceLabel = (source: string | null | undefined): string =>
  source
    ? CustomerDiscoverySourceLabels[source as CustomerDiscoverySourceValue] || source
    : '';
