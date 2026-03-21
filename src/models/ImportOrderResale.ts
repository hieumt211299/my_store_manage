import type { ImportOrder } from './ImportOrder';
import type { ImportOrderResaleItem, ImportOrderResaleItemForm } from './ImportOrderResaleItem';
import { createImportOrderResaleItemFromImportItem } from './ImportOrderResaleItem';

export const ImportOrderResaleStatus = {
  PENDING_RECEIPT: 'pending_receipt',
  RECEIVED: 'received',
} as const;

export type ImportOrderResaleStatusValue =
  (typeof ImportOrderResaleStatus)[keyof typeof ImportOrderResaleStatus];

export const ImportOrderResaleStatusLabels: Record<ImportOrderResaleStatusValue, string> = {
  [ImportOrderResaleStatus.PENDING_RECEIPT]: 'Chờ nhận tiền',
  [ImportOrderResaleStatus.RECEIVED]: 'Đã nhận tiền',
};

export const ImportOrderResaleStatusBadgeColors: Record<ImportOrderResaleStatusValue, string> = {
  [ImportOrderResaleStatus.PENDING_RECEIPT]: 'bg-yellow-100 text-yellow-800',
  [ImportOrderResaleStatus.RECEIVED]: 'bg-green-100 text-green-800',
};

export interface ImportOrderResale {
  id: number;
  import_order_id: number;
  resale_date: string;
  status: string;
  total_amount: number;
  expected_received_date: string;
  received_at: string | null;
  ancarat_invoice_number: string | null;
  ancarat_cashier_name: string | null;
  created_by: string | null;
  created_at: string | null;
  updated_at: string | null;
  import_order_resale_items?: ImportOrderResaleItem[];
  import_orders?: ImportOrder;
}

export interface ImportOrderResaleForm {
  importOrderId: number;
  resaleDate: string;
  status: string;
  expectedReceivedDate: string;
  ancaratInvoiceNumber: string;
  ancaratCashierName: string;
  createdBy: string;
  items: ImportOrderResaleItemForm[];
}

export const ImportOrderResaleFields = {
  ID: 'id',
  IMPORT_ORDER_ID: 'import_order_id',
  RESALE_DATE: 'resale_date',
  STATUS: 'status',
  TOTAL_AMOUNT: 'total_amount',
  EXPECTED_RECEIVED_DATE: 'expected_received_date',
  RECEIVED_AT: 'received_at',
  ANCARAT_INVOICE_NUMBER: 'ancarat_invoice_number',
  ANCARAT_CASHIER_NAME: 'ancarat_cashier_name',
  CREATED_BY: 'created_by',
  CREATED_AT: 'created_at',
  UPDATED_AT: 'updated_at',
} as const;

const addDays = (dateString: string, days: number): string => {
  const date = new Date(dateString);
  date.setDate(date.getDate() + days);
  return date.toISOString().split('T')[0];
};

export const createImportOrderResaleFormFromImportOrder = (
  importOrder: ImportOrder,
  userEmail: string = 'Admin',
): ImportOrderResaleForm => {
  const resaleDate = new Date().toISOString().split('T')[0];

  return {
    importOrderId: importOrder.id,
    resaleDate,
    status: ImportOrderResaleStatus.PENDING_RECEIPT,
    expectedReceivedDate: addDays(resaleDate, 4),
    ancaratInvoiceNumber: importOrder.ancarat_invoice_number || '',
    ancaratCashierName: importOrder.ancarat_cashier_name || '',
    createdBy: userEmail,
    items: (importOrder.import_items || []).map(createImportOrderResaleItemFromImportItem),
  };
};

export const calculateImportOrderResaleTotal = (items: ImportOrderResaleItemForm[]): number =>
  items.reduce((sum, item) => sum + item.subtotal, 0);

export const buildImportOrderResaleInsertPayload = (
  form: ImportOrderResaleForm,
  totalAmount: number,
  userEmail: string,
): Omit<
  ImportOrderResale,
  'id' | 'created_at' | 'updated_at' | 'received_at' | 'import_order_resale_items' | 'import_orders'
> => ({
  import_order_id: form.importOrderId,
  resale_date: form.resaleDate,
  status: form.status,
  total_amount: totalAmount,
  expected_received_date: form.expectedReceivedDate,
  ancarat_invoice_number: form.ancaratInvoiceNumber || null,
  ancarat_cashier_name: form.ancaratCashierName || null,
  created_by: form.createdBy || userEmail,
});

export const getImportOrderResaleStatusDisplay = (status: string): string =>
  ImportOrderResaleStatusLabels[status as ImportOrderResaleStatusValue] ||
  ImportOrderResaleStatusLabels[ImportOrderResaleStatus.PENDING_RECEIPT];

export const getImportOrderResaleStatusBadgeColor = (status: string): string =>
  ImportOrderResaleStatusBadgeColors[status as ImportOrderResaleStatusValue] ||
  ImportOrderResaleStatusBadgeColors[ImportOrderResaleStatus.PENDING_RECEIPT];
