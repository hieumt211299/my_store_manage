import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
  getPaymentMethodLabel,
  getPaymentMethodBadgeColor,
  formatCurrency,
  formatDate,
} from '../../models';

function OrderList() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [searchId, setSearchId] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);
  const [itemsPerPage] = useState(10);
  
  // Filter states
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [customerFilter, setCustomerFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  
  // Sorting states
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');
  
  // Debounced search ID
  const [debouncedSearchId, setDebouncedSearchId] = useState('');

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
      if (statusFilter) query = query.eq(OrderFields.STATUS, statusFilter);

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
    setStatusFilter('');
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

  const getActiveFiltersCount = () => {
    let count = 0;
    if (dateFrom) count++;
    if (dateTo) count++;
    if (customerFilter) count++;
    if (statusFilter) count++;
    return count;
  };

  const activeFiltersCount = getActiveFiltersCount();
  const totalActiveFilters = activeFiltersCount + (debouncedSearchId ? 1 : 0);
  const totalPages = Math.ceil(totalOrders / itemsPerPage);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  const handleOrderClick = (orderId) => {
    navigate(`/orders/${orderId}`);
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
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thanh toán</th>
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
                <tr
                  key={order[OrderFields.ID]}
                  onClick={() => handleOrderClick(order[OrderFields.ID])}
                  className="hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">#{order[OrderFields.ID]}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {order.customers ? order.customers[CustomerFields.NAME] : order[OrderFields.CUSTOMER_NAME]}
                    </div>
                    <div className="text-sm text-gray-500">
                      {order.customers ? order.customers[CustomerFields.PHONE] : order[OrderFields.CUSTOMER_PHONE]}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge color={getPaymentMethodBadgeColor(order[OrderFields.PAYMENT_METHOD])}>
                      {getPaymentMethodLabel(order[OrderFields.PAYMENT_METHOD])}
                    </StatusBadge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge color={getStatusBadgeColor(order[OrderFields.STATUS] || OrderStatus.STORE_HOLDS)}>
                      {getStatusDisplay(order[OrderFields.STATUS] || OrderStatus.STORE_HOLDS)}
                    </StatusBadge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatDate(order[OrderFields.CREATED_DATE])}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatDate(order[OrderFields.EXPECTED_DELIVERY_DATE])}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-green-600">{formatCurrency(order[OrderFields.TOTAL_AMOUNT])}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{order[OrderFields.CREATED_BY] || 'N/A'}</div>
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
