import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import Loading from '../../components/Loading';
import PageHeader from '../../components/PageHeader';
import SearchInput from '../../components/SearchInput';
import Pagination from '../../components/Pagination';
import ImportListFilters from './components/ImportListFilters';
import {
  Tables,
  ImportOrderFields,
  ImportOrderSelectWithItems,
  getImportStatusDisplay,
  getImportStatusBadgeColor,
  ImportOrderSourceTypeLabels,
  ImportOrderSourceTypeBadgeColors,
  formatCurrency,
  formatDate,
} from '../../models';

function ImportOrderList() {
  const navigate = useNavigate();
  const [imports, setImports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [searchId, setSearchId] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalImports, setTotalImports] = useState(0);
  const [itemsPerPage] = useState(10);
  
  // Filter states
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [sourceFilter, setSourceFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  
  // Sorting states
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');
  
  // Debounced search ID
  const [debouncedSearchId, setDebouncedSearchId] = useState('');

  // Fetch imports from database with pagination and search
  const fetchImports = useCallback(async () => {
    try {
      setLoading(true);
      setMessage('');
      const offset = (currentPage - 1) * itemsPerPage;
      
      let query = supabase
        .from(Tables.IMPORT_ORDERS)
        .select(ImportOrderSelectWithItems, { count: 'exact' })
        .order(sortBy, { ascending: sortOrder === 'asc' })
        .range(offset, offset + itemsPerPage - 1);

      // Search by ID or Ancarat invoice number
      if (debouncedSearchId && debouncedSearchId.trim()) {
        const searchValue = debouncedSearchId.trim();
        if (!isNaN(searchValue)) {
          // Search by ID
          query = query.eq(ImportOrderFields.ID, parseInt(searchValue));
        } else {
          // Search by Ancarat invoice number
          query = query.eq(ImportOrderFields.ANCARAT_INVOICE_NUMBER, searchValue);
        }
      }

      // Apply filters
      if (dateFrom) query = query.gte(ImportOrderFields.IMPORT_DATE, dateFrom);
      if (dateTo) query = query.lte(ImportOrderFields.IMPORT_DATE, dateTo);
      if (sourceFilter) query = query.eq(ImportOrderFields.SOURCE_TYPE, sourceFilter);
      if (statusFilter) query = query.eq(ImportOrderFields.STATUS, statusFilter);

      const { data, error, count } = await query;

      if (error) throw error;
      setImports(data || []);
      setTotalImports(count || 0);
    } catch (error) {
      console.error('Error fetching imports:', error);
      setMessage(`Lỗi tải đơn nhập: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }, [currentPage, debouncedSearchId, itemsPerPage, dateFrom, dateTo, sourceFilter, statusFilter, sortBy, sortOrder]);

  useEffect(() => {
    fetchImports();
  }, [fetchImports]);

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
    setSourceFilter('');
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

  // Handle page change
  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Navigate to import detail
  const handleImportClick = (importId) => {
    navigate(`/imports/${importId}`);
  };

  // Count active filters
  const getActiveFiltersCount = () => {
    let count = 0;
    if (dateFrom) count++;
    if (dateTo) count++;
    if (sourceFilter) count++;
    if (statusFilter) count++;
    return count;
  };

  const activeFiltersCount = getActiveFiltersCount();
  const totalActiveFilters = activeFiltersCount + (debouncedSearchId ? 1 : 0);

  // Calculate total pages
  const totalPages = Math.ceil(totalImports / itemsPerPage);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <PageHeader
        title="Danh sách đơn nhập"
        subtitle="Quản lý đơn nhập hàng từ Ancarat và khách bán"
        actions={
          <Link
            to="/imports/create"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            + Tạo đơn nhập
          </Link>
        }
      />

      {message && (
        <div className={`mb-6 p-4 rounded-lg ${
          message.includes('thành công') 
            ? 'bg-green-50 text-green-700 border border-green-200' 
            : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {message}
        </div>
      )}

      {/* Search */}
      <div className="mb-6">
        <SearchInput
          value={searchId}
          onChange={setSearchId}
          onSubmit={handleSearchSubmit}
          onClear={handleClearSearch}
          placeholder="Tìm kiếm theo ID hoặc số hóa đơn Ancarat..."
          label="Tìm kiếm đơn nhập"
        />
      </div>

{/* Filter Bar */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <ImportListFilters
          dateFrom={dateFrom}
          dateTo={dateTo}
          sourceFilter={sourceFilter}
          statusFilter={statusFilter}
          onDateFromChange={setDateFrom}
          onDateToChange={setDateTo}
          onSourceFilterChange={setSourceFilter}
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
     

      {/* Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nguồn nhập
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('created_at')}>
                <div className="flex items-center space-x-1">
                  <span>Ngày tạo</span>
                  {sortBy === 'created_at' && (
                    <span className="text-blue-600">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                  )}
                </div>
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('expected_return_date')}
              >
                <div className="flex items-center space-x-1">
                  <span>Ngày dự kiến trả</span>
                  <div className="flex flex-col">
                    <svg
                      className={`w-3 h-3 ${
                        sortBy === 'expected_return_date' && sortOrder === 'asc' 
                          ? 'text-blue-600' 
                          : 'text-gray-400'
                      }`}
                      fill="currentColor"
                      viewBox="0 0 12 12"
                    >
                      <path d="M6 4l4 4H2z" transform="rotate(180 6 6)" />
                    </svg>
                    <svg
                      className={`w-3 h-3 ${
                        sortBy === 'expected_return_date' && sortOrder === 'desc' 
                          ? 'text-blue-600' 
                          : 'text-gray-400'
                      }`}
                      fill="currentColor"
                      viewBox="0 0 12 12"
                    >
                      <path d="M6 4l4 4H2z" />
                    </svg>
                  </div>
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tổng tiền
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Trạng thái
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <Loading type="table" message="Đang tải đơn nhập..." colSpan="6" />
            ) : imports.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-6 py-12 text-center">
                  <div className="text-gray-500">
                    {searchId ? 'Không tìm thấy đơn nhập' : 'Chưa có đơn nhập nào'}
                  </div>
                  {!searchId && (
                    <Link
                      to="/imports/create"
                      className="mt-2 inline-block text-blue-600 hover:text-blue-800"
                    >
                      Tạo đơn nhập đầu tiên
                    </Link>
                  )}
                </td>
              </tr>
            ) : (
              imports.map((importOrder) => (
                <tr
                  key={importOrder[ImportOrderFields.ID]}
                  onClick={() => handleImportClick(importOrder[ImportOrderFields.ID])}
                  className="hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    #{importOrder[ImportOrderFields.ID]}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      ImportOrderSourceTypeBadgeColors[importOrder[ImportOrderFields.SOURCE_TYPE]] || 'bg-gray-100 text-gray-800'
                    }`}>
                      {ImportOrderSourceTypeLabels[importOrder[ImportOrderFields.SOURCE_TYPE]] || importOrder[ImportOrderFields.SOURCE_TYPE]}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatDate(importOrder[ImportOrderFields.IMPORT_DATE])}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {importOrder[ImportOrderFields.EXPECTED_RETURN_DATE] 
                      ? formatDate(importOrder[ImportOrderFields.EXPECTED_RETURN_DATE])
                      : 'N/A'
                    }
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-green-600">
                    {formatCurrency(importOrder[ImportOrderFields.TOTAL_AMOUNT])}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      getImportStatusBadgeColor(importOrder[ImportOrderFields.STATUS])
                    }`}>
                      {getImportStatusDisplay(importOrder[ImportOrderFields.STATUS])}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="mt-6">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalImports}
            itemsPerPage={itemsPerPage}
            onPageChange={handlePageChange}
            itemLabel="đơn nhập"
          />
        </div>
      )}
    </div>
  );
}

export default ImportOrderList;