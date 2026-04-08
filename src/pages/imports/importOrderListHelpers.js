import { supabase } from '../../lib/supabase';
import { ImportOrderFields, ImportOrderSelectWithItems, Tables } from '../../models';

export const buildImportOrderListBaseQuery = ({
  includeCount = false,
  rangeFrom,
  rangeTo,
  searchId = '',
  createdDateFrom = '',
  createdDateTo = '',
  expectedReturnDateFrom = '',
  expectedReturnDateTo = '',
  actualReturnDateFrom = '',
  actualReturnDateTo = '',
  sourceFilter = '',
  statusFilter = [],
  sortBy = ImportOrderFields.IMPORT_DATE,
  sortOrder = 'desc',
} = {}) => {
  const selectOptions = includeCount ? { count: 'exact' } : undefined;

  let query = supabase
    .from(Tables.IMPORT_ORDERS)
    .select(ImportOrderSelectWithItems, selectOptions)
    .order(sortBy, { ascending: sortOrder === 'asc' });

  if (typeof rangeFrom === 'number' && typeof rangeTo === 'number') {
    query = query.range(rangeFrom, rangeTo);
  }

  const normalizedSearchId = searchId.trim();
  if (normalizedSearchId) {
    if (!Number.isNaN(Number(normalizedSearchId))) {
      query = query.eq(ImportOrderFields.ID, parseInt(normalizedSearchId, 10));
    } else {
      query = query.eq(ImportOrderFields.ANCARAT_INVOICE_NUMBER, normalizedSearchId);
    }
  }

  if (createdDateFrom) query = query.gte(ImportOrderFields.IMPORT_DATE, createdDateFrom);
  if (createdDateTo) query = query.lte(ImportOrderFields.IMPORT_DATE, createdDateTo);
  if (expectedReturnDateFrom) {
    query = query.gte(ImportOrderFields.EXPECTED_RETURN_DATE, expectedReturnDateFrom);
  }
  if (expectedReturnDateTo) {
    query = query.lte(ImportOrderFields.EXPECTED_RETURN_DATE, expectedReturnDateTo);
  }
  if (actualReturnDateFrom) query = query.gte(ImportOrderFields.ACTUAL_RETURN_DATE, actualReturnDateFrom);
  if (actualReturnDateTo) query = query.lte(ImportOrderFields.ACTUAL_RETURN_DATE, actualReturnDateTo);
  if (sourceFilter) query = query.eq(ImportOrderFields.SOURCE_TYPE, sourceFilter);
  if (statusFilter.length > 0) query = query.in(ImportOrderFields.STATUS, statusFilter);

  return query;
};

export const filterImportOrdersByItemFilters = (
  importOrders = [],
  productFilter = '',
  quantity = null
) => {
  const normalizedProductFilter = productFilter ? String(productFilter) : '';

  if (!normalizedProductFilter && !quantity) return importOrders;

  return importOrders.filter((importOrder) =>
    importOrder.import_items?.some((item) => {
      let matches = true;

      if (normalizedProductFilter) {
        matches = matches && String(item.products?.id || '') === normalizedProductFilter;
      }

      if (quantity) {
        matches = matches && item.quantity === quantity;
      }

      return matches;
    })
  );
};
