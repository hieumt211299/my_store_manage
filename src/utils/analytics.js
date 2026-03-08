import { supabase } from '../lib/supabase';

// Date utility functions
export const getDateRanges = () => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  return {
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
  return date.toISOString().split('T')[0];
};

// Format date for display
export const formatDateForDisplay = (date) => {
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(date);
};

// Format currency in VND
export const formatCurrency = (amount) => {
  if (!amount) return '0 ₫';
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    minimumFractionDigits: 0
  }).format(amount);
};

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
      .from('orders')
      .select('id, created_date, total_amount, status')
      .gte('created_date', formatDateForSQL(startDate))
      .lte('created_date', formatDateForSQL(endDate))
      .order('created_date', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching revenue data:', error);
    throw error;
  }
};

// Get revenue summary metrics
export const getRevenueSummary = (orders) => {
  const totalRevenue = orders.reduce((sum, order) => sum + (order.total_amount || 0), 0);
  const totalOrders = orders.length;
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
  
  // Count by status
  const ordersByStatus = orders.reduce((acc, order) => {
    acc[order.status] = (acc[order.status] || 0) + 1;
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
    const date = new Date(order.created_date).toISOString().split('T')[0];
    if (!acc[date]) {
      acc[date] = {
        date,
        revenue: 0,
        orders: 0
      };
    }
    acc[date].revenue += order.total_amount || 0;
    acc[date].orders += 1;
    return acc;
  }, {});

  return Object.values(grouped).sort((a, b) => new Date(a.date) - new Date(b.date));
};

// Get product sales data
export const fetchProductSalesData = async (startDate, endDate) => {
  try {
    const { data, error } = await supabase
      .from('order_items')
      .select(`
        quantity,
        selling_price,
        products!inner (
          id,
          name,
          sku
        ),
        orders!inner (
          created_date
        )
      `)
      .gte('orders.created_date', formatDateForSQL(startDate))
      .lte('orders.created_date', formatDateForSQL(endDate))
      .order('quantity', { ascending: false });

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
    const productId = item.products.id;
    const productName = item.products.name;
    const productSku = item.products.sku;
    
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
    
    acc[productId].totalQuantity += item.quantity || 0;
    acc[productId].totalRevenue += (item.quantity || 0) * (item.selling_price || 0);
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