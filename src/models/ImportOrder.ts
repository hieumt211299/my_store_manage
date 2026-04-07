import type { ImportItem, ImportItemForm } from './ImportItem.ts';

// ── Enums ────────────────────────────────────

export const ImportOrderStatus = {
  PENDING: 'pending',
  COMPLETED: 'completed',
  RESOLD_TO_ANCARAT: 'resold_to_ancarat',
} as const;

export type ImportOrderStatusValue = (typeof ImportOrderStatus)[keyof typeof ImportOrderStatus];

export const ImportOrderStatusLabels: Record<ImportOrderStatusValue, string> = {
  [ImportOrderStatus.PENDING]: 'Chưa hoàn thành',
  [ImportOrderStatus.COMPLETED]: 'Đã hoàn thành',
  [ImportOrderStatus.RESOLD_TO_ANCARAT]: 'Đã bán lại cho Ancarat',
};

export const ImportOrderStatusBadgeColors: Record<ImportOrderStatusValue, string> = {
  [ImportOrderStatus.PENDING]: 'bg-yellow-100 text-yellow-800',
  [ImportOrderStatus.COMPLETED]: 'bg-green-100 text-green-800',
  [ImportOrderStatus.RESOLD_TO_ANCARAT]: 'bg-purple-100 text-purple-800',
};

export const ImportOrderSourceType = {
  ANCARAT: 'ancarat',
  CUSTOMER: 'customer',
} as const;

export type ImportOrderSourceTypeValue = (typeof ImportOrderSourceType)[keyof typeof ImportOrderSourceType];

export const ImportOrderSourceTypeLabels: Record<ImportOrderSourceTypeValue, string> = {
  [ImportOrderSourceType.ANCARAT]: 'Ancarat',
  [ImportOrderSourceType.CUSTOMER]: 'Khách bán',
};

export const ImportOrderSourceTypeBadgeColors: Record<ImportOrderSourceTypeValue, string> = {
  [ImportOrderSourceType.ANCARAT]: 'bg-blue-100 text-blue-800',
  [ImportOrderSourceType.CUSTOMER]: 'bg-purple-100 text-purple-800',
};

// ── Entity ───────────────────────────────────

/**
 * Import Order entity (database row representation)
 */
export interface ImportOrder {
  id: number;
  source_type: string;
  status: string;
  import_date: string;
  total_amount: number;
  created_by: string | null;
  created_at: string | null;
  updated_at: string | null;
  
  // Ancarat specific fields
  ancarat_invoice_number: string | null;
  ancarat_cashier_name: string | null;
  expected_return_date: string | null;
  actual_return_date: string | null;
  
  // Customer seller specific fields
  seller_id_number: string | null;
  seller_name: string | null;
  seller_phone: string | null;
  seller_email: string | null;
  seller_address: string | null;
  seller_id_issued_date: string | null;
  
  /** Nested relations – populated via Supabase joins */
  import_items?: ImportItem[];
}

/** Form-level representation for CreateImport */
export interface ImportOrderForm {
  sourceType: string;
  importDate: string;
  createdBy: string;
  status: string;
  
  // Ancarat form fields
  ancaratInvoiceNumber: string;
  ancaratCashierName: string;
  expectedReturnDate: string;
  
  // Customer seller form fields
  seller: {
    idNumber: string;
    name: string;
    phone: string;
    email: string;
    address: string;
    idIssuedDate: string;
  };
  
  items: ImportItemForm[];
}

export const ImportOrderFields = {
  ID: 'id',
  SOURCE_TYPE: 'source_type',
  STATUS: 'status',
  IMPORT_DATE: 'import_date',
  TOTAL_AMOUNT: 'total_amount',
  CREATED_BY: 'created_by',
  CREATED_AT: 'created_at',
  UPDATED_AT: 'updated_at',
  ANCARAT_INVOICE_NUMBER: 'ancarat_invoice_number',
  ANCARAT_CASHIER_NAME: 'ancarat_cashier_name',
  EXPECTED_RETURN_DATE: 'expected_return_date',
  ACTUAL_RETURN_DATE: 'actual_return_date',
  SELLER_ID_NUMBER: 'seller_id_number',
  SELLER_NAME: 'seller_name',
  SELLER_PHONE: 'seller_phone',
  SELLER_EMAIL: 'seller_email',
  SELLER_ADDRESS: 'seller_address',
  SELLER_ID_ISSUED_DATE: 'seller_id_issued_date',
} as const;

// ── Display helpers ──────────────────────────

export const getImportStatusDisplay = (status: string): string =>
  ImportOrderStatusLabels[status as ImportOrderStatusValue] || ImportOrderStatusLabels[ImportOrderStatus.PENDING];

export const getImportStatusBadgeColor = (status: string): string =>
  ImportOrderStatusBadgeColors[status as ImportOrderStatusValue] || ImportOrderStatusBadgeColors[ImportOrderStatus.PENDING];

export const getImportSourceTypeLabel = (sourceType: string): string =>
  ImportOrderSourceTypeLabels[sourceType as ImportOrderSourceTypeValue] || sourceType;

export const getImportSourceTypeBadgeColor = (sourceType: string): string =>
  ImportOrderSourceTypeBadgeColors[sourceType as ImportOrderSourceTypeValue] || '';

// ── Factory / builder helpers ────────────────

export const createDefaultImportOrderForm = (userEmail: string = 'Admin'): ImportOrderForm => {
    const EXPECTED_DELIVERY_OFFSET_DAYS = 95;
  const expectedDate = new Date();
  expectedDate.setDate(expectedDate.getDate() + EXPECTED_DELIVERY_OFFSET_DAYS);
  return {
    sourceType: ImportOrderSourceType.ANCARAT,
    importDate: new Date().toISOString().split('T')[0],
    createdBy: userEmail,
    status: ImportOrderStatus.PENDING, // Default for Ancarat
    
    // Ancarat defaults
    ancaratInvoiceNumber: '',
    ancaratCashierName: '',
    expectedReturnDate: expectedDate.toISOString().split('T')[0],
    
    // Customer seller defaults
    seller: {
      idNumber: '',
      name: '',
      phone: '',
      address: '',
      idIssuedDate: '',
    },
    
    items: [],
  };
};

/** Builds the insert payload for a new import order */
export const buildImportOrderInsertPayload = (
  importForm: ImportOrderForm,
  totalAmount: number,
): Omit<ImportOrder, 'id' | 'created_at' | 'updated_at' | 'import_items'> => {
  const basePayload = {
    source_type: importForm.sourceType,
    status: importForm.status,
    import_date: importForm.importDate,
    total_amount: totalAmount,
    created_by: importForm.createdBy,
  };

  if (importForm.sourceType === ImportOrderSourceType.ANCARAT) {
    return {
      ...basePayload,
      ancarat_invoice_number: importForm.ancaratInvoiceNumber,
      ancarat_cashier_name: importForm.ancaratCashierName,
      expected_return_date: importForm.expectedReturnDate,
      // NULL out customer fields
      seller_id_number: null,
      seller_name: null,
      seller_phone: null,
      seller_email: null,
      seller_address: null,
      seller_id_issued_date: null,
    };
  } else {
    return {
      ...basePayload,
      // NULL out Ancarat fields
      ancarat_invoice_number: null,
      ancarat_cashier_name: null,
      expected_return_date: null,
      // Set customer fields
      seller_id_number: importForm.seller.idNumber,
      seller_name: importForm.seller.name,
      seller_phone: importForm.seller.phone,
      seller_email: importForm.seller.email || null,
      seller_address: importForm.seller.address,
      seller_id_issued_date: importForm.seller.idIssuedDate || null,
    };
  }
};

/** Maps database row to form representation */
export const mapImportOrderRowToForm = (importOrder: ImportOrder): ImportOrderForm => ({
  sourceType: importOrder.source_type,
  importDate: importOrder.import_date,
  createdBy: importOrder.created_by || 'Admin',
  status: importOrder.status,
  
  // Ancarat fields
  ancaratInvoiceNumber: importOrder.ancarat_invoice_number || '',
  ancaratCashierName: importOrder.ancarat_cashier_name || '',
  expectedReturnDate: importOrder.expected_return_date || '',
  
  // Customer seller fields
  seller: {
    idNumber: importOrder.seller_id_number || '',
    name: importOrder.seller_name || '',
    phone: importOrder.seller_phone || '',
    email: importOrder.seller_email || '',
    address: importOrder.seller_address || '',
    idIssuedDate: importOrder.seller_id_issued_date || '',
  },
  
  items: importOrder.import_items?.map(item => ({
    productId: item.product_id,
    productName: item.products?.name || '',
    productSku: item.products?.sku || '',
    quantity: item.quantity,
    importPrice: item.import_price,
    subtotal: item.quantity * item.import_price,
  })) || [],
});

// ── Validation helpers ───────────────────────

export const validateImportOrderForm = (form: ImportOrderForm): string[] => {
  const errors: string[] = [];
  
  // Basic validation
  if (!form.sourceType) {
    errors.push('Nguồn nhập không được để trống');
  }
  
  if (!form.importDate) {
    errors.push('Ngày nhập không được để trống');
  }
  
  if (form.items.length === 0) {
    errors.push('Phải có ít nhất 1 sản phẩm');
  }
  
  // Source-specific validation
  if (form.sourceType === ImportOrderSourceType.ANCARAT) {
    if (!form.ancaratInvoiceNumber.trim()) {
      errors.push('Số hóa đơn Ancarat không được để trống');
    }
    
    if (!form.ancaratCashierName.trim()) {
      errors.push('Tên thu ngân không được để trống');
    }
    
    if (!form.expectedReturnDate) {
      errors.push('Ngày trả hàng không được để trống');
    }
  } else if (form.sourceType === ImportOrderSourceType.CUSTOMER) {
    if (!form.seller.idNumber.trim()) {
      errors.push('CMND/CCCD người bán không được để trống');
    }
    
    if (!form.seller.name.trim()) {
      errors.push('Tên người bán không được để trống');
    }
    
    if (!form.seller.phone.trim()) {
      errors.push('Số điện thoại người bán không được để trống');
    }
    
    if (!form.seller.address.trim()) {
      errors.push('Địa chỉ người bán không được để trống');
    }
  }
  
  // Items validation
  form.items.forEach((item, index) => {
    if (item.quantity <= 0) {
      errors.push(`Sản phẩm ${index + 1}: Số lượng phải lớn hơn 0`);
    }
    
    if (item.importPrice < 0) {
      errors.push(`Sản phẩm ${index + 1}: Giá nhập không được âm`);
    }
  });
  
  return errors;
};
