import { supabase } from '../lib/supabase';
import {
  Tables,
  OrderFields,
  OrderItemFields,
  ProductFields,
  ProductSalesSelect,
  RevenueOrderSelect,
  RevenueImportOrderSelect,
  RevenueOrderResaleSelect,
  RevenueImportOrderResaleSelect,
  DueSoonOrderSelect,
  DueSoonImportOrderSelect,
  ImportOrderFields,
  ImportOrderSelectForAnalytics,
  OrderResaleFields,
  ImportOrderResaleFields,
  OrderStatusLabels,
  ImportOrderStatusLabels,
  OrderResaleStatusLabels,
  ImportOrderResaleStatusLabels,
  OrderType,
  OrderStatus,
  ImportOrderStatus,
  ImportOrderSourceType,
} from '../models';

export const CashflowSource = {
  ORDER: 'order',
  IMPORT_ORDER: 'import_order',
  ORDER_RESALE: 'order_resale',
  IMPORT_ORDER_RESALE: 'import_order_resale',
};

export const CashflowDirection = {
  INFLOW: 'inflow',
  OUTFLOW: 'outflow',
};

export const CashflowSourceLabels = {
  [CashflowSource.ORDER]: 'Đơn hàng',
  [CashflowSource.IMPORT_ORDER]: 'Đơn nhập',
  [CashflowSource.ORDER_RESALE]: 'Mua lại đơn khách',
  [CashflowSource.IMPORT_ORDER_RESALE]: 'Bán lại Ancarat',
};

export const CashflowDirectionLabels = {
  [CashflowDirection.INFLOW]: 'Tiền vào',
  [CashflowDirection.OUTFLOW]: 'Tiền ra',
};

export const CashflowSourceColors = {
  [CashflowSource.ORDER]: '#2563EB',
  [CashflowSource.IMPORT_ORDER]: '#F97316',
  [CashflowSource.ORDER_RESALE]: '#DC2626',
  [CashflowSource.IMPORT_ORDER_RESALE]: '#10B981',
};

const getCashflowStatusLabel = (source, status) => {
  if (source === CashflowSource.ORDER) return OrderStatusLabels[status] || status;
  if (source === CashflowSource.IMPORT_ORDER) return ImportOrderStatusLabels[status] || status;
  if (source === CashflowSource.ORDER_RESALE) return OrderResaleStatusLabels[status] || status;
  if (source === CashflowSource.IMPORT_ORDER_RESALE) return ImportOrderResaleStatusLabels[status] || status;
  return status;
};

const normalizeDateValue = (value) => new Date(value).toISOString().split('T')[0];

export const normalizeCashflowTransactions = ({
  orders = [],
  importOrders = [],
  orderResales = [],
  importOrderResales = [],
}) => {
  const normalized = [
    ...orders.map((order) => ({
      source: CashflowSource.ORDER,
      direction: CashflowDirection.INFLOW,
      amount: order[OrderFields.TOTAL_AMOUNT] || 0,
      transaction_date: order[OrderFields.CREATED_DATE],
      status: order[OrderFields.STATUS],
      display_status: getCashflowStatusLabel(CashflowSource.ORDER, order[OrderFields.STATUS]),
      reference_id: order[OrderFields.ID],
    })),
    ...importOrders.map((importOrder) => ({
      source: CashflowSource.IMPORT_ORDER,
      direction: CashflowDirection.OUTFLOW,
      amount: importOrder[ImportOrderFields.TOTAL_AMOUNT] || 0,
      transaction_date: importOrder[ImportOrderFields.IMPORT_DATE],
      status: importOrder[ImportOrderFields.STATUS],
      display_status: getCashflowStatusLabel(CashflowSource.IMPORT_ORDER, importOrder[ImportOrderFields.STATUS]),
      reference_id: importOrder[ImportOrderFields.ID],
    })),
    ...orderResales.map((orderResale) => ({
      source: CashflowSource.ORDER_RESALE,
      direction: CashflowDirection.OUTFLOW,
      amount: orderResale[OrderResaleFields.TOTAL_AMOUNT] || 0,
      transaction_date: orderResale[OrderResaleFields.RESALE_DATE],
      status: orderResale[OrderResaleFields.STATUS],
      display_status: getCashflowStatusLabel(CashflowSource.ORDER_RESALE, orderResale[OrderResaleFields.STATUS]),
      reference_id: orderResale[OrderResaleFields.ID],
    })),
    ...importOrderResales.map((importOrderResale) => ({
      source: CashflowSource.IMPORT_ORDER_RESALE,
      direction: CashflowDirection.INFLOW,
      amount: importOrderResale[ImportOrderResaleFields.TOTAL_AMOUNT] || 0,
      transaction_date: importOrderResale[ImportOrderResaleFields.RESALE_DATE],
      status: importOrderResale[ImportOrderResaleFields.STATUS],
      display_status: getCashflowStatusLabel(
        CashflowSource.IMPORT_ORDER_RESALE,
        importOrderResale[ImportOrderResaleFields.STATUS],
      ),
      reference_id: importOrderResale[ImportOrderResaleFields.ID],
    })),
  ];

  return normalized
    .filter((item) => item.transaction_date)
    .map((item) => ({
      ...item,
      normalized_date: normalizeDateValue(item.transaction_date),
    }))
    .sort((a, b) => {
      const dateDiff = new Date(b.transaction_date) - new Date(a.transaction_date);
      if (dateDiff !== 0) return dateDiff;
      return b.reference_id - a.reference_id;
    });
};

// Date utility functions
export const getDateRanges = () => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  return {
    today:{
       startDate : today,
       endDate : new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999),
    },
    last7Days: {
      startDate: new Date(today.getTime() - 6 * 24 * 60 * 60 * 1000),
      endDate: new Date(today.getTime() + 24 * 60 * 60 * 1000 - 1)
    },
    last30Days: {
      startDate: new Date(today.getTime() - 29 * 24 * 60 * 60 * 1000),
      endDate: new Date(today.getTime() + 24 * 60 * 60 * 1000 - 1)
    },
    thisMonth: {
      startDate: new Date(now.getFullYear(), now.getMonth(), 1),
      endDate: new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999)
    },
    lastMonth: {
      startDate: new Date(now.getFullYear(), now.getMonth() - 1, 1),
      endDate: new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999)
    },
    thisYear: {
      startDate: new Date(now.getFullYear(), 0, 1),
      endDate: new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999)
    }
  };
};

// Format date for SQL queries
export const formatDateForSQL = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
};

// Format date for display
export const formatDateForDisplay = (date) => {
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(date);
};

// formatCurrency is re-exported from models for backwards compatibility
export { formatCurrency } from '../models';

// Format large numbers (K, M notation)
export const formatNumber = (number) => {
  if (number >= 1000000) {
    return (number / 1000000).toFixed(1) + 'M';
  } else if (number >= 1000) {
    return (number / 1000).toFixed(1) + 'K';
  }
  return number.toString();
};

// Get revenue data by date range
export const fetchRevenueData = async (startDate, endDate) => {
  try {
    const start = formatDateForSQL(startDate);
    const end = formatDateForSQL(endDate);

    const [
      { data: orders, error: ordersError },
      { data: importOrders, error: importOrdersError },
      { data: orderResales, error: orderResalesError },
      { data: importOrderResales, error: importOrderResalesError },
    ] = await Promise.all([
      supabase
        .from(Tables.ORDERS)
        .select(RevenueOrderSelect)
        .gte(OrderFields.CREATED_DATE, start)
        .lte(OrderFields.CREATED_DATE, end),
      supabase
        .from(Tables.IMPORT_ORDERS)
        .select(RevenueImportOrderSelect)
        .gte(ImportOrderFields.IMPORT_DATE, start)
        .lte(ImportOrderFields.IMPORT_DATE, end),
      supabase
        .from(Tables.ORDER_RESALES)
        .select(RevenueOrderResaleSelect)
        .gte(OrderResaleFields.RESALE_DATE, start)
        .lte(OrderResaleFields.RESALE_DATE, end),
      supabase
        .from(Tables.IMPORT_ORDER_RESALES)
        .select(RevenueImportOrderResaleSelect)
        .gte(ImportOrderResaleFields.RESALE_DATE, start)
        .lte(ImportOrderResaleFields.RESALE_DATE, end),
    ]);

    if (ordersError) throw ordersError;
    if (importOrdersError) throw importOrdersError;
    if (orderResalesError) throw orderResalesError;
    if (importOrderResalesError) throw importOrderResalesError;

    return normalizeCashflowTransactions({
      orders: orders || [],
      importOrders: importOrders || [],
      orderResales: orderResales || [],
      importOrderResales: importOrderResales || [],
    });
  } catch (error) {
    console.error('Error fetching revenue data:', error);
    throw error;
  }
};

// Get revenue summary metrics
export const getRevenueSummary = (transactions = []) => {
  const baseBreakdown = {
    [CashflowSource.ORDER]: { amount: 0, count: 0 },
    [CashflowSource.IMPORT_ORDER]: { amount: 0, count: 0 },
    [CashflowSource.ORDER_RESALE]: { amount: 0, count: 0 },
    [CashflowSource.IMPORT_ORDER_RESALE]: { amount: 0, count: 0 },
  };

  const summary = transactions.reduce((acc, transaction) => {
    const amount = transaction.amount || 0;

    if (transaction.direction === CashflowDirection.INFLOW) {
      acc.totalInflow += amount;
    } else {
      acc.totalOutflow += amount;
    }

    acc.sourceBreakdown[transaction.source].amount += amount;
    acc.sourceBreakdown[transaction.source].count += 1;
    acc.statusBreakdown[transaction.source] = acc.statusBreakdown[transaction.source] || {};
    acc.statusBreakdown[transaction.source][transaction.status] =
      (acc.statusBreakdown[transaction.source][transaction.status] || 0) + 1;
    acc.totalTransactions += 1;

    return acc;
  }, {
    totalInflow: 0,
    totalOutflow: 0,
    totalTransactions: 0,
    sourceBreakdown: baseBreakdown,
    statusBreakdown: {},
  });

  return {
    ...summary,
    netCashflow: summary.totalInflow - summary.totalOutflow,
  };
};

// Group revenue by date
export const groupRevenueByDate = (transactions = []) => {
  const grouped = transactions.reduce((acc, transaction) => {
    const date = transaction.normalized_date || normalizeDateValue(transaction.transaction_date);
    if (!acc[date]) {
      acc[date] = {
        date,
        inflow: 0,
        outflow: 0,
        net: 0,
        transactions: 0,
      };
    }

    const amount = transaction.amount || 0;
    if (transaction.direction === CashflowDirection.INFLOW) {
      acc[date].inflow += amount;
    } else {
      acc[date].outflow += amount;
    }

    acc[date].net = acc[date].inflow - acc[date].outflow;
    acc[date].transactions += 1;
    return acc;
  }, {});

  return Object.values(grouped).sort((a, b) => new Date(a.date) - new Date(b.date));
};

export const getRevenueSourceDistribution = (transactions = []) =>
  Object.entries(
    transactions.reduce((acc, transaction) => {
      acc[transaction.source] = (acc[transaction.source] || 0) + 1;
      return acc;
    }, {})
  ).map(([source, value]) => ({
    source,
    name: CashflowSourceLabels[source] || source,
    value,
    color: CashflowSourceColors[source] || '#6B7280',
  }));

export const getRevenueStatusDistribution = (transactions = []) =>
  Object.entries(
    transactions.reduce((acc, transaction) => {
      const key = `${transaction.source}:${transaction.status}`;
      if (!acc[key]) {
        acc[key] = {
          source: transaction.source,
          status: transaction.status,
          name: `${CashflowSourceLabels[transaction.source] || transaction.source} - ${transaction.display_status}`,
          value: 0,
          color: CashflowSourceColors[transaction.source] || '#6B7280',
        };
      }
      acc[key].value += 1;
      return acc;
    }, {})
  ).map(([, value]) => value);

export const DueSoonKind = {
  ORDER_DUE: 'order_due',
  IMPORT_PICKUP_DUE: 'import_pickup_due',
};

export const DueSoonKindLabels = {
  [DueSoonKind.ORDER_DUE]: 'Đơn hàng trả khách',
  [DueSoonKind.IMPORT_PICKUP_DUE]: 'Đơn nhập tới ngày lấy',
};

const MS_PER_DAY = 24 * 60 * 60 * 1000;

const getTodayStart = () => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
};

const calculateDaysUntilDue = (dateString) => {
  const dueDate = new Date(`${dateString}T00:00:00`);
  return Math.floor((dueDate.getTime() - getTodayStart().getTime()) / MS_PER_DAY);
};

const normalizeDueSoonItems = ({ orders = [], importOrders = [] }) => {
  const normalized = [
    ...orders.map((order) => ({
      kind: DueSoonKind.ORDER_DUE,
      id: order[OrderFields.ID],
      due_date: order[OrderFields.EXPECTED_DELIVERY_DATE],
      days_until_due: calculateDaysUntilDue(order[OrderFields.EXPECTED_DELIVERY_DATE]),
      status: order[OrderFields.STATUS],
      display_status: OrderStatusLabels[order[OrderFields.STATUS]] || order[OrderFields.STATUS],
      customer_or_source_name: order[OrderFields.CUSTOMER_NAME] || 'Khách chưa rõ',
      total_amount: order[OrderFields.TOTAL_AMOUNT] || 0,
      detail_path: `/orders/${order[OrderFields.ID]}`,
    })),
    ...importOrders.map((importOrder) => ({
      kind: DueSoonKind.IMPORT_PICKUP_DUE,
      id: importOrder[ImportOrderFields.ID],
      due_date: importOrder[ImportOrderFields.EXPECTED_RETURN_DATE],
      days_until_due: calculateDaysUntilDue(importOrder[ImportOrderFields.EXPECTED_RETURN_DATE]),
      status: importOrder[ImportOrderFields.STATUS],
      display_status: ImportOrderStatusLabels[importOrder[ImportOrderFields.STATUS]] || importOrder[ImportOrderFields.STATUS],
      customer_or_source_name: importOrder[ImportOrderFields.ANCARAT_INVOICE_NUMBER] || 'Ancarat',
      total_amount: importOrder[ImportOrderFields.TOTAL_AMOUNT] || 0,
      detail_path: `/imports/${importOrder[ImportOrderFields.ID]}`,
    })),
  ];

  return normalized.sort((a, b) => {
    const overdueWeightA = a.days_until_due < 0 ? 0 : 1;
    const overdueWeightB = b.days_until_due < 0 ? 0 : 1;

    if (overdueWeightA !== overdueWeightB) {
      return overdueWeightA - overdueWeightB;
    }

    if (a.days_until_due !== b.days_until_due) {
      return a.days_until_due - b.days_until_due;
    }

    return b.id - a.id;
  });
};

export const fetchDueSoonData = async (windowDays = 7) => {
  try {
    const today = getTodayStart();
    const endDate = new Date(today.getTime() + windowDays * MS_PER_DAY);
    const endSql = formatDateForSQL(endDate);

    const [
      { data: orders, error: ordersError },
      { data: importOrders, error: importOrdersError },
    ] = await Promise.all([
      supabase
        .from(Tables.ORDERS)
        .select(DueSoonOrderSelect)
        .eq(OrderFields.ORDER_TYPE, OrderType.ORDER)
        .not(OrderFields.EXPECTED_DELIVERY_DATE, 'is', null)
        .not(OrderFields.STATUS, 'in', `(${OrderStatus.RECEIVED},${OrderStatus.RESOLD_TO_STORE})`)
        .lte(OrderFields.EXPECTED_DELIVERY_DATE, endSql),
      supabase
        .from(Tables.IMPORT_ORDERS)
        .select(DueSoonImportOrderSelect)
        .eq(ImportOrderFields.SOURCE_TYPE, ImportOrderSourceType.ANCARAT)
        .not(ImportOrderFields.EXPECTED_RETURN_DATE, 'is', null)
        .not(ImportOrderFields.STATUS, 'in', `(${ImportOrderStatus.COMPLETED},${ImportOrderStatus.RESOLD_TO_ANCARAT})`)
        .lte(ImportOrderFields.EXPECTED_RETURN_DATE, endSql),
    ]);

    if (ordersError) throw ordersError;
    if (importOrdersError) throw importOrdersError;

    return normalizeDueSoonItems({
      orders: (orders || []).filter((order) => order[OrderFields.EXPECTED_DELIVERY_DATE] <= endSql && order[OrderFields.EXPECTED_DELIVERY_DATE] >= '0001-01-01'),
      importOrders: (importOrders || []).filter((importOrder) => importOrder[ImportOrderFields.EXPECTED_RETURN_DATE] <= endSql && importOrder[ImportOrderFields.EXPECTED_RETURN_DATE] >= '0001-01-01'),
    });
  } catch (error) {
    console.error('Error fetching due soon data:', error);
    throw error;
  }
};

export const getDueSoonSummary = (items = []) => {
  const summary = items.reduce((acc, item) => {
    acc.total += 1;

    if (item.days_until_due < 0) {
      acc.overdue += 1;
    } else if (item.days_until_due <= 3) {
      acc.next3Days += 1;
    } else if (item.days_until_due <= 7) {
      acc.next7Days += 1;
    }

    if (item.kind === DueSoonKind.ORDER_DUE) {
      acc.orders += 1;
    } else if (item.kind === DueSoonKind.IMPORT_PICKUP_DUE) {
      acc.importOrders += 1;
    }

    return acc;
  }, {
    total: 0,
    overdue: 0,
    next3Days: 0,
    next7Days: 0,
    orders: 0,
    importOrders: 0,
  });

  return summary;
};

export const groupDueSoonItems = (items = []) => ({
  overdue: items.filter((item) => item.days_until_due < 0),
  upcoming: items.filter((item) => item.days_until_due >= 0),
});

// Get import data by date range (optimized for analytics)
export const fetchImportData = async (startDate, endDate) => {
  try {
    const { data, error } = await supabase
      .from(Tables.IMPORT_ORDERS)
      .select(ImportOrderSelectForAnalytics)
      .gte(ImportOrderFields.IMPORT_DATE, formatDateForSQL(startDate))
      .lte(ImportOrderFields.IMPORT_DATE, formatDateForSQL(endDate))
      .order(ImportOrderFields.IMPORT_DATE, { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching import data:', error);
    throw error;
  }
};

// Get import summary metrics (optimized for analytics data)
export const getImportSummary = (importOrders = []) => {
  // Defensive check for empty or invalid data
  if (!Array.isArray(importOrders) || importOrders.length === 0) {
    return {
      totalImportValue: 0,
      totalImportOrders: 0,
      avgImportValue: 0,
      importsByStatus: {},
      importsBySourceType: {}
    };
  }

  const totalImportValue = importOrders.reduce((sum, importOrder) => 
    sum + (importOrder[ImportOrderFields.TOTAL_AMOUNT] || 0), 0);
  
  const totalImportOrders = importOrders.length;
  const avgImportValue = totalImportOrders > 0 ? totalImportValue / totalImportOrders : 0;
  
  // Count by status with defensive checks
  const importsByStatus = importOrders.reduce((acc, importOrder) => {
    const status = importOrder[ImportOrderFields.STATUS];
    if (status) {
      acc[status] = (acc[status] || 0) + 1;
    }
    return acc;
  }, {});
  
  // Count by source type with defensive checks
  const importsBySourceType = importOrders.reduce((acc, importOrder) => {
    const sourceType = importOrder[ImportOrderFields.SOURCE_TYPE];
    if (sourceType) {
      acc[sourceType] = (acc[sourceType] || 0) + 1;
    }
    return acc;
  }, {});

  return {
    totalImportValue,
    totalImportOrders,
    avgImportValue,
    importsByStatus,
    importsBySourceType
  };
};

// Group imports by date (optimized for analytics data)
export const groupImportsByDate = (importOrders = []) => {
  // Defensive check for empty or invalid data
  if (!Array.isArray(importOrders) || importOrders.length === 0) {
    return [];
  }

  const grouped = importOrders.reduce((acc, importOrder) => {
    const importDate = importOrder[ImportOrderFields.IMPORT_DATE];
    if (!importDate) return acc; // Skip if no import date
    
    const date = new Date(importDate).toISOString().split('T')[0];
    if (!acc[date]) {
      acc[date] = {
        date,
        importValue: 0,
        orders: 0
      };
    }
    acc[date].importValue += importOrder[ImportOrderFields.TOTAL_AMOUNT] || 0;
    acc[date].orders += 1;
    return acc;
  }, {});

  return Object.values(grouped).sort((a, b) => new Date(a.date) - new Date(b.date));
};

// Get product sales data
export const fetchProductSalesData = async (startDate, endDate) => {
  try {
    const { data, error } = await supabase
      .from(Tables.ORDER_ITEMS)
      .select(ProductSalesSelect)
      .gte(`orders.${OrderFields.CREATED_DATE}`, formatDateForSQL(startDate))
      .lte(`orders.${OrderFields.CREATED_DATE}`, formatDateForSQL(endDate))
      .order(OrderItemFields.QUANTITY, { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching product sales data:', error);
    throw error;
  }
};

// Group product sales data
export const groupProductSalesData = (orderItems) => {
  const grouped = orderItems.reduce((acc, item) => {
    const productId = item.products[ProductFields.ID];
    const productName = item.products[ProductFields.NAME];
    const productSku = item.products[ProductFields.SKU];
    
    if (!acc[productId]) {
      acc[productId] = {
        id: productId,
        name: productName,
        sku: productSku,
        totalQuantity: 0,
        totalRevenue: 0,
        orderCount: 0
      };
    }
    
    acc[productId].totalQuantity += item[OrderItemFields.QUANTITY] || 0;
    acc[productId].totalRevenue += (item[OrderItemFields.QUANTITY] || 0) * (item[OrderItemFields.SELLING_PRICE] || 0);
    acc[productId].orderCount += 1;
    
    return acc;
  }, {});

  return Object.values(grouped)
    .sort((a, b) => b.totalQuantity - a.totalQuantity)
    .slice(0, 10); // Top 10 products
};

// Get time period options for filters
export const getTimePeriodOptions = () => [
  {
    key: 'today',
    label: 'Hôm nay',
    getValue: () => {
      const now = new Date();
      const startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

      return { startDate, endDate };
    }
  },
  {
    key: 'last7days',
    label: '7 ngày qua',
    getValue: () => getDateRanges().last7Days
  },
  {
    key: 'last30days',
    label: '30 ngày qua',
    getValue: () => getDateRanges().last30Days
  },
  {
    key: 'thisMonth',
    label: 'Tháng này',
    getValue: () => getDateRanges().thisMonth
  },
  {
    key: 'lastMonth',
    label: 'Tháng trước',
    getValue: () => getDateRanges().lastMonth
  },
  {
    key: 'thisYear',
    label: 'Năm này',
    getValue: () => getDateRanges().thisYear
  },
  {
    key: 'custom',
    label: 'Tùy chỉnh',
    getValue: (startDate, endDate) => ({ startDate, endDate })
  }
];

// Calculate growth percentage
export const calculateGrowth = (current, previous) => {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
};

// Get month options for dropdown
export const getMonthOptions = (yearsBack = 2) => {
  const options = [];
  const now = new Date();
  
  for (let y = 0; y <= yearsBack; y++) {
    const year = now.getFullYear() - y;
    for (let m = (y === 0 ? now.getMonth() : 11); m >= 0; m--) {
      const date = new Date(year, m, 1);
      options.push({
        value: `${year}-${String(m + 1).padStart(2, '0')}`,
        label: new Intl.DateTimeFormat('vi-VN', {
          month: 'long',
          year: 'numeric'
        }).format(date),
        startDate: new Date(year, m, 1),
        endDate: new Date(year, m + 1, 0, 23, 59, 59, 999)
      });
    }
  }
  
  return options;
};
