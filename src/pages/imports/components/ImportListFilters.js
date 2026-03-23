import React, { useState, useEffect } from 'react';
import DropdownMultiSelect from '../../../components/DropdownMultiSelect';
import {
  ImportOrderStatus,
  ImportOrderSourceType,
  ImportOrderSourceTypeLabels,
  getImportStatusDisplay,
} from '../../../models';

function ImportListFilters({
  dateFrom,
  dateTo,
  sourceFilter,
  statusFilter,
  onDateFromChange,
  onDateToChange,
  onSourceFilterChange,
  onStatusFilterChange,
  onClearFilters,
  activeFiltersCount,
}) {
  const [showFilters, setShowFilters] = useState(false);

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
          <span>🔧 Bộ lọc</span>
          {activeFiltersCount > 0 && (
            <span className="bg-blue-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {activeFiltersCount}
            </span>
          )}
          <span className={`transform transition-transform ${showFilters ? 'rotate-180' : ''}`}>▼</span>
        </button>

      {showFilters && (
        <div className="absolute top-full left-0 z-50 mt-2 w-[calc(100vw-2rem)] max-w-96 rounded-lg border border-gray-200 bg-white shadow-lg sm:w-96">
          <div className="p-4 space-y-4">
            {/* Date Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">📅 Khoảng thời gian</label>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => onDateFromChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Từ ngày"
                />
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => onDateToChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Đến ngày"
                />
              </div>
            </div>

            {/* Source Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">📦 Nguồn nhập</label>
              <select
                value={sourceFilter}
                onChange={(e) => onSourceFilterChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Tất cả nguồn</option>
                <option value={ImportOrderSourceType.ANCARAT}>
                  {ImportOrderSourceTypeLabels[ImportOrderSourceType.ANCARAT]}
                </option>
                <option value={ImportOrderSourceType.CUSTOMER}>
                  {ImportOrderSourceTypeLabels[ImportOrderSourceType.CUSTOMER]}
                </option>
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">📝 Trạng thái</label>
              <DropdownMultiSelect
                values={statusFilter}
                onChange={onStatusFilterChange}
                options={[
                  { value: ImportOrderStatus.PENDING, label: getImportStatusDisplay(ImportOrderStatus.PENDING) },
                  { value: ImportOrderStatus.COMPLETED, label: getImportStatusDisplay(ImportOrderStatus.COMPLETED) },
                  { value: ImportOrderStatus.RESOLD_TO_ANCARAT, label: getImportStatusDisplay(ImportOrderStatus.RESOLD_TO_ANCARAT) },
                ]}
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
              <button
                onClick={() => setShowFilters(false)}
                className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
              >
                Đóng
              </button>
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
          {sourceFilter && (
            <span className="bg-blue-100 text-blue-800 text-xs px-3 py-1 rounded-full">
              Nguồn: {ImportOrderSourceTypeLabels[sourceFilter]}
            </span>
          )}
          {statusFilter.map((status) => (
            <span key={status} className="bg-blue-100 text-blue-800 text-xs px-3 py-1 rounded-full">
              TT: {getImportStatusDisplay(status)}
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

export default ImportListFilters;
