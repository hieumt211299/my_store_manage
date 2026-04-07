import * as XLSX from 'xlsx';
import {
  CustomerFields,
  OrderFields,
  OrderItemFields,
  ProductFields,
  formatDate,
  getCustomerDiscoverySourceLabel,
  getCustomerTypeLabel,
  getOrderTypeLabel,
  getStatusDisplay,
} from '../../models';

const getCustomerValue = (order, customerField, orderField) => {
  const customerValue = order.customers?.[customerField];

  if (customerValue !== undefined && customerValue !== null && customerValue !== '') {
    return customerValue;
  }

  return order[orderField] ?? '';
};

export const mapOrdersToExportRows = (orders = []) =>
  orders.flatMap((order) => {
    const items = order.order_items?.length ? order.order_items : [null];

    return items.map((item) => {
      const quantity = item?.[OrderItemFields.QUANTITY] ?? '';
      const unitPrice = item?.[OrderItemFields.SELLING_PRICE] ?? '';
      const lineTotal =
        typeof quantity === 'number' && typeof unitPrice === 'number'
          ? quantity * unitPrice
          : '';

      return {
        'Mã đơn': order[OrderFields.ID],
        'Loại phiếu': getOrderTypeLabel(order[OrderFields.ORDER_TYPE]),
        'Trạng thái': getStatusDisplay(order[OrderFields.STATUS]),
        'Ngày tạo': formatDate(order[OrderFields.CREATED_DATE], ''),
        'Ngày giao dự kiến': formatDate(order[OrderFields.EXPECTED_DELIVERY_DATE], ''),
        'Ngày nhận thực tế': formatDate(order[OrderFields.DATE_RECEIVED], ''),
        'Tổng tiền đơn': order[OrderFields.TOTAL_AMOUNT] ?? '',
        'Người tạo': order[OrderFields.CREATED_BY] || '',
        'Mã khách hàng': order[OrderFields.CUSTOMER_ID] ?? '',
        'Tên khách hàng': getCustomerValue(order, CustomerFields.NAME, OrderFields.CUSTOMER_NAME),
        'Số điện thoại': getCustomerValue(order, CustomerFields.PHONE, OrderFields.CUSTOMER_PHONE),
        Email: getCustomerValue(order, CustomerFields.EMAIL, OrderFields.CUSTOMER_EMAIL),
        CCCD: getCustomerValue(order, CustomerFields.ID_NUMBER, OrderFields.CUSTOMER_ID_NUMBER),
        'Ngày cấp CCCD': formatDate(
          getCustomerValue(order, CustomerFields.ID_ISSUED_DATE, OrderFields.CUSTOMER_ID_ISSUED_DATE),
          ''
        ),
        'Địa chỉ': getCustomerValue(order, CustomerFields.ADDRESS, OrderFields.CUSTOMER_ADDRESS),
        'Loại khách hàng': getCustomerTypeLabel(order[OrderFields.CUSTOMER_TYPE] || ''),
        'Nguồn khách hàng': getCustomerDiscoverySourceLabel(
          order[OrderFields.CUSTOMER_DISCOVERY_SOURCE]
        ),
        'Tên sản phẩm': item?.products?.[ProductFields.NAME] || '',
        SKU: item?.products?.[ProductFields.SKU] || '',
        'Số lượng': quantity,
        'Đơn giá bán': unitPrice,
        'Thành tiền dòng': lineTotal,
      };
    });
  });

export const getOrderExportFileName = (now = new Date()) => {
  const date = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, '0'),
    String(now.getDate()).padStart(2, '0'),
  ].join('');
  const time = [
    String(now.getHours()).padStart(2, '0'),
    String(now.getMinutes()).padStart(2, '0'),
  ].join('');

  return `orders-export-${date}-${time}.xlsx`;
};

export const exportOrdersToExcel = (orders = []) => {
  const worksheet = XLSX.utils.json_to_sheet(mapOrdersToExportRows(orders));

  worksheet['!cols'] = [
    { wch: 10 },
    { wch: 16 },
    { wch: 20 },
    { wch: 14 },
    { wch: 16 },
    { wch: 16 },
    { wch: 14 },
    { wch: 24 },
    { wch: 14 },
    { wch: 28 },
    { wch: 16 },
    { wch: 28 },
    { wch: 18 },
    { wch: 14 },
    { wch: 28 },
    { wch: 18 },
    { wch: 18 },
    { wch: 28 },
    { wch: 18 },
    { wch: 12 },
    { wch: 16 },
    { wch: 16 },
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Orders');
  XLSX.writeFile(workbook, getOrderExportFileName(), { compression: true });
};
