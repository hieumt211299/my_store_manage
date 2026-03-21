import type { Order } from './Order';
import type { OrderResaleItem, OrderResaleItemForm } from './OrderResaleItem';
import { createOrderResaleItemFromOrderItem } from './OrderResaleItem';

export const OrderResaleStatus = {
  PENDING_PAYMENT: 'pending_payment',
  PAID: 'paid',
} as const;

export type OrderResaleStatusValue = (typeof OrderResaleStatus)[keyof typeof OrderResaleStatus];

export const OrderResaleStatusLabels: Record<OrderResaleStatusValue, string> = {
  [OrderResaleStatus.PENDING_PAYMENT]: 'Chờ chuyển tiền',
  [OrderResaleStatus.PAID]: 'Đã chuyển tiền',
};

export const OrderResaleStatusBadgeColors: Record<OrderResaleStatusValue, string> = {
  [OrderResaleStatus.PENDING_PAYMENT]: 'bg-yellow-100 text-yellow-800',
  [OrderResaleStatus.PAID]: 'bg-green-100 text-green-800',
};

export interface OrderResale {
  id: number;
  order_id: number;
  resale_date: string;
  status: string;
  total_amount: number;
  expected_payment_date: string;
  paid_at: string | null;
  bank_name: string;
  bank_account_number: string;
  bank_account_holder: string;
  customer_name: string;
  customer_phone: string;
  customer_id_number: string;
  created_by: string | null;
  created_at: string | null;
  updated_at: string | null;
  order_resale_items?: OrderResaleItem[];
  orders?: Order;
}

export interface OrderResaleForm {
  orderId: number;
  resaleDate: string;
  status: string;
  expectedPaymentDate: string;
  bankName: string;
  bankAccountNumber: string;
  bankAccountHolder: string;
  customerName: string;
  customerPhone: string;
  customerIdNumber: string;
  createdBy: string;
  items: OrderResaleItemForm[];
}

export const OrderResaleFields = {
  ID: 'id',
  ORDER_ID: 'order_id',
  RESALE_DATE: 'resale_date',
  STATUS: 'status',
  TOTAL_AMOUNT: 'total_amount',
  EXPECTED_PAYMENT_DATE: 'expected_payment_date',
  PAID_AT: 'paid_at',
  BANK_NAME: 'bank_name',
  BANK_ACCOUNT_NUMBER: 'bank_account_number',
  BANK_ACCOUNT_HOLDER: 'bank_account_holder',
  CUSTOMER_NAME: 'customer_name',
  CUSTOMER_PHONE: 'customer_phone',
  CUSTOMER_ID_NUMBER: 'customer_id_number',
  CREATED_BY: 'created_by',
  CREATED_AT: 'created_at',
  UPDATED_AT: 'updated_at',
} as const;

const addDays = (dateString: string, days: number): string => {
  const nextDate = new Date(dateString);
  nextDate.setDate(nextDate.getDate() + days);
  return nextDate.toISOString().split('T')[0];
};

export const createOrderResaleFormFromOrder = (
  order: Order,
  userEmail: string = 'Admin',
): OrderResaleForm => {
  const resaleDate = new Date().toISOString().split('T')[0];

  return {
    orderId: order.id,
    resaleDate,
    status: OrderResaleStatus.PENDING_PAYMENT,
    expectedPaymentDate: addDays(resaleDate, 4),
    bankName: '',
    bankAccountNumber: '',
    bankAccountHolder: '',
    customerName: order.customer_name,
    customerPhone: order.customer_phone,
    customerIdNumber: order.customer_id_number,
    createdBy: userEmail,
    items: (order.order_items || []).map(createOrderResaleItemFromOrderItem),
  };
};

export const calculateOrderResaleTotal = (items: OrderResaleItemForm[]): number =>
  items.reduce((sum, item) => sum + item.subtotal, 0);

export const buildOrderResaleInsertPayload = (
  form: OrderResaleForm,
  totalAmount: number,
  userEmail: string,
): Omit<OrderResale, 'id' | 'created_at' | 'updated_at' | 'paid_at' | 'order_resale_items' | 'orders'> => ({
  order_id: form.orderId,
  resale_date: form.resaleDate,
  status: form.status,
  total_amount: totalAmount,
  expected_payment_date: form.expectedPaymentDate,
  bank_name: form.bankName.trim(),
  bank_account_number: form.bankAccountNumber.trim(),
  bank_account_holder: form.bankAccountHolder.trim(),
  customer_name: form.customerName,
  customer_phone: form.customerPhone,
  customer_id_number: form.customerIdNumber,
  created_by: form.createdBy || userEmail,
});

export const getOrderResaleStatusDisplay = (status: string): string =>
  OrderResaleStatusLabels[status as OrderResaleStatusValue] || OrderResaleStatusLabels[OrderResaleStatus.PENDING_PAYMENT];

export const getOrderResaleStatusBadgeColor = (status: string): string =>
  OrderResaleStatusBadgeColors[status as OrderResaleStatusValue] || OrderResaleStatusBadgeColors[OrderResaleStatus.PENDING_PAYMENT];
