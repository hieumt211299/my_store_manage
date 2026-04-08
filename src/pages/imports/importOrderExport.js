import * as XLSX from 'xlsx';
import {
  ImportItemFields,
  ImportOrderFields,
  ProductFields,
  formatDate,
  getImportSourceTypeLabel,
  getImportStatusDisplay,
} from '../../models';

export const mapImportOrdersToExportRows = (importOrders = []) =>
  importOrders.flatMap((importOrder) => {
    const items = importOrder.import_items?.length ? importOrder.import_items : [null];

    return items.map((item) => {
      const quantity = item?.[ImportItemFields.QUANTITY] ?? '';
      const unitPrice = item?.[ImportItemFields.IMPORT_PRICE] ?? '';
      const lineTotal =
        typeof quantity === 'number' && typeof unitPrice === 'number'
          ? quantity * unitPrice
          : '';

      return {
        'Mã đơn nhập': importOrder[ImportOrderFields.ID],
        'Nguồn nhập': getImportSourceTypeLabel(importOrder[ImportOrderFields.SOURCE_TYPE]),
        'Trạng thái': getImportStatusDisplay(importOrder[ImportOrderFields.STATUS]),
        'Ngày nhập': formatDate(importOrder[ImportOrderFields.IMPORT_DATE], ''),
        'Ngày dự kiến trả': formatDate(importOrder[ImportOrderFields.EXPECTED_RETURN_DATE], ''),
        'Ngày trả thực tế': formatDate(importOrder[ImportOrderFields.ACTUAL_RETURN_DATE], ''),
        'Tổng tiền đơn': importOrder[ImportOrderFields.TOTAL_AMOUNT] ?? '',
        'Người tạo': importOrder[ImportOrderFields.CREATED_BY] || '',
        'Số hóa đơn Ancarat': importOrder[ImportOrderFields.ANCARAT_INVOICE_NUMBER] || '',
        'Thu ngân Ancarat': importOrder[ImportOrderFields.ANCARAT_CASHIER_NAME] || '',
        'CCCD người bán': importOrder[ImportOrderFields.SELLER_ID_NUMBER] || '',
        'Tên người bán': importOrder[ImportOrderFields.SELLER_NAME] || '',
        'Số điện thoại người bán': importOrder[ImportOrderFields.SELLER_PHONE] || '',
        'Email người bán': importOrder[ImportOrderFields.SELLER_EMAIL] || '',
        'Địa chỉ người bán': importOrder[ImportOrderFields.SELLER_ADDRESS] || '',
        'Ngày cấp CCCD người bán': formatDate(importOrder[ImportOrderFields.SELLER_ID_ISSUED_DATE], ''),
        'Tên sản phẩm': item?.products?.[ProductFields.NAME] || '',
        SKU: item?.products?.[ProductFields.SKU] || '',
        'Số lượng': quantity,
        'Đơn giá nhập': unitPrice,
        'Thành tiền dòng': lineTotal,
      };
    });
  });

export const getImportOrderExportFileName = (now = new Date()) => {
  const date = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, '0'),
    String(now.getDate()).padStart(2, '0'),
  ].join('');
  const time = [
    String(now.getHours()).padStart(2, '0'),
    String(now.getMinutes()).padStart(2, '0'),
  ].join('');

  return `import-orders-export-${date}-${time}.xlsx`;
};

export const exportImportOrdersToExcel = (importOrders = []) => {
  const worksheet = XLSX.utils.json_to_sheet(mapImportOrdersToExportRows(importOrders));

  worksheet['!cols'] = [
    { wch: 12 },
    { wch: 14 },
    { wch: 20 },
    { wch: 14 },
    { wch: 16 },
    { wch: 16 },
    { wch: 14 },
    { wch: 24 },
    { wch: 18 },
    { wch: 20 },
    { wch: 18 },
    { wch: 24 },
    { wch: 20 },
    { wch: 24 },
    { wch: 28 },
    { wch: 20 },
    { wch: 28 },
    { wch: 18 },
    { wch: 12 },
    { wch: 16 },
    { wch: 16 },
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'ImportOrders');
  XLSX.writeFile(workbook, getImportOrderExportFileName(), { compression: true });
};
