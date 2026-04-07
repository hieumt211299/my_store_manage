import { supabase } from '../../lib/supabase';
import { OrderFields, OrderSelectWithCustomerAndItems, Tables } from '../../models';

export const buildOrderListBaseQuery = ({
  includeCount = false,
  rangeFrom,
  rangeTo,
  searchId = '',
  createdDateFrom = '',
  createdDateTo = '',
  expectedDeliveryDateFrom = '',
  expectedDeliveryDateTo = '',
  actualReceivedDateFrom = '',
  actualReceivedDateTo = '',
  customerFilter = '',
  statusFilter = [],
  sortBy = 'created_at',
  sortOrder = 'desc',
} = {}) => {
  const selectOptions = includeCount ? { count: 'exact' } : undefined;

  let query = supabase
    .from(Tables.ORDERS)
    .select(OrderSelectWithCustomerAndItems, selectOptions)
    .order(sortBy, { ascending: sortOrder === 'asc' });

  if (typeof rangeFrom === 'number' && typeof rangeTo === 'number') {
    query = query.range(rangeFrom, rangeTo);
  }

  if (searchId && searchId.trim()) {
    query = query.eq(OrderFields.ID, parseInt(searchId.trim(), 10));
  }
  if (createdDateFrom) query = query.gte(OrderFields.CREATED_DATE, createdDateFrom);
  if (createdDateTo) query = query.lte(OrderFields.CREATED_DATE, createdDateTo);
  if (expectedDeliveryDateFrom) {
    query = query.gte(OrderFields.EXPECTED_DELIVERY_DATE, expectedDeliveryDateFrom);
  }
  if (expectedDeliveryDateTo) {
    query = query.lte(OrderFields.EXPECTED_DELIVERY_DATE, expectedDeliveryDateTo);
  }
  if (actualReceivedDateFrom) query = query.gte(OrderFields.DATE_RECEIVED, actualReceivedDateFrom);
  if (actualReceivedDateTo) query = query.lte(OrderFields.DATE_RECEIVED, actualReceivedDateTo);
  if (customerFilter) query = query.eq(OrderFields.CUSTOMER_ID, parseInt(customerFilter, 10));
  if (statusFilter.length > 0) query = query.in(OrderFields.STATUS, statusFilter);

  return query;
};

export const filterOrdersByProduct = (orders = [], productFilter = '') => {
  if (!productFilter) return orders;

  return orders.filter((order) =>
    order.order_items?.some((item) => item.products?.id?.toString() === productFilter)
  );
};
