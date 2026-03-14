import { supabase } from '../lib/supabase';
import {
  Tables,
  OrderFields,
  OrderItemFields,
  ProductFields,
  ProductSalesSelect,
  ImportOrderFields,
  ImportItemFields,
  ImportOrderSelectWithItems,
} from '../models';

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
    const { data, error } = await supabase
      .from(Tables.ORDERS)
      .select(`${OrderFields.ID}, ${OrderFields.CREATED_DATE}, ${OrderFields.TOTAL_AMOUNT}, ${OrderFields.STATUS}`)
      .gte(OrderFields.CREATED_DATE, formatDateForSQL(startDate))
      .lte(OrderFields.CREATED_DATE, formatDateForSQL(endDate))
      .order(OrderFields.CREATED_DATE, { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching revenue data:', error);
    throw error;
  }
};

// Get revenue summary metrics
export const getRevenueSummary = (orders) => {
  const totalRevenue = orders.reduce((sum, order) => sum + (order[OrderFields.TOTAL_AMOUNT] || 0), 0);
  const totalOrders = orders.length;
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
  
  // Count by status
  const ordersByStatus = orders.reduce((acc, order) => {
    acc[order[OrderFields.STATUS]] = (acc[order[OrderFields.STATUS]] || 0) + 1;
    return acc;
  }, {});

  return {
    totalRevenue,
    totalOrders,
    avgOrderValue,
    ordersByStatus
  };
};

// Group revenue by date
export const groupRevenueByDate = (orders) => {
  const grouped = orders.reduce((acc, order) => {
    const date = new Date(order[OrderFields.CREATED_DATE]).toISOString().split('T')[0];
    if (!acc[date]) {
      acc[date] = {
        date,
        revenue: 0,
        orders: 0
      };
    }
    acc[date].revenue += order[OrderFields.TOTAL_AMOUNT] || 0;
    acc[date].orders += 1;
    return acc;
  }, {});

  return Object.values(grouped).sort((a, b) => new Date(a.date) - new Date(b.date));
};

// Get import data by date range
export const fetchImportData = async (startDate, endDate) => {
  try {
    const { data, error } = await supabase
      .from(Tables.IMPORT_ORDERS)
      .select(ImportOrderSelectWithItems)
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

// Get import summary metrics
export const getImportSummary = (importOrders) => {
  const totalImportValue = importOrders.reduce((sum, importOrder) => 
    sum + (importOrder[ImportOrderFields.TOTAL_AMOUNT] || 0), 0);
  
  const totalImportOrders = importOrders.length;
  const avgImportValue = totalImportOrders > 0 ? totalImportValue / totalImportOrders : 0;
  
  // Count by status
  const importsByStatus = importOrders.reduce((acc, importOrder) => {
    acc[importOrder[ImportOrderFields.STATUS]] = (acc[importOrder[ImportOrderFields.STATUS]] || 0) + 1;
    return acc;
  }, {});
  
  // Count by source type
  const importsBySourceType = importOrders.reduce((acc, importOrder) => {
    acc[importOrder[ImportOrderFields.SOURCE_TYPE]] = (acc[importOrder[ImportOrderFields.SOURCE_TYPE]] || 0) + 1;
    return acc;
  }, {});
  
  // Calculate total items imported
  const totalItemsImported = importOrders.reduce((total, importOrder) => {
    return total + (importOrder.import_items?.reduce((itemTotal, item) => 
      itemTotal + (item[ImportItemFields.QUANTITY] || 0), 0) || 0);
  }, 0);

  return {
    totalImportValue,
    totalImportOrders,
    avgImportValue,
    totalItemsImported,
    importsByStatus,
    importsBySourceType
  };
};

// Group imports by date
export const groupImportsByDate = (importOrders) => {
  const grouped = importOrders.reduce((acc, importOrder) => {
    const date = new Date(importOrder[ImportOrderFields.IMPORT_DATE]).toISOString().split('T')[0];
    if (!acc[date]) {
      acc[date] = {
        date,
        importValue: 0,
        orders: 0,
        itemsCount: 0
      };
    }
    acc[date].importValue += importOrder[ImportOrderFields.TOTAL_AMOUNT] || 0;
    acc[date].orders += 1;
    acc[date].itemsCount += importOrder.import_items?.reduce((total, item) => 
      total + (item[ImportItemFields.QUANTITY] || 0), 0) || 0;
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
