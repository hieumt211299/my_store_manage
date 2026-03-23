import React, { useCallback, useEffect, useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import Loading from '../../components/Loading';
import PageHeader from '../../components/PageHeader';
import SearchInput from '../../components/SearchInput';
import Pagination from '../../components/Pagination';
import StatusBadge from '../../components/StatusBadge';
import OrderResaleListFilters from './components/OrderResaleListFilters';
import {
  Tables,
  OrderResaleFields,
  OrderResaleSelectSummary,
  getOrderResaleStatusBadgeColor,
  getOrderResaleStatusDisplay,
  formatCurrency,
  formatDate,
} from '../../models';

function OrderResaleList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [searchId, setSearchId] = useState(searchParams.get('search') || '');
  const [debouncedSearchId, setDebouncedSearchId] = useState(searchParams.get('search') || '');
  const [statusFilter, setStatusFilter] = useState(searchParams.getAll('status') || []);
  const [dateFrom, setDateFrom] = useState(searchParams.get('dateFrom') || '');
  const [dateTo, setDateTo] = useState(searchParams.get('dateTo') || '');
  const [paymentFrom, setPaymentFrom] = useState(searchParams.get('paymentFrom') || '');
  const [paymentTo, setPaymentTo] = useState(searchParams.get('paymentTo') || '');
  const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get('page') || '1', 10));
  const [totalItems, setTotalItems] = useState(0);
  
  // Sorting states
  const [sortBy, setSortBy] = useState(searchParams.get('sortBy') || OrderResaleFields.CREATED_AT);
  const [sortOrder, setSortOrder] = useState(searchParams.get('sortOrder') || 'desc');
  
  const itemsPerPage = 10;

  const fetchItems = useCallback(async () => {
    try {
      setLoading(true);
      setMessage('');
      const offset = (currentPage - 1) * itemsPerPage;

      let query = supabase
        .from(Tables.ORDER_RESALES)
        .select(OrderResaleSelectSummary, { count: 'exact' })
        .order(sortBy, { ascending: sortOrder === 'asc' })
        .range(offset, offset + itemsPerPage - 1);

      if (debouncedSearchId.trim()) {
        const value = debouncedSearchId.trim();
        if (!Number.isNaN(Number(value))) {
          query = query.or(`${OrderResaleFields.ID}.eq.${value},${OrderResaleFields.ORDER_ID}.eq.${value}`);
        } else {
          query = query.ilike(OrderResaleFields.CUSTOMER_NAME, `%${value}%`);
        }
      }

      if (statusFilter.length > 0) query = query.in(OrderResaleFields.STATUS, statusFilter);
      if (dateFrom) query = query.gte(OrderResaleFields.RESALE_DATE, dateFrom);
      if (dateTo) query = query.lte(OrderResaleFields.RESALE_DATE, dateTo);
      if (paymentFrom) query = query.gte(OrderResaleFields.EXPECTED_PAYMENT_DATE, paymentFrom);
      if (paymentTo) query = query.lte(OrderResaleFields.EXPECTED_PAYMENT_DATE, paymentTo);

      const { data, error, count } = await query;
      if (error) throw error;

      setItems(data || []);
      setTotalItems(count || 0);
    } catch (error) {
      console.error('Error fetching order resales:', error);
      setMessage(`Lỗi tải giao dịch bán lại: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }, [currentPage, dateFrom, dateTo, debouncedSearchId, paymentFrom, paymentTo, statusFilter, sortBy, sortOrder]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  useEffect(() => {
    const params = new URLSearchParams();
    
    if (debouncedSearchId) params.set('search', debouncedSearchId);
    if (currentPage > 1) params.set('page', String(currentPage));
    if (dateFrom) params.set('dateFrom', dateFrom);
    if (dateTo) params.set('dateTo', dateTo);
    if (paymentFrom) params.set('paymentFrom', paymentFrom);
    if (paymentTo) params.set('paymentTo', paymentTo);
    if (statusFilter.length > 0) {
      statusFilter.forEach(status => params.append('status', status));
    }
    if (sortBy !== OrderResaleFields.CREATED_AT) params.set('sortBy', sortBy);
    if (sortOrder !== 'desc') params.set('sortOrder', sortOrder);

    // Only update URL if params have changed
    const newSearch = params.toString();
    const currentSearch = searchParams.toString();
    if (newSearch !== currentSearch) {
      setSearchParams(params, { replace: true });
    }
  }, [currentPage, dateFrom, dateTo, debouncedSearchId, paymentFrom, paymentTo, setSearchParams, statusFilter, sortBy, sortOrder, searchParams]);

  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const handleSearchSubmit = (value) => {
    setDebouncedSearchId(value);
    setCurrentPage(1);
  };

  const handleClearSearch = () => {
    setSearchId('');
    setDebouncedSearchId('');
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setSearchId('');
    setDebouncedSearchId('');
    setDateFrom('');
    setDateTo('');
    setPaymentFrom('');
    setPaymentTo('');
    setStatusFilter([]);
    setCurrentPage(1);
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
    setCurrentPage(1);
  };

  const handleLinkClick = (e, itemId) => {
    // Allow default browser behavior for cmd+click, ctrl+click, middle click
    if (e.metaKey || e.ctrlKey || e.button === 1) {
      return;
    }
    // For normal clicks, prevent default and navigate
    e.preventDefault();
    navigate(`/order-resales/${itemId}`);
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (dateFrom) count++;
    if (dateTo) count++;
    if (paymentFrom) count++;
    if (paymentTo) count++;
    if (statusFilter.length > 0) count++;
    return count;
  };

  const activeFiltersCount = getActiveFiltersCount();

  return (
    <div className="mx-auto max-w-7xl px-0 sm:px-2 lg:px-4">
      <PageHeader
        title="Bán đơn cho cửa hàng"
        subtitle="Quản lý các giao dịch cửa hàng mua lại đơn hàng từ khách."
        badge={`${totalItems} giao dịch`}
      />

      <div className="mb-6">
        <SearchInput
          value={searchId}
          onChange={setSearchId}
          onSubmit={handleSearchSubmit}
          onClear={handleClearSearch}
          placeholder="Tìm theo mã giao dịch, mã đơn gốc hoặc tên khách hàng..."
          label="Tìm kiếm giao dịch bán lại"
        />
      </div>

      {/* Filter Component */}
      <div className="mb-6">
        <OrderResaleListFilters
          dateFrom={dateFrom}
          dateTo={dateTo}
          paymentFrom={paymentFrom}
          paymentTo={paymentTo}
          statusFilter={statusFilter}
          onDateFromChange={setDateFrom}
          onDateToChange={setDateTo}
          onPaymentFromChange={setPaymentFrom}
          onPaymentToChange={setPaymentTo}
          onStatusFilterChange={setStatusFilter}
          onClearFilters={handleClearFilters}
          activeFiltersCount={activeFiltersCount}
        />
      </div>

      {/* Message */}
      {message && (
        <div className={`mb-6 p-4 rounded-lg ${
          message.includes('thành công') 
            ? 'bg-green-50 text-green-700 border border-green-200' 
            : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {message}
        </div>
      )}

      <div className="overflow-hidden rounded-lg bg-white shadow">
        <div className="border-b border-gray-100 px-4 py-3 text-xs text-gray-500 sm:hidden">
          Vuốt ngang để xem đầy đủ thông tin bảng.
        </div>
        <div className="overflow-x-auto">
        <table className="w-full min-w-[920px] divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mã GD</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Đơn gốc</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Khách hàng</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" onClick={() => handleSort(OrderResaleFields.RESALE_DATE)}>
                <div className="flex items-center space-x-1">
                  <span>Ngày bán</span>
                  {sortBy === OrderResaleFields.RESALE_DATE && (
                    <span className="text-blue-600">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                  )}
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" onClick={() => handleSort(OrderResaleFields.EXPECTED_PAYMENT_DATE)}>
                <div className="flex items-center space-x-1">
                  <span>Ngày chuyển tiền</span>
                  {sortBy === OrderResaleFields.EXPECTED_PAYMENT_DATE && (
                    <span className="text-blue-600">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                  )}
                </div>
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" onClick={() => handleSort(OrderResaleFields.TOTAL_AMOUNT)}>
                <div className="flex items-center justify-end space-x-1">
                  <span>Tổng tiền</span>
                  {sortBy === OrderResaleFields.TOTAL_AMOUNT && (
                    <span className="text-blue-600">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                  )}
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <Loading type="table" message="Đang tải giao dịch bán lại..." colSpan="7" />
            ) : items.length === 0 ? (
              <tr>
                <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                  Chưa có giao dịch bán lại nào
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td colSpan="7" className="px-6 py-12 text-center">
                  <div className="text-gray-500">
                    {searchId ? 'Không tìm thấy giao dịch bán lại' : 'Chưa có giao dịch bán lại nào'}
                  </div>
                </td>
              </tr>
            ) : (
              items.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    <Link 
                      to={`/order-resales/${item.id}`}
                      onClick={(e) => handleLinkClick(e, item.id)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      #{item.id}
                    </Link>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Link 
                      to={`/orders/${item.order_id}`}
                      className="text-gray-900 hover:text-blue-600"
                    >
                      #{item.order_id}
                    </Link>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Link 
                      to={`/order-resales/${item.id}`}
                      onClick={(e) => handleLinkClick(e, item.id)}
                      className="block text-gray-900 hover:text-blue-600"
                    >
                      <div className="text-sm font-medium text-gray-900">{item.customer_name}</div>
                      <div className="text-sm text-gray-500">{item.customer_phone}</div>
                    </Link>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Link 
                      to={`/order-resales/${item.id}`}
                      onClick={(e) => handleLinkClick(e, item.id)}
                      className="block"
                    >
                      <StatusBadge color={getOrderResaleStatusBadgeColor(item.status)}>
                        {getOrderResaleStatusDisplay(item.status)}
                      </StatusBadge>
                    </Link>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <Link 
                      to={`/order-resales/${item.id}`}
                      onClick={(e) => handleLinkClick(e, item.id)}
                      className="text-gray-900 hover:text-blue-600"
                    >
                      {formatDate(item.resale_date)}
                    </Link>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <Link 
                      to={`/order-resales/${item.id}`}
                      onClick={(e) => handleLinkClick(e, item.id)}
                      className="text-gray-900 hover:text-blue-600"
                    >
                      {formatDate(item.expected_payment_date)}
                    </Link>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-bold text-green-600">
                    <Link 
                      to={`/order-resales/${item.id}`}
                      onClick={(e) => handleLinkClick(e, item.id)}
                      className="text-green-600 hover:text-green-800"
                    >
                      {formatCurrency(item.total_amount)}
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        </div>
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalItems}
        itemsPerPage={itemsPerPage}
        onPageChange={setCurrentPage}
        itemLabel="giao dịch"
      />
    </div>
  );
}

export default OrderResaleList;
