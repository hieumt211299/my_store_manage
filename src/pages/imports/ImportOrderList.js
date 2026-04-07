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
  const [createdDateFrom, setCreatedDateFrom] = useState(searchParams.get('createdDateFrom') || '');
  const [createdDateTo, setCreatedDateTo] = useState(searchParams.get('createdDateTo') || '');
  const [expectedReturnDateFrom, setExpectedReturnDateFrom] = useState(searchParams.get('expectedReturnDateFrom') || '');
  const [expectedReturnDateTo, setExpectedReturnDateTo] = useState(searchParams.get('expectedReturnDateTo') || '');
  const [actualReturnDateFrom, setActualReturnDateFrom] = useState(searchParams.get('actualReturnDateFrom') || '');
  const [actualReturnDateTo, setActualReturnDateTo] = useState(searchParams.get('actualReturnDateTo') || '');
  const [sourceFilter, setSourceFilter] = useState(searchParams.get('source') || '');
  const [statusFilter, setStatusFilter] = useState(searchParams.getAll('status') || []);
  
  // Product search states
  const [productFilter, setProductFilter] = useState(
    searchParams.get('productId') || ''
  );
  const [quantity, setQuantity] = useState(
    searchParams.get('quantity') ? parseInt(searchParams.get('quantity')) : null
  );
  
  // Sorting states
  const [sortBy, setSortBy] = useState(searchParams.get('sortBy') || ImportOrderFields.IMPORT_DATE);
  const [sortOrder, setSortOrder] = useState(searchParams.get('sortOrder') || 'desc');
  
  // Debounced search ID
  const [debouncedSearchId, setDebouncedSearchId] = useState(searchParams.get('search') || '');

  const normalizedProductFilter = productFilter ? String(productFilter) : '';

  // Handle apply filters callback from ImportListFilters
  const handleApplyFilters = useCallback((filters) => {
    setCreatedDateFrom(filters.createdDateFrom);
    setCreatedDateTo(filters.createdDateTo);
    setExpectedReturnDateFrom(filters.expectedReturnDateFrom);
    setExpectedReturnDateTo(filters.expectedReturnDateTo);
    setActualReturnDateFrom(filters.actualReturnDateFrom);
    setActualReturnDateTo(filters.actualReturnDateTo);
    setSourceFilter(filters.sourceFilter);
    setStatusFilter(filters.statusFilter);
    setProductFilter(filters.productFilter);
    setQuantity(filters.quantity);
    setCurrentPage(1); // Reset pagination when filters change
  }, []);

  // Fetch imports from database with pagination and search
  const fetchImports = useCallback(async () => {
    try {
      setLoading(true);
      setMessage('');
      const offset = (currentPage - 1) * itemsPerPage;
      
      let query = supabase
        .from(Tables.IMPORT_ORDERS)
        .select(ImportOrderSelectWithItems, { count: 'exact' })
        .order(sortBy, { ascending: sortOrder === 'asc' });

      // Only apply pagination if no product search (since we need all data for client-side filtering)
      if (!normalizedProductFilter && !quantity) {
        query = query.range(offset, offset + itemsPerPage - 1);
      }

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
      if (createdDateFrom) query = query.gte(ImportOrderFields.IMPORT_DATE, createdDateFrom);
      if (createdDateTo) query = query.lte(ImportOrderFields.IMPORT_DATE, createdDateTo);
      if (expectedReturnDateFrom) query = query.gte(ImportOrderFields.EXPECTED_RETURN_DATE, expectedReturnDateFrom);
      if (expectedReturnDateTo) query = query.lte(ImportOrderFields.EXPECTED_RETURN_DATE, expectedReturnDateTo);
      if (actualReturnDateFrom) query = query.gte(ImportOrderFields.ACTUAL_RETURN_DATE, actualReturnDateFrom);
      if (actualReturnDateTo) query = query.lte(ImportOrderFields.ACTUAL_RETURN_DATE, actualReturnDateTo);
      if (sourceFilter) query = query.eq(ImportOrderFields.SOURCE_TYPE, sourceFilter);
      if (statusFilter.length > 0) query = query.in(ImportOrderFields.STATUS, statusFilter);

      const { data, error, count } = await query;

      if (error) throw error;
      
      let filteredData = data || [];
      let finalCount = count || 0;
      
      // Client-side product filtering 
      // TODO: Optimize with Supabase RPC function for better performance with large datasets
      if (normalizedProductFilter || quantity) {
        filteredData = filteredData.filter(importOrder => {
          return importOrder.import_items && importOrder.import_items.some(item => {
            let matches = true;
            
            if (normalizedProductFilter) {
              matches = matches && String(item.products?.id || '') === normalizedProductFilter;
            }
            
            if (quantity) {
              matches = matches && item.quantity === quantity;
            }
            
            return matches;
          });
        });
        finalCount = filteredData.length;
        
        // Re-paginate filtered results
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        filteredData = filteredData.slice(startIndex, endIndex);
      }

      setImports(filteredData);
      setTotalImports(finalCount);
    } catch (error) {
      console.error('Error fetching imports:', error);
      setMessage(`Lỗi tải đơn nhập: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }, [
    currentPage,
    debouncedSearchId,
    itemsPerPage,
    createdDateFrom,
    createdDateTo,
    expectedReturnDateFrom,
    expectedReturnDateTo,
    actualReturnDateFrom,
    actualReturnDateTo,
    sourceFilter,
    statusFilter,
    normalizedProductFilter,
    quantity,
    sortBy,
    sortOrder,
  ]);

  // Update URL when state changes
  useEffect(() => {
    const params = new URLSearchParams();
    
    if (debouncedSearchId) params.set('search', debouncedSearchId);
    if (currentPage > 1) params.set('page', currentPage.toString());
    if (createdDateFrom) params.set('createdDateFrom', createdDateFrom);
    if (createdDateTo) params.set('createdDateTo', createdDateTo);
    if (expectedReturnDateFrom) params.set('expectedReturnDateFrom', expectedReturnDateFrom);
    if (expectedReturnDateTo) params.set('expectedReturnDateTo', expectedReturnDateTo);
    if (actualReturnDateFrom) params.set('actualReturnDateFrom', actualReturnDateFrom);
    if (actualReturnDateTo) params.set('actualReturnDateTo', actualReturnDateTo);
    if (sourceFilter) params.set('source', sourceFilter);
    if (statusFilter.length > 0) statusFilter.forEach((status) => params.append('status', status));
    if (productFilter) params.set('productId', productFilter);
    if (quantity) params.set('quantity', quantity.toString());
    if (sortBy !== ImportOrderFields.IMPORT_DATE) params.set('sortBy', sortBy);
    if (sortOrder !== 'desc') params.set('sortOrder', sortOrder);

    const newSearch = params.toString();
    const currentSearch = searchParams.toString();
    if (newSearch !== currentSearch) {
      setSearchParams(params, { replace: true });
    }
  }, [
    debouncedSearchId,
    currentPage,
    createdDateFrom,
    createdDateTo,
    expectedReturnDateFrom,
    expectedReturnDateTo,
    actualReturnDateFrom,
    actualReturnDateTo,
    sourceFilter,
    statusFilter,
    productFilter,
    quantity,
    sortBy,
    sortOrder,
    searchParams,
    setSearchParams,
  ]);

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
    setCreatedDateFrom('');
    setCreatedDateTo('');
    setExpectedReturnDateFrom('');
    setExpectedReturnDateTo('');
    setActualReturnDateFrom('');
    setActualReturnDateTo('');
    setSourceFilter('');
    setStatusFilter([]);
    setProductFilter('');
    setQuantity(null);
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
    if (createdDateFrom) count++;
    if (createdDateTo) count++;
    if (expectedReturnDateFrom) count++;
    if (expectedReturnDateTo) count++;
    if (actualReturnDateFrom) count++;
    if (actualReturnDateTo) count++;
    if (sourceFilter) count++;
    if (statusFilter.length > 0) count++;
    if (productFilter) count++;
    if (quantity) count++;
    return count;
  };

  const activeFiltersCount = getActiveFiltersCount();
  const totalActiveFilters = activeFiltersCount + (debouncedSearchId ? 1 : 0);

  // Calculate total pages
  const totalPages = Math.ceil(totalImports / itemsPerPage);

  return (
    <div className="mx-auto max-w-7xl px-0 sm:px-2 lg:px-4">
      <PageHeader
        title="Danh sách đơn nhập"
        subtitle="Quản lý đơn nhập hàng từ Ancarat và khách bán"
        actions={
          <Link
            to="/imports/create"
            className="inline-flex w-full items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700 sm:w-auto"
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
      <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex items-center space-x-4">
          <ImportListFilters
          createdDateFrom={createdDateFrom}
          createdDateTo={createdDateTo}
          expectedReturnDateFrom={expectedReturnDateFrom}
          expectedReturnDateTo={expectedReturnDateTo}
          actualReturnDateFrom={actualReturnDateFrom}
          actualReturnDateTo={actualReturnDateTo}
          sourceFilter={sourceFilter}
          statusFilter={statusFilter}
          productFilter={productFilter}
          quantity={quantity}
          onApplyFilters={handleApplyFilters}
          onClearFilters={handleClearFilters}
          activeFiltersCount={activeFiltersCount}
        />
        </div>
        <div className="text-sm text-gray-500 lg:text-right">
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
      <div className="overflow-hidden rounded-lg bg-white shadow-md">
        <div className="border-b border-gray-100 px-4 py-3 text-xs text-gray-500 sm:hidden">
          Vuốt ngang để xem đầy đủ thông tin bảng.
        </div>
        <div className="overflow-x-auto">
        <table className="w-full min-w-[1100px] divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nguồn nhập
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort(ImportOrderFields.IMPORT_DATE)}>
                <div className="flex items-center space-x-1">
                  <span>Ngày tạo</span>
                  {sortBy === ImportOrderFields.IMPORT_DATE && (
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
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ngày trả thực tế
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
              <Loading type="table" message="Đang tải đơn nhập..." colSpan="8" />
            ) : imports.length === 0 ? (
              <tr>
                <td colSpan="8" className="px-6 py-12 text-center">
                  <div className="text-gray-500">
                    {totalActiveFilters > 0
                      ? 'Không tìm thấy đơn nhập phù hợp với bộ lọc hiện tại'
                      : searchId
                        ? 'Không tìm thấy đơn nhập'
                        : 'Chưa có đơn nhập nào'}
                  </div>
                  {productFilter && quantity && (
                    <div className="mt-2 text-sm text-gray-400">
                      Số lượng lọc theo số lượng thực tế của dòng nhập hàng, không theo chữ trong tên sản phẩm.
                    </div>
                  )}
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
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <Link
                      to={`/imports/${importOrder[ImportOrderFields.ID]}`}
                      onClick={(e) => handleLinkClick(e, importOrder[ImportOrderFields.ID])}
                      className="text-gray-900 hover:text-blue-600"
                    >
                      {importOrder[ImportOrderFields.ACTUAL_RETURN_DATE]
                        ? formatDate(importOrder[ImportOrderFields.ACTUAL_RETURN_DATE])
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
