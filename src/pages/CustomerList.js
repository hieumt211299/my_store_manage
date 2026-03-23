import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import Loading from '../components/Loading';
import {
  Tables,
  CustomerFields,
  formatDate,
} from '../models';

function CustomerList() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get('page')) || 1);
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [itemsPerPage] = useState(15);

  // Fetch customers from database with pagination and search
  const fetchCustomers = useCallback(async () => {
    try {
      setLoading(true);
      
      // Calculate offset for pagination
      const offset = (currentPage - 1) * itemsPerPage;
      
      let query = supabase
        .from(Tables.CUSTOMERS)
        .select('*', { count: 'exact' })
        .order(CustomerFields.CREATED_AT, { ascending: false })
        .range(offset, offset + itemsPerPage - 1);

      // Apply search filter if searchQuery is provided
      if (searchQuery && searchQuery.trim()) {
        const search = searchQuery.trim();
        query = query.or(`${CustomerFields.NAME}.ilike.%${search}%,${CustomerFields.PHONE}.ilike.%${search}%,${CustomerFields.ID_NUMBER}.ilike.%${search}%`);
      }

      const { data, error, count } = await query;

      if (error) throw error;
      setCustomers(data || []);
      setTotalCustomers(count || 0);
    } catch (error) {
      console.error('Error fetching customers:', error);
      setMessage(`Lỗi tải danh sách khách hàng: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchQuery, itemsPerPage]);

  // Update URL when state changes
  useEffect(() => {
    const params = new URLSearchParams();
    
    if (searchQuery) params.set('search', searchQuery);
    if (currentPage > 1) params.set('page', currentPage.toString());

    const newSearch = params.toString();
    const currentSearch = searchParams.toString();
    if (newSearch !== currentSearch) {
      setSearchParams(params, { replace: true });
    }
  }, [searchQuery, currentPage, searchParams, setSearchParams]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1); // Reset to first page when searching
  };

  // Handle clear search
  const handleClearSearch = () => {
    setSearchQuery('');
    setCurrentPage(1);
  };

  const handleLinkClick = (e, customerId) => {
    if (e.metaKey || e.ctrlKey || e.button === 1) {
      return;
    }
    e.preventDefault();
    navigate(`/customers/${customerId}`);
  };

  // Calculate total pages
  const totalPages = Math.ceil(totalCustomers / itemsPerPage);

  // Handle page change
  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // formatDate imported from models

  return (
    <div className="mx-auto max-w-7xl px-0 sm:px-2 lg:px-4">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-3 md:mb-8 md:flex-row md:items-center md:justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Quản lý khách hàng</h1>
        <div className="flex items-center">
          <span className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-500">
            {totalCustomers} khách hàng
          </span>
        </div>
      </div>

      {/* Search */}
      <div className="mb-6">
        <form onSubmit={handleSearch} className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="w-full md:max-w-md">
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
              Tìm kiếm khách hàng
            </label>
            <div className="flex">
              <input
                id="search"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm theo tên, số điện thoại hoặc CCCD..."
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
          {searchQuery && (
            <button
              type="button"
              onClick={handleClearSearch}
              className="text-left text-gray-500 hover:text-gray-700 md:mb-2"
            >
              ✕ Xóa
            </button>
          )}
        </form>
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
      <div className="overflow-hidden rounded-lg bg-white shadow">
        <div className="border-b border-gray-100 px-4 py-3 text-xs text-gray-500 sm:hidden">
          Vuốt ngang để xem đầy đủ thông tin bảng.
        </div>
        <div className="overflow-x-auto">
        <table className="w-full min-w-[900px] divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Thông tin khách hàng
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                CCCD/CMND
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Số điện thoại
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Địa chỉ
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ngày tạo
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <Loading type="table" message="Đang tải danh sách khách hàng..." colSpan="5" />
            ) : customers.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-6 py-12 text-center">
                  <div className="text-gray-500">
                    {searchQuery ? 'Không tìm thấy khách hàng phù hợp' : 'Chưa có khách hàng nào'}
                  </div>
                  {!searchQuery && (
                    <p className="mt-2 text-sm text-gray-400">
                      Khách hàng sẽ được tạo tự động khi bạn tạo đơn hàng mới
                    </p>
                  )}
                </td>
              </tr>
            ) : (
              customers.map((customer) => (
                <tr 
                  key={customer[CustomerFields.ID]} 
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Link 
                      to={`/customers/${customer[CustomerFields.ID]}`}
                      onClick={(e) => handleLinkClick(e, customer[CustomerFields.ID])}
                      className="flex items-center text-gray-900 hover:text-blue-600"
                    >
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                          <span className="text-sm font-medium text-gray-700">
                            {customer[CustomerFields.NAME].charAt(0).toUpperCase()}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium">
                          {customer[CustomerFields.NAME]}
                        </div>
                        <div className="text-sm text-gray-500">
                          ID: #{customer[CustomerFields.ID]}
                        </div>
                      </div>
                    </Link>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Link 
                      to={`/customers/${customer[CustomerFields.ID]}`}
                      onClick={(e) => handleLinkClick(e, customer[CustomerFields.ID])}
                      className="block text-gray-900 hover:text-blue-600"
                    >
                      <div className="text-sm font-mono">{customer[CustomerFields.ID_NUMBER]}</div>
                      {customer[CustomerFields.ID_ISSUED_DATE] && (
                        <div className="text-sm text-gray-500">
                          Cấp: {formatDate(customer[CustomerFields.ID_ISSUED_DATE])}
                        </div>
                      )}
                    </Link>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Link 
                      to={`/customers/${customer[CustomerFields.ID]}`}
                      onClick={(e) => handleLinkClick(e, customer[CustomerFields.ID])}
                      className="text-gray-900 hover:text-blue-600 font-mono text-sm"
                    >
                      {customer[CustomerFields.PHONE]}
                    </Link>
                  </td>
                  <td className="px-6 py-4">
                    <Link 
                      to={`/customers/${customer[CustomerFields.ID]}`}
                      onClick={(e) => handleLinkClick(e, customer[CustomerFields.ID])}
                      className="block text-gray-900 hover:text-blue-600"
                    >
                      <div className="text-sm max-w-xs truncate" title={customer[CustomerFields.ADDRESS]}>
                        {customer[CustomerFields.ADDRESS]}
                      </div>
                    </Link>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Link 
                      to={`/customers/${customer[CustomerFields.ID]}`}
                      onClick={(e) => handleLinkClick(e, customer[CustomerFields.ID])}
                      className="text-gray-900 hover:text-blue-600 text-sm"
                    >
                      {formatDate(customer[CustomerFields.CREATED_AT])}
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="text-sm text-gray-500">
            Trang {currentPage} / {totalPages} - 
            Hiển thị {(currentPage - 1) * itemsPerPage + 1}-{Math.min(currentPage * itemsPerPage, totalCustomers)} 
            trong tổng số {totalCustomers} khách hàng
          </div>
          
          <div className="flex flex-wrap gap-1">
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

export default CustomerList;
