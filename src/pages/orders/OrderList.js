import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import Loading from '../../components/Loading';
import PageHeader from '../../components/PageHeader';
import SearchInput from '../../components/SearchInput';
import Pagination from '../../components/Pagination';
import StatusBadge from '../../components/StatusBadge';
import OrderListFilters from './components/OrderListFilters';
import {
  Tables,
  CustomerFields,
  OrderFields,
  OrderStatus,
  OrderSelectWithCustomerAndItems,
  getStatusDisplay,
  getStatusBadgeColor,
  getOrderTypeLabel,
  getOrderTypeBadgeColor,
  formatCurrency,
  formatDate,
} from '../../models';

function OrderList() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [searchId, setSearchId] = useState(searchParams.get('search') || '');
  const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get('page')) || 1);
  const [totalOrders, setTotalOrders] = useState(0);
  const [itemsPerPage] = useState(10);
  
  // Filter states - initialize from URL params
  const [dateFrom, setDateFrom] = useState(searchParams.get('dateFrom') || '');
  const [dateTo, setDateTo] = useState(searchParams.get('dateTo') || '');
  const [customerFilter, setCustomerFilter] = useState(searchParams.get('customer') || '');
  const [statusFilter, setStatusFilter] = useState(searchParams.getAll('status') || []);
  
  // Sorting states
  const [sortBy, setSortBy] = useState(searchParams.get('sortBy') || 'created_at');
  const [sortOrder, setSortOrder] = useState(searchParams.get('sortOrder') || 'desc');
  
  // Debounced search ID
  const [debouncedSearchId, setDebouncedSearchId] = useState(searchParams.get('search') || '');

  // Fetch orders from database with pagination and search
  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const offset = (currentPage - 1) * itemsPerPage;
      
      let query = supabase
        .from(Tables.ORDERS)
        .select(OrderSelectWithCustomerAndItems, { count: 'exact' })
        .order(sortBy, { ascending: sortOrder === 'asc' })
        .range(offset, offset + itemsPerPage - 1);

      if (debouncedSearchId && debouncedSearchId.trim()) {
        query = query.eq(OrderFields.ID, parseInt(debouncedSearchId.trim()));
      }
      if (dateFrom) query = query.gte(OrderFields.CREATED_DATE, dateFrom);
      if (dateTo) query = query.lte(OrderFields.CREATED_DATE, dateTo);
      if (customerFilter) query = query.eq(OrderFields.CUSTOMER_ID, parseInt(customerFilter));
      if (statusFilter.length > 0) query = query.in(OrderFields.STATUS, statusFilter);

      const { data, error, count } = await query;

      if (error) throw error;
      setOrders(data || []);
      setTotalOrders(count || 0);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setMessage(`Lỗi tải đơn hàng: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }, [currentPage, debouncedSearchId, itemsPerPage, dateFrom, dateTo, customerFilter, statusFilter, sortBy, sortOrder]);

  // Update URL when state changes
  useEffect(() => {
    const params = new URLSearchParams();
    
    if (debouncedSearchId) params.set('search', debouncedSearchId);
    if (currentPage > 1) params.set('page', currentPage.toString());
    if (dateFrom) params.set('dateFrom', dateFrom);
    if (dateTo) params.set('dateTo', dateTo);
    if (customerFilter) params.set('customer', customerFilter);
    if (statusFilter.length > 0) {
      statusFilter.forEach(status => params.append('status', status));
    }
    if (sortBy !== 'created_at') params.set('sortBy', sortBy);
    if (sortOrder !== 'desc') params.set('sortOrder', sortOrder);

    // Only update URL if params have changed
    const newSearch = params.toString();
    const currentSearch = searchParams.toString();
    if (newSearch !== currentSearch) {
      setSearchParams(params, { replace: true });
    }
  }, [debouncedSearchId, currentPage, dateFrom, dateTo, customerFilter, statusFilter, sortBy, sortOrder, searchParams, setSearchParams]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

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
    setCustomerFilter('');
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

  const handleLinkClick = (e, orderId) => {
    // Allow default browser behavior for cmd+click, ctrl+click, middle click
    if (e.metaKey || e.ctrlKey || e.button === 1) {
      return;
    }
    // For normal clicks, prevent default and navigate
    e.preventDefault();
    navigate(`/orders/${orderId}`);
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (dateFrom) count++;
    if (dateTo) count++;
    if (customerFilter) count++;
    if (statusFilter.length > 0) count++;
    return count;
  };

  const activeFiltersCount = getActiveFiltersCount();
  const totalActiveFilters = activeFiltersCount + (debouncedSearchId ? 1 : 0);
  const totalPages = Math.ceil(totalOrders / itemsPerPage);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };



  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <PageHeader
        title="Quản lý đơn hàng"
        badge={`${totalOrders} đơn hàng`}
        actions={
          <Link
            to="/orders/create"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            + Tạo đơn hàng
          </Link>
        }
      />

      {/* Search */}
      <div className="mb-6">
        <SearchInput
          value={searchId}
          onChange={setSearchId}
          onSubmit={handleSearchSubmit}
          onClear={handleClearSearch}
          placeholder="Tìm theo ID đơn hàng..."
          label="Tìm kiếm đơn hàng"
          type="number"
        />
      </div>

      {/* Filter Bar */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <OrderListFilters
            dateFrom={dateFrom}
            dateTo={dateTo}
            customerFilter={customerFilter}
            statusFilter={statusFilter}
            onDateFromChange={setDateFrom}
            onDateToChange={setDateTo}
            onCustomerFilterChange={setCustomerFilter}
            onStatusFilterChange={setStatusFilter}
            onClearFilters={handleClearFilters}
            activeFiltersCount={activeFiltersCount}
          />
        </div>
        <div className="text-sm text-gray-500">
          {totalActiveFilters > 0 ? (
            <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full">
              {totalActiveFilters} bộ lọc đang áp dụng
            </span>
          ) : (
            <span>Hiển thị tất cả đơn hàng</span>
          )}
        </div>
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

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tên khách hàng</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Loại Phiếu</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" onClick={() => handleSort('created_at')}>
                <div className="flex items-center space-x-1">
                  <span>Ngày tạo</span>
                  {sortBy === 'created_at' && (
                    <span className="text-blue-600">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                  )}
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" onClick={() => handleSort(OrderFields.EXPECTED_DELIVERY_DATE)}>
                <div className="flex items-center space-x-1">
                  <span>Ngày giao dự kiến</span>
                  {sortBy === OrderFields.EXPECTED_DELIVERY_DATE && (
                    <span className="text-blue-600">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                  )}
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tổng tiền</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Người tạo</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            <Link>
            
            </Link>
            {loading ? (
              <Loading type="table" message="Đang tải đơn hàng..." colSpan="8" />
            ) : orders.length === 0 ? (
              <tr>
                <td colSpan="8" className="px-6 py-12 text-center">
                  <div className="text-gray-500">
                    {searchId ? 'Không tìm thấy đơn hàng' : 'Chưa có đơn hàng nào'}
                  </div>
                  {!searchId && (
                    <Link to="/orders/create" className="mt-2 inline-block text-blue-600 hover:text-blue-800">
                      Tạo đơn hàng đầu tiên
                    </Link>
                  )}
                </td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr key={order[OrderFields.ID]} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    <Link 
                      to={`/orders/${order[OrderFields.ID]}`}
                      onClick={(e) => handleLinkClick(e, order[OrderFields.ID])}
                      className="text-gray-900 hover:text-blue-600"
                    >
                      #{order[OrderFields.ID]}
                    </Link>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Link 
                      to={`/orders/${order[OrderFields.ID]}`}
                      onClick={(e) => handleLinkClick(e, order[OrderFields.ID])}
                      className="block text-gray-900 hover:text-blue-600"
                    >
                      <div className="text-sm">
                        {order.customers ? order.customers[CustomerFields.NAME] : order[OrderFields.CUSTOMER_NAME]}
                      </div>
                      <div className="text-sm text-gray-500">
                        {order.customers ? order.customers[CustomerFields.PHONE] : order[OrderFields.CUSTOMER_PHONE]}
                      </div>
                    </Link>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Link 
                      to={`/orders/${order[OrderFields.ID]}`}
                      onClick={(e) => handleLinkClick(e, order[OrderFields.ID])}
                      className="block"
                    >
                      <StatusBadge color={getOrderTypeBadgeColor(order[OrderFields.ORDER_TYPE])}>
                        {getOrderTypeLabel(order[OrderFields.ORDER_TYPE])}
                      </StatusBadge>
                    </Link>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Link 
                      to={`/orders/${order[OrderFields.ID]}`}
                      onClick={(e) => handleLinkClick(e, order[OrderFields.ID])}
                      className="block"
                    >
                      <StatusBadge color={getStatusBadgeColor(order[OrderFields.STATUS] || OrderStatus.STORE_HOLDS)}>
                        {getStatusDisplay(order[OrderFields.STATUS] || OrderStatus.STORE_HOLDS)}
                      </StatusBadge>
                    </Link>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <Link 
                      to={`/orders/${order[OrderFields.ID]}`}
                      onClick={(e) => handleLinkClick(e, order[OrderFields.ID])}
                      className="text-gray-900 hover:text-blue-600"
                    >
                      {formatDate(order[OrderFields.CREATED_DATE])}
                    </Link>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <Link 
                      to={`/orders/${order[OrderFields.ID]}`}
                      onClick={(e) => handleLinkClick(e, order[OrderFields.ID])}
                      className="text-gray-900 hover:text-blue-600"
                    >
                      {formatDate(order[OrderFields.EXPECTED_DELIVERY_DATE])}
                    </Link>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-green-600">
                    <Link 
                      to={`/orders/${order[OrderFields.ID]}`}
                      onClick={(e) => handleLinkClick(e, order[OrderFields.ID])}
                      className="text-green-600 hover:text-green-800"
                    >
                      {formatCurrency(order[OrderFields.TOTAL_AMOUNT])}
                    </Link>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Link 
                      to={`/orders/${order[OrderFields.ID]}`}
                      onClick={(e) => handleLinkClick(e, order[OrderFields.ID])}
                      className="block text-gray-900 hover:text-blue-600"
                    >
                      <div className="text-sm">{order[OrderFields.CREATED_BY] || 'N/A'}</div>
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalOrders}
        itemsPerPage={itemsPerPage}
        onPageChange={handlePageChange}
        itemLabel="đơn hàng"
      />
    </div>
  );
}

export default OrderList;
