import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
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
  const [searchParams, setSearchParams] = useSearchParams();
  const [imports, setImports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [searchId, setSearchId] = useState(searchParams.get('search') || '');
  const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get('page')) || 1);
  const [totalImports, setTotalImports] = useState(0);
  const [itemsPerPage] = useState(10);
  
  // Filter states - initialize from URL params
  const [dateFrom, setDateFrom] = useState(searchParams.get('dateFrom') || '');
  const [dateTo, setDateTo] = useState(searchParams.get('dateTo') || '');
  const [sourceFilter, setSourceFilter] = useState(searchParams.get('source') || '');
  const [statusFilter, setStatusFilter] = useState(searchParams.getAll('status') || []);
  
  // Sorting states
  const [sortBy, setSortBy] = useState(searchParams.get('sortBy') || 'created_at');
  const [sortOrder, setSortOrder] = useState(searchParams.get('sortOrder') || 'desc');
  
  // Debounced search ID
  const [debouncedSearchId, setDebouncedSearchId] = useState(searchParams.get('search') || '');

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
      if (statusFilter.length > 0) query = query.in(ImportOrderFields.STATUS, statusFilter);

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

  // Update URL when state changes
  useEffect(() => {
    const params = new URLSearchParams();
    
    if (debouncedSearchId) params.set('search', debouncedSearchId);
    if (currentPage > 1) params.set('page', currentPage.toString());
    if (dateFrom) params.set('dateFrom', dateFrom);
    if (dateTo) params.set('dateTo', dateTo);
    if (sourceFilter) params.set('source', sourceFilter);
    if (statusFilter.length > 0) statusFilter.forEach((status) => params.append('status', status));
    if (sortBy !== 'created_at') params.set('sortBy', sortBy);
    if (sortOrder !== 'desc') params.set('sortOrder', sortOrder);

    const newSearch = params.toString();
    const currentSearch = searchParams.toString();
    if (newSearch !== currentSearch) {
      setSearchParams(params, { replace: true });
    }
  }, [debouncedSearchId, currentPage, dateFrom, dateTo, sourceFilter, statusFilter, sortBy, sortOrder, searchParams, setSearchParams]);

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

  const handleLinkClick = (e, importId) => {
    if (e.metaKey || e.ctrlKey || e.button === 1) {
      return;
    }
    e.preventDefault();
    navigate(`/imports/${importId}`);
  };

  // Handle page change
  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };



  // Count active filters
  const getActiveFiltersCount = () => {
    let count = 0;
    if (dateFrom) count++;
    if (dateTo) count++;
    if (sourceFilter) count++;
    if (statusFilter.length > 0) count++;
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
                onClick={() => handleSort(ImportOrderFields.EXPECTED_RETURN_DATE)}
              >
                <div className="flex items-center space-x-1">
                  <span>Ngày dự kiến trả</span>
                  {sortBy === ImportOrderFields.EXPECTED_RETURN_DATE && (
                    <span className="text-blue-600">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                  )}
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" onClick={() => handleSort(ImportOrderFields.TOTAL_AMOUNT)}>
                <div className="flex items-center space-x-1">
                  <span>Tổng tiền</span>
                  {sortBy === ImportOrderFields.TOTAL_AMOUNT && (
                    <span className="text-blue-600">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                  )}
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Trạng thái
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Người tạo
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <Loading type="table" message="Đang tải đơn nhập..." colSpan="7" />
            ) : imports.length === 0 ? (
              <tr>
                <td colSpan="7" className="px-6 py-12 text-center">
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
                <tr key={importOrder[ImportOrderFields.ID]} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    <Link 
                      to={`/imports/${importOrder[ImportOrderFields.ID]}`}
                      onClick={(e) => handleLinkClick(e, importOrder[ImportOrderFields.ID])}
                      className="text-gray-900 hover:text-blue-600"
                    >
                      #{importOrder[ImportOrderFields.ID]}
                    </Link>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Link 
                      to={`/imports/${importOrder[ImportOrderFields.ID]}`}
                      onClick={(e) => handleLinkClick(e, importOrder[ImportOrderFields.ID])}
                      className="block"
                    >
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        ImportOrderSourceTypeBadgeColors[importOrder[ImportOrderFields.SOURCE_TYPE]] || 'bg-gray-100 text-gray-800'
                      }`}>
                        {ImportOrderSourceTypeLabels[importOrder[ImportOrderFields.SOURCE_TYPE]] || importOrder[ImportOrderFields.SOURCE_TYPE]}
                      </span>
                    </Link>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <Link 
                      to={`/imports/${importOrder[ImportOrderFields.ID]}`}
                      onClick={(e) => handleLinkClick(e, importOrder[ImportOrderFields.ID])}
                      className="text-gray-900 hover:text-blue-600"
                    >
                      {formatDate(importOrder[ImportOrderFields.IMPORT_DATE])}
                    </Link>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <Link 
                      to={`/imports/${importOrder[ImportOrderFields.ID]}`}
                      onClick={(e) => handleLinkClick(e, importOrder[ImportOrderFields.ID])}
                      className="text-gray-900 hover:text-blue-600"
                    >
                      {importOrder[ImportOrderFields.EXPECTED_RETURN_DATE] 
                        ? formatDate(importOrder[ImportOrderFields.EXPECTED_RETURN_DATE])
                        : 'N/A'
                      }
                    </Link>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-green-600">
                    <Link 
                      to={`/imports/${importOrder[ImportOrderFields.ID]}`}
                      onClick={(e) => handleLinkClick(e, importOrder[ImportOrderFields.ID])}
                      className="text-green-600 hover:text-green-800"
                    >
                      {formatCurrency(importOrder[ImportOrderFields.TOTAL_AMOUNT])}
                    </Link>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Link 
                      to={`/imports/${importOrder[ImportOrderFields.ID]}`}
                      onClick={(e) => handleLinkClick(e, importOrder[ImportOrderFields.ID])}
                      className="block"
                    >
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        getImportStatusBadgeColor(importOrder[ImportOrderFields.STATUS])
                      }`}>
                        {getImportStatusDisplay(importOrder[ImportOrderFields.STATUS])}
                      </span>
                    </Link>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Link 
                      to={`/imports/${importOrder[ImportOrderFields.ID]}`}
                      onClick={(e) => handleLinkClick(e, importOrder[ImportOrderFields.ID])}
                      className="block text-gray-900 hover:text-blue-600"
                    >
                      <div className="text-sm">{importOrder[ImportOrderFields.CREATED_BY] || 'N/A'}</div>
                    </Link>
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