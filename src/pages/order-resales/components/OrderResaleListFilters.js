import React, { useState, useEffect } from 'react';
import {
  FiCalendar,
  FiChevronDown,
  FiDollarSign,
  FiFilter,
  FiList,
} from 'react-icons/fi';
import DropdownMultiSelect from '../../../components/DropdownMultiSelect';
import {
  OrderResaleStatus,
  OrderResaleStatusLabels,
} from '../../../models';

function OrderResaleListFilters({
  dateFrom,
  dateTo,
  paymentFrom,
  paymentTo,
  statusFilter,
  onApplyFilters,
  onClearFilters,
  activeFiltersCount,
}) {
  const [showFilters, setShowFilters] = useState(false);
  const [localFilters, setLocalFilters] = useState({
    dateFrom: dateFrom || '',
    dateTo: dateTo || '',
    paymentFrom: paymentFrom || '',
    paymentTo: paymentTo || '',
    statusFilter: statusFilter || [],
  });

  useEffect(() => {
    setLocalFilters({
      dateFrom: dateFrom || '',
      dateTo: dateTo || '',
      paymentFrom: paymentFrom || '',
      paymentTo: paymentTo || '',
      statusFilter: statusFilter || [],
    });
  }, [dateFrom, dateTo, paymentFrom, paymentTo, statusFilter]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.filter-dropdown')) {
        setShowFilters(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleClearAll = () => {
    setShowFilters(false);
    onClearFilters();
  };

  const updateLocalFilter = (key, value) => {
    setLocalFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleApply = () => {
    setShowFilters(false);
    onApplyFilters(localFilters);
  };

  const hasPendingChanges = (
    localFilters.dateFrom !== (dateFrom || '') ||
    localFilters.dateTo !== (dateTo || '') ||
    localFilters.paymentFrom !== (paymentFrom || '') ||
    localFilters.paymentTo !== (paymentTo || '') ||
    JSON.stringify(localFilters.statusFilter) !== JSON.stringify(statusFilter || [])
  );

  // Convert status enum to options for DropdownMultiSelect
  const statusOptions = Object.values(OrderResaleStatus).map(status => ({
    value: status,
    label: OrderResaleStatusLabels[status],
  }));

  return (
    <>
      {/* Filter Button */}
      <div className="relative filter-dropdown">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-colors ${
            showFilters || activeFiltersCount > 0
              ? 'bg-blue-50 border-blue-300 text-blue-700'
              : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
          }`}
        >
          <span className="inline-flex items-center gap-2">
            <FiFilter className="h-4 w-4" />
            <span>Bộ lọc</span>
          </span>
          {activeFiltersCount > 0 && (
            <span className="bg-blue-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {activeFiltersCount}
            </span>
          )}
          {hasPendingChanges && (
            <span className="bg-orange-500 w-2 h-2 rounded-full" title="Có thay đổi chưa áp dụng"></span>
          )}
          <FiChevronDown className={`h-4 w-4 transform transition-transform ${showFilters ? 'rotate-180' : ''}`} />
        </button>

        {showFilters && (
          <div className="absolute top-full left-0 z-50 mt-2 w-[calc(100vw-2rem)] max-w-96 rounded-lg border border-gray-200 bg-white shadow-lg sm:w-96">
            <div className="p-4 space-y-4">
              {/* Date Range */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  <span className="inline-flex items-center gap-2">
                    <FiCalendar className="h-4 w-4" />
                    <span>Ngày bán</span>
                  </span>
                </label>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <input
                    type="date"
                    value={localFilters.dateFrom}
                    onChange={(e) => updateLocalFilter('dateFrom', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Từ ngày"
                  />
                  <input
                    type="date"
                    value={localFilters.dateTo}
                    onChange={(e) => updateLocalFilter('dateTo', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Đến ngày"
                  />
                </div>
              </div>

              {/* Payment Date Range */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  <span className="inline-flex items-center gap-2">
                    <FiDollarSign className="h-4 w-4" />
                    <span>Ngày chuyển tiền</span>
                  </span>
                </label>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <input
                    type="date"
                    value={localFilters.paymentFrom}
                    onChange={(e) => updateLocalFilter('paymentFrom', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Từ ngày"
                  />
                  <input
                    type="date"
                    value={localFilters.paymentTo}
                    onChange={(e) => updateLocalFilter('paymentTo', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Đến ngày"
                  />
                </div>
              </div>

              {/* Status Filter */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  <span className="inline-flex items-center gap-2">
                    <FiList className="h-4 w-4" />
                    <span>Trạng thái</span>
                  </span>
                </label>
                <DropdownMultiSelect
                  values={localFilters.statusFilter}
                  onChange={(values) => updateLocalFilter('statusFilter', values)}
                  options={statusOptions}
                  placeholder="Chọn một hoặc nhiều trạng thái"
                  searchPlaceholder="Tìm trạng thái..."
                  emptyText="Không tìm thấy trạng thái"
                />
              </div>

              {/* Actions */}
              <div className="flex justify-between pt-3 border-t border-gray-200">
                <button
                  onClick={handleClearAll}
                  className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
                  disabled={activeFiltersCount === 0}
                >
                  ✕ Xóa tất cả
                </button>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setShowFilters(false)}
                    className="px-4 py-2 bg-gray-600 text-white text-sm rounded-md hover:bg-gray-700"
                  >
                    Đóng
                  </button>
                  <button
                    onClick={handleApply}
                    className={`px-4 py-2 text-sm rounded-md transition-colors ${
                      hasPendingChanges
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                    disabled={!hasPendingChanges}
                  >
                    Áp dụng
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Active Filters Summary */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap items-center gap-2 mt-4">
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
          {paymentFrom && (
            <span className="bg-blue-100 text-blue-800 text-xs px-3 py-1 rounded-full">
              Chuyển từ: {new Date(paymentFrom).toLocaleDateString('vi-VN')}
            </span>
          )}
          {paymentTo && (
            <span className="bg-blue-100 text-blue-800 text-xs px-3 py-1 rounded-full">
              Chuyển đến: {new Date(paymentTo).toLocaleDateString('vi-VN')}
            </span>
          )}
          {statusFilter.map((status) => (
            <span key={status} className="bg-blue-100 text-blue-800 text-xs px-3 py-1 rounded-full">
              TT: {OrderResaleStatusLabels[status]}
            </span>
          ))}
          <button onClick={handleClearAll} className="text-xs text-gray-500 hover:text-gray-700 ml-2">
            ✕ Xóa bộ lọc
          </button>
        </div>
      )}
    </>
  );
}

export default OrderResaleListFilters;
