import React, { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import Loading from '../../components/Loading';
import PageHeader from '../../components/PageHeader';
import SearchInput from '../../components/SearchInput';
import Pagination from '../../components/Pagination';
import StatusBadge from '../../components/StatusBadge';
import ImportOrderResaleListFilters from './components/ImportOrderResaleListFilters';
import {
  Tables,
  ImportOrderResaleFields,
  ImportOrderResaleSelectSummary,
  getImportOrderResaleStatusBadgeColor,
  getImportOrderResaleStatusDisplay,
  formatCurrency,
  formatDate,
} from '../../models';

function ImportOrderResaleList() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [searchId, setSearchId] = useState(searchParams.get('search') || '');
  const [debouncedSearchId, setDebouncedSearchId] = useState(searchParams.get('search') || '');
  const [statusFilter, setStatusFilter] = useState(searchParams.getAll('status') || []);
  const [dateFrom, setDateFrom] = useState(searchParams.get('dateFrom') || '');
  const [dateTo, setDateTo] = useState(searchParams.get('dateTo') || '');
  const [receivedFrom, setReceivedFrom] = useState(searchParams.get('receivedFrom') || '');
  const [receivedTo, setReceivedTo] = useState(searchParams.get('receivedTo') || '');
  const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get('page') || '1', 10));
  const [totalItems, setTotalItems] = useState(0);
  const [sortBy, setSortBy] = useState(searchParams.get('sortBy') || ImportOrderResaleFields.CREATED_AT);
  const [sortOrder, setSortOrder] = useState(searchParams.get('sortOrder') || 'desc');
  const itemsPerPage = 10;

  const handleApplyFilters = useCallback((filters) => {
    setDateFrom(filters.dateFrom || '');
    setDateTo(filters.dateTo || '');
    setReceivedFrom(filters.receivedFrom || '');
    setReceivedTo(filters.receivedTo || '');
    setStatusFilter(filters.statusFilter || []);
    setCurrentPage(1);
  }, []);

  const fetchItems = useCallback(async () => {
    try {
      setLoading(true);
      setMessage('');
      const offset = (currentPage - 1) * itemsPerPage;

      let query = supabase
        .from(Tables.IMPORT_ORDER_RESALES)
        .select(ImportOrderResaleSelectSummary, { count: 'exact' })
        .order(sortBy, { ascending: sortOrder === 'asc' })
        .range(offset, offset + itemsPerPage - 1);

      if (debouncedSearchId.trim()) {
        const value = debouncedSearchId.trim();
        if (!Number.isNaN(Number(value))) {
          query = query.or(`${ImportOrderResaleFields.ID}.eq.${value},${ImportOrderResaleFields.IMPORT_ORDER_ID}.eq.${value}`);
        } else {
          query = query.ilike(ImportOrderResaleFields.ANCARAT_INVOICE_NUMBER, `%${value}%`);
        }
      }

      if (statusFilter.length > 0) query = query.in(ImportOrderResaleFields.STATUS, statusFilter);
      if (dateFrom) query = query.gte(ImportOrderResaleFields.RESALE_DATE, dateFrom);
      if (dateTo) query = query.lte(ImportOrderResaleFields.RESALE_DATE, dateTo);
      if (receivedFrom) query = query.gte(ImportOrderResaleFields.EXPECTED_RECEIVED_DATE, receivedFrom);
      if (receivedTo) query = query.lte(ImportOrderResaleFields.EXPECTED_RECEIVED_DATE, receivedTo);

      const { data, error, count } = await query;
      if (error) throw error;

      setItems(data || []);
      setTotalItems(count || 0);
    } catch (error) {
      console.error('Error fetching import order resales:', error);
      setMessage(`Lỗi tải giao dịch bán lại Ancarat: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }, [currentPage, dateFrom, dateTo, debouncedSearchId, receivedFrom, receivedTo, sortBy, sortOrder, statusFilter]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (debouncedSearchId) params.set('search', debouncedSearchId);
    if (currentPage > 1) params.set('page', String(currentPage));
    if (dateFrom) params.set('dateFrom', dateFrom);
    if (dateTo) params.set('dateTo', dateTo);
    if (receivedFrom) params.set('receivedFrom', receivedFrom);
    if (receivedTo) params.set('receivedTo', receivedTo);
    if (statusFilter.length > 0) statusFilter.forEach((status) => params.append('status', status));
    if (sortBy !== ImportOrderResaleFields.CREATED_AT) params.set('sortBy', sortBy);
    if (sortOrder !== 'desc') params.set('sortOrder', sortOrder);
    setSearchParams(params, { replace: true });
  }, [currentPage, dateFrom, dateTo, debouncedSearchId, receivedFrom, receivedTo, setSearchParams, sortBy, sortOrder, statusFilter]);

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
    setReceivedFrom('');
    setReceivedTo('');
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
    if (e.metaKey || e.ctrlKey || e.button === 1) return;
    e.preventDefault();
    navigate(`/import-order-resales/${itemId}`);
  };

  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const activeFiltersCount =
    (dateFrom ? 1 : 0) +
    (dateTo ? 1 : 0) +
    (receivedFrom ? 1 : 0) +
    (receivedTo ? 1 : 0) +
    (statusFilter.length > 0 ? 1 : 0);

  return (
    <div className="mx-auto max-w-7xl px-0 sm:px-2 lg:px-4">
      <PageHeader
        title="Bán lại Ancarat"
        subtitle="Quản lý các giao dịch bán lại đơn nhập Ancarat."
        badge={`${totalItems} giao dịch`}
      />

      <div className="mb-6">
        <SearchInput
          value={searchId}
          onChange={setSearchId}
          onSubmit={handleSearchSubmit}
          onClear={handleClearSearch}
          placeholder="Tìm theo mã giao dịch, mã đơn nhập hoặc số hóa đơn..."
          label="Tìm kiếm giao dịch bán lại Ancarat"
        />
      </div>

      {/* Filter Component */}
      <div className="mb-6">
        <ImportOrderResaleListFilters
          dateFrom={dateFrom}
          dateTo={dateTo}
          receivedFrom={receivedFrom}
          receivedTo={receivedTo}
          statusFilter={statusFilter}
          onApplyFilters={handleApplyFilters}
          onClearFilters={handleClearFilters}
          activeFiltersCount={activeFiltersCount}
        />
      </div>

      {message && (
        <div className="mb-6 p-4 rounded-lg bg-red-50 text-red-700 border border-red-200">
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
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Số hóa đơn</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" onClick={() => handleSort(ImportOrderResaleFields.RESALE_DATE)}>
                <div className="flex items-center space-x-1">
                  <span>Ngày bán</span>
                  {sortBy === ImportOrderResaleFields.RESALE_DATE && <span className="text-blue-600">{sortOrder === 'asc' ? '↑' : '↓'}</span>}
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" onClick={() => handleSort(ImportOrderResaleFields.EXPECTED_RECEIVED_DATE)}>
                <div className="flex items-center space-x-1">
                  <span>Ngày nhận tiền</span>
                  {sortBy === ImportOrderResaleFields.EXPECTED_RECEIVED_DATE && <span className="text-blue-600">{sortOrder === 'asc' ? '↑' : '↓'}</span>}
                </div>
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" onClick={() => handleSort(ImportOrderResaleFields.TOTAL_AMOUNT)}>
                <div className="flex items-center justify-end space-x-1">
                  <span>Tổng tiền</span>
                  {sortBy === ImportOrderResaleFields.TOTAL_AMOUNT && <span className="text-blue-600">{sortOrder === 'asc' ? '↑' : '↓'}</span>}
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <Loading type="table" message="Đang tải giao dịch bán lại Ancarat..." colSpan="7" />
            ) : items.length === 0 ? (
              <tr>
                <td colSpan="7" className="px-6 py-12 text-center text-gray-500">Chưa có giao dịch bán lại nào</td>
              </tr>
            ) : (
              items.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Link to={`/import-order-resales/${item.id}`} onClick={(e) => handleLinkClick(e, item.id)} className="text-blue-600 hover:text-blue-800">
                      #{item.id}
                    </Link>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Link to={`/imports/${item.import_order_id}`} className="text-gray-900 hover:text-blue-600">
                      #{item.import_order_id}
                    </Link>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Link 
                      to={`/import-order-resales/${item.id}`}
                      onClick={(e) => handleLinkClick(e, item.id)}
                      className="text-gray-900 hover:text-blue-600"
                    >
                      {item.ancarat_invoice_number || 'N/A'}
                    </Link>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Link 
                      to={`/import-order-resales/${item.id}`}
                      onClick={(e) => handleLinkClick(e, item.id)}
                      className="block"
                    >
                      <StatusBadge color={getImportOrderResaleStatusBadgeColor(item.status)}>
                        {getImportOrderResaleStatusDisplay(item.status)}
                      </StatusBadge>
                    </Link>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <Link 
                      to={`/import-order-resales/${item.id}`}
                      onClick={(e) => handleLinkClick(e, item.id)}
                      className="text-gray-900 hover:text-blue-600"
                    >
                      {formatDate(item.resale_date)}
                    </Link>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <Link 
                      to={`/import-order-resales/${item.id}`}
                      onClick={(e) => handleLinkClick(e, item.id)}
                      className="text-gray-900 hover:text-blue-600"
                    >
                      {formatDate(item.expected_received_date)}
                    </Link>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-bold text-gray-900">
                    <Link 
                      to={`/import-order-resales/${item.id}`}
                      onClick={(e) => handleLinkClick(e, item.id)}
                      className="text-gray-900 hover:text-green-600"
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

export default ImportOrderResaleList;
