import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import Loading from '../components/Loading';

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
  const [customers, setCustomers] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  
  // Sorting states
  const [sortBy, setSortBy] = useState('created_date');
  const [sortOrder, setSortOrder] = useState('desc');
  
  // Customer filter search states
  const [customerSearchTerm, setCustomerSearchTerm] = useState('');
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [selectedCustomerName, setSelectedCustomerName] = useState('');
  
  // Debounced search ID (actual value used for API calls)
  const [debouncedSearchId, setDebouncedSearchId] = useState('');
  
  // Debounce timer for search ID
  const searchDebounceTimer = useRef(null);
  
  // Status display functions
  const getStatusDisplay = (status) => {
    switch (status) {
      case 'received': return 'Đã nhận hàng';
      case 'customer_holds': return 'Khách giữ phiếu';
      case 'store_holds': return 'Cửa hàng giữ phiếu';
      default: return 'Cửa hàng giữ phiếu';
    }
  };

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'received': return 'bg-green-100 text-green-800';
      case 'customer_holds': return 'bg-yellow-100 text-yellow-800';
      case 'store_holds': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Fetch customers for filter dropdown
  const fetchCustomers = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('id, name, id_number')
        .order('name');
      
      if (error) throw error;
      setCustomers(data || []);
    } catch (error) {
      console.error('Error fetching customers:', error);
    }
  }, []);

  // Fetch orders from database with pagination and search
  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      
      // Calculate offset for pagination
      const offset = (currentPage - 1) * itemsPerPage;
      
      let query = supabase
        .from('orders')
        .select(`
          *,
          customers!inner (
            id,
            name,
            id_number,
            phone
          ),
          order_items (
            id,
            quantity,
            selling_price,
            products (
              name,
              sku
            )
          )
        `, { count: 'exact' })
        .order(sortBy, { ascending: sortOrder === 'asc' })
        .range(offset, offset + itemsPerPage - 1);

      // Apply search filter if debouncedSearchId is provided
      if (debouncedSearchId && debouncedSearchId.trim()) {
        query = query.eq('id', parseInt(debouncedSearchId.trim()));
      }

      // Apply date filters
      if (dateFrom) {
        query = query.gte('created_date', dateFrom);
      }
      if (dateTo) {
        query = query.lte('created_date', dateTo);
      }

      // Apply customer filter
      if (customerFilter) {
        query = query.eq('customer_id', parseInt(customerFilter));
      }

      // Apply status filter
      if (statusFilter) {
        query = query.eq('status', statusFilter);
      }

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

  // Separate useEffect for initial load
  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]); // Add fetchCustomers dependency

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.filter-dropdown')) {
        setShowFilters(false);
      }
      if (!event.target.closest('.customer-search-container')) {
        setShowCustomerDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      // Clean up debounce timer
      if (searchDebounceTimer.current) {
        clearTimeout(searchDebounceTimer.current);
      }
    };
  }, []); // Only setup event listeners once

  // Initialize filtered customers when customers data is loaded
  useEffect(() => {
    if (customers.length > 0) {
      setFilteredCustomers(customers.slice(0, 10));
    }
  }, [customers]);

  // Handle search ID change with debounce
  const handleSearchIdChange = (value) => {
    setSearchId(value);
    
    // Clear previous timer
    if (searchDebounceTimer.current) {
      clearTimeout(searchDebounceTimer.current);
    }
    
    // Debounce the actual search value used for API calls
    searchDebounceTimer.current = setTimeout(() => {
      setDebouncedSearchId(value.trim());
      setCurrentPage(1);
    }, 500);
  };

  // Handle search (manual submit)
  const handleSearch = (e) => {
    e.preventDefault();
    // Clear any pending debounce
    if (searchDebounceTimer.current) {
      clearTimeout(searchDebounceTimer.current);
    }
    setDebouncedSearchId(searchId.trim());
    setCurrentPage(1);
  };

  // Handle clear search
  const handleClearSearch = () => {
    setSearchId('');
    setDebouncedSearchId('');
    setCurrentPage(1);
  };

  // Handle clear all filters
  const handleClearFilters = () => {
    setSearchId('');
    setDebouncedSearchId('');
    setDateFrom('');
    setDateTo('');
    setCustomerFilter('');
    setStatusFilter('');
    setCustomerSearchTerm('');
    setSelectedCustomerName('');
    setCurrentPage(1);
    setShowFilters(false);
  };

  // Filter customers based on search term
  const handleCustomerSearch = (searchTerm) => {
    setCustomerSearchTerm(searchTerm);
    if (searchTerm.length === 0) {
      // Show all customers when no search term
      setFilteredCustomers(customers.slice(0, 10)); // Limit to first 10
      setShowCustomerDropdown(customers.length > 0);
    } else if (searchTerm.length >= 1) {
      // Filter customers based on search
      const filtered = customers.filter(customer => 
        customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.id_number.includes(searchTerm)
      );
      setFilteredCustomers(filtered.slice(0, 10)); // Limit to 10 results
      setShowCustomerDropdown(filtered.length > 0);
    } else {
      setFilteredCustomers([]);
      setShowCustomerDropdown(false);
    }
  };

  // Handle customer input focus
  const handleCustomerInputFocus = () => {
    if (!showCustomerDropdown && customers.length > 0) {
      setFilteredCustomers(customers.slice(0, 10));
      setShowCustomerDropdown(true);
    }
  };

  // Select customer from dropdown
  const handleSelectCustomer = (customer) => {
    setCustomerFilter(customer.id);
    setSelectedCustomerName(customer.name);
    setCustomerSearchTerm(`${customer.name} (${customer.id_number})`);
    setShowCustomerDropdown(false);
  };

  // Clear customer selection
  const handleClearCustomer = () => {
    setCustomerFilter('');
    setSelectedCustomerName('');
    setCustomerSearchTerm('');
    setShowCustomerDropdown(false);
  };

  // Handle sorting
  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
    setCurrentPage(1);
  };

  // Count active filters (exclude searchId as it's separate)
  const getActiveFiltersCount = () => {
    let count = 0;
    if (dateFrom) count++;
    if (dateTo) count++;
    if (customerFilter) count++;
    if (statusFilter) count++;
    return count;
  };

  const activeFiltersCount = getActiveFiltersCount();
  const totalActiveFilters = getActiveFiltersCount() + (debouncedSearchId ? 1 : 0);

  // Calculate total pages
  const totalPages = Math.ceil(totalOrders / itemsPerPage);

  // Handle page change
  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Navigate to order detail
  const handleOrderClick = (orderId) => {
    navigate(`/orders/${orderId}`);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Quản lý đơn hàng</h1>
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
            {totalOrders} đơn hàng
          </span>
          <Link
            to="/orders/create"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            + Tạo đơn hàng
          </Link>
        </div>
      </div>

      {/* Search */}
      <div className="mb-6">
        <form onSubmit={handleSearch} className="flex items-center space-x-4">
          <div className="flex-1 max-w-md">
            <label htmlFor="search-id" className="block text-sm font-medium text-gray-700 mb-2">
              Tìm kiếm đơn hàng
            </label>
            <div className="flex">
              <input
                id="search-id"
                type="number"
                value={searchId}
                onChange={(e) => handleSearchIdChange(e.target.value)}
                placeholder="Tìm theo ID đơn hàng..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded-r-lg hover:bg-blue-700 transition-colors"
              >
                Tìm
              </button>
            </div>
          </div>
          {searchId && (
            <button
              type="button"
              onClick={handleClearSearch}
              className="mt-7 text-gray-500 hover:text-gray-700"
            >
              ✕ Xóa
            </button>
          )}
        </form>
      </div>

      {/* Filter Bar */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center space-x-4">

          {/* Filter Dropdown */}
          <div className="relative filter-dropdown">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-colors ${
                showFilters || activeFiltersCount > 0
                  ? 'bg-blue-50 border-blue-300 text-blue-700'
                  : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <span>🔧 Bộ lọc</span>
              {activeFiltersCount > 0 && (
                <span className="bg-blue-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {activeFiltersCount}
                </span>
              )}
              <span className={`transform transition-transform ${showFilters ? 'rotate-180' : ''}`}>
                ▼
              </span>
            </button>

            {/* Filters Dropdown */}
            {showFilters && (
              <div className="absolute top-full left-0 mt-2 w-96 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                <div className="p-4">
                  <div className="space-y-4">
                    {/* Date Range */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        📅 Khoảng thời gian
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <input
                            type="date"
                            value={dateFrom}
                            onChange={(e) => setDateFrom(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Từ ngày"
                          />
                        </div>
                        <div>
                          <input
                            type="date"
                            value={dateTo}
                            onChange={(e) => setDateTo(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Đến ngày"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Status Filter */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        📝 Trạng thái
                      </label>
                      <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Tất cả trạng thái</option>
                        <option value="store_holds">Cửa hàng giữ phiếu</option>
                        <option value="customer_holds">Khách giữ phiếu</option>
                        <option value="received">Đã nhận hàng</option>
                      </select>
                    </div>

                    {/* Customer Filter with Search */}
                    <div className="relative customer-search-container">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        👤 Khách hàng
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={customerSearchTerm}
                          onChange={(e) => handleCustomerSearch(e.target.value)}
                          onFocus={handleCustomerInputFocus}
                          placeholder="Tìm kiếm khách hàng..."
                          className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        {selectedCustomerName && (
                          <button
                            onClick={handleClearCustomer}
                            className="absolute right-2 top-2 text-gray-400 hover:text-gray-600"
                          >
                            ✕
                          </button>
                        )}
                      </div>

                      {/* Customer Dropdown */}
                      {showCustomerDropdown && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto z-10">
                          {filteredCustomers.length > 0 ? (
                            <>
                              {filteredCustomers.map((customer) => (
                                <div
                                  key={customer.id}
                                  onClick={() => handleSelectCustomer(customer)}
                                  className="px-3 py-2 cursor-pointer hover:bg-blue-50 border-b border-gray-100 last:border-b-0"
                                >
                                  <div className="font-medium text-gray-900">{customer.name}</div>
                                  <div className="text-sm text-gray-600">CCCD: {customer.id_number}</div>
                                </div>
                              ))}
                              {customers.length > 10 && filteredCustomers.length === 10 && !customerSearchTerm && (
                                <div className="px-3 py-2 text-xs text-gray-500 text-center border-t border-gray-100">
                                  Nhập để tìm kiếm thêm khách hàng...
                                </div>
                              )}
                            </>
                          ) : (
                            <div className="px-3 py-2 text-gray-500 text-sm">
                              {customerSearchTerm ? 'Không tìm thấy khách hàng nào' : 'Chưa có khách hàng nào'}
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-between pt-3 border-t border-gray-200">
                      <button
                        onClick={handleClearFilters}
                        className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
                        disabled={activeFiltersCount === 0}
                      >
                        ✕ Xóa tất cả
                      </button>
                      <div className="space-x-2">
                        <button
                          onClick={() => setShowFilters(false)}
                          className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
                        >
                          Đóng
                        </button>
                        <button
                          onClick={() => {
                            handleSearch(new Event('submit'));
                            setShowFilters(false);
                          }}
                          className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
                        >
                          Áp dụng
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right side: Quick stats */}
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

      {/* Active Filters Summary (excluding searchId) */}
      {activeFiltersCount > 0 && (
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <span className="text-sm text-gray-600">Bộ lọc đang áp dụng:</span>
          {dateFrom && (
            <span className="bg-blue-100 text-blue-800 text-xs px-3 py-1 rounded-full">
              Từ: {new Date(dateFrom).toLocaleDateString('vi-VN')}
            </span>
          )}
          {dateTo && (
            <span className="bg-blue-100 text-blue-800 text-xs px-3 py-1 rounded-full">
              Đến: {new Date(dateTo).toLocaleDateString('vi-VN')}
            </span>
          )}
          {customerFilter && selectedCustomerName && (
            <span className="bg-blue-100 text-blue-800 text-xs px-3 py-1 rounded-full">
              KH: {selectedCustomerName}
            </span>
          )}
          {statusFilter && (
            <span className="bg-blue-100 text-blue-800 text-xs px-3 py-1 rounded-full">
              TT: {getStatusDisplay(statusFilter)}
            </span>
          )}
          <button
            onClick={() => {
              setDateFrom('');
              setDateTo('');
              setCustomerFilter('');
              setStatusFilter('');
              setSelectedCustomerName('');
              setCustomerSearchTerm('');
              setCurrentPage(1);
              // fetchOrders will be called automatically by useEffect
            }}
            className="text-xs text-gray-500 hover:text-gray-700 ml-2"
          >
            ✕ Xóa bộ lọc
          </button>
        </div>
      )}

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
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tên khách hàng
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Thanh toán
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Trạng thái
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ngày tạo
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" onClick={() => handleSort('expected_delivery_date')}>
                <div className="flex items-center space-x-1">
                  <span>Ngày giao dự kiến</span>
                  {sortBy === 'expected_delivery_date' && (
                    <span className="text-blue-600">
                      {sortOrder === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tổng tiền
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Người tạo
              </th>
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
                    <Link
                      to="/orders/create"
                      className="mt-2 inline-block text-blue-600 hover:text-blue-800"
                    >
                      Tạo đơn hàng đầu tiên
                    </Link>
                  )}
                </td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr 
                  key={order.id} 
                  onClick={() => handleOrderClick(order.id)}
                  className="hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    #{order.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {order.customers ? order.customers.name : order.customer_name}
                    </div>
                    <div className="text-sm text-gray-500">
                      {order.customers ? order.customers.phone : order.customer_phone}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      order.payment_method === 'bank' 
                        ? 'bg-blue-100 text-blue-800' 
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {order.payment_method === 'bank' ? 'Chuyển khoản' : 'Tiền mặt'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(order.status || 'store_holds')}`}>
                      {getStatusDisplay(order.status || 'store_holds')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(order.created_date).toLocaleDateString('vi-VN')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(order.expected_delivery_date).toLocaleDateString('vi-VN')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-green-600">
                    {formatCurrency(order.total_amount)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {order.created_by || 'N/A'}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Trang {currentPage} / {totalPages} - 
            Hiển thị {(currentPage - 1) * itemsPerPage + 1}-{Math.min(currentPage * itemsPerPage, totalOrders)} 
            trong tổng số {totalOrders} đơn hàng
          </div>
          
          <div className="flex space-x-1">
            {/* Previous button */}
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                currentPage === 1
                  ? 'text-gray-300 cursor-not-allowed'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              ← Trước
            </button>

            {/* Page numbers */}
            {[...Array(totalPages)].map((_, index) => {
              const page = index + 1;
              const isCurrentPage = page === currentPage;
              const shouldShow = 
                page === 1 || 
                page === totalPages || 
                (page >= currentPage - 1 && page <= currentPage + 1);

              if (!shouldShow) {
                // Show ellipsis
                if (page === currentPage - 2 || page === currentPage + 2) {
                  return (
                    <span key={page} className="px-3 py-2 text-gray-500">
                      ...
                    </span>
                  );
                }
                return null;
              }

              return (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    isCurrentPage
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {page}
                </button>
              );
            })}

            {/* Next button */}
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                currentPage === totalPages
                  ? 'text-gray-300 cursor-not-allowed'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              Tiếp →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default OrderList;