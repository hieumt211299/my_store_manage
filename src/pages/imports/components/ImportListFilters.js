import React, { useState, useEffect } from 'react';
import DropdownMultiSelect from '../../../components/DropdownMultiSelect';
import SearchInputDropdown from '../../../components/SearchInputDropdown';
import { supabase } from '../../../lib/supabase';
import {
  ImportOrderStatus,
  ImportOrderSourceType,
  ImportOrderSourceTypeLabels,
  getImportStatusDisplay,
  Tables,
  ProductFields,
} from '../../../models';

function ImportListFilters({
  dateFrom,
  dateTo,
  sourceFilter,
  statusFilter,
  productFilter,
  quantity,
  onApplyFilters,
  onClearFilters,
  activeFiltersCount,
}) {
  const [showFilters, setShowFilters] = useState(false);
  
  // Local filter state for manual apply pattern
  const [localFilters, setLocalFilters] = useState({
    dateFrom: dateFrom || '',
    dateTo: dateTo || '',
    sourceFilter: sourceFilter || '',
    statusFilter: statusFilter || [],
    productFilter: productFilter || '',
    quantity: quantity || null,
  });
  
  // Selected product name for display
  const [selectedProductName, setSelectedProductName] = useState('');
  
  // Update local state when props change
  useEffect(() => {
    setLocalFilters({
      dateFrom: dateFrom || '',
      dateTo: dateTo || '',
      sourceFilter: sourceFilter || '',
      statusFilter: statusFilter || [],
      productFilter: productFilter || '',
      quantity: quantity || null,
    });
  }, [dateFrom, dateTo, sourceFilter, statusFilter, productFilter, quantity]);

  // Fetch product name whenever productFilter prop changes
  useEffect(() => {
    if (!productFilter) {
      setSelectedProductName('');
      return;
    }

    const fetchProductName = async () => {
      try {
        const { data: product, error } = await supabase
          .from(Tables.PRODUCTS)
          .select(`${ProductFields.ID}, ${ProductFields.NAME}, ${ProductFields.SKU}`)
          .eq(ProductFields.ID, productFilter)
          .single();

        if (error) throw error;

        if (product) {
          const displayName = product[ProductFields.SKU]
            ? `${product[ProductFields.NAME]} (${product[ProductFields.SKU]})`
            : product[ProductFields.NAME];
          setSelectedProductName(displayName);
        } else {
          setSelectedProductName('');
        }
      } catch (error) {
        console.error('Error fetching product name:', error);
        setSelectedProductName('');
      }
    };

    fetchProductName();
  }, [productFilter]);
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
    setSelectedProductName('');
    onClearFilters();
  };
  
  const handleApplyFilters = () => {
    setShowFilters(false);
    onApplyFilters(localFilters);
  };
  
  const updateLocalFilter = (key, value) => {
    setLocalFilters(prev => ({ ...prev, [key]: value }));
  };
  
  const handleProductChange = (productId, productItem) => {
    const displayName = productItem ? 
      (productItem[ProductFields.SKU] ? 
        `${productItem[ProductFields.NAME]} (${productItem[ProductFields.SKU]})` : 
        productItem[ProductFields.NAME]) : '';
    setSelectedProductName(displayName);
    updateLocalFilter('productFilter', productId || '');
  };
  
  // Check if filters have pending changes
  const hasPendingChanges = (
    localFilters.dateFrom !== (dateFrom || '') ||
    localFilters.dateTo !== (dateTo || '') ||
    localFilters.sourceFilter !== (sourceFilter || '') ||
    JSON.stringify(localFilters.statusFilter) !== JSON.stringify(statusFilter || []) ||
    localFilters.productFilter !== (productFilter || '') ||
    localFilters.quantity !== (quantity || null)
  );

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
          {hasPendingChanges && (
            <span className="bg-orange-500 w-2 h-2 rounded-full" title="Có thay đổi chưa áp dụng"></span>
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

            {/* Source Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">📦 Nguồn nhập</label>
              <select
                value={localFilters.sourceFilter}
                onChange={(e) => updateLocalFilter('sourceFilter', e.target.value)}
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
                values={localFilters.statusFilter}
                onChange={(values) => updateLocalFilter('statusFilter', values)}
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

            {/* Product Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">📦 Sản phẩm</label>
              <SearchInputDropdown
                tableName={Tables.PRODUCTS}
                selectedId={localFilters.productFilter}
                selectedDisplayName={selectedProductName}
                onSelectionChange={handleProductChange}
                placeholder="Tìm kiếm sản phẩm..."
                emoji="📦"
                className="relative product-search-container"
                fields={{
                  id: ProductFields.ID,
                  name: ProductFields.NAME,
                  searchFields: [ProductFields.NAME, ProductFields.SKU],
                  displayFields: [ProductFields.SKU]
                }}
                formatDisplayText={(product) => product[ProductFields.SKU] ? `${product[ProductFields.NAME]} (${product[ProductFields.SKU]})` : product[ProductFields.NAME]}
                formatDropdownItem={(product) => ({
                  primary: product[ProductFields.NAME],
                  secondary: product[ProductFields.SKU] ? `SKU: ${product[ProductFields.SKU]}` : 'Chưa có SKU'
                })}
              />
            </div>

            {/* Quantity Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">🔢 Số lượng</label>
              <input
                type="number"
                min="1"
                value={localFilters.quantity || ''}
                onChange={(e) => updateLocalFilter('quantity', e.target.value ? parseInt(e.target.value) : null)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Nhập số lượng cần tìm..."
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
                  onClick={handleApplyFilters}
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
          {productFilter && (
            <span className="bg-blue-100 text-blue-800 text-xs px-3 py-1 rounded-full">
              SP: {selectedProductName || `ID ${productFilter}`}
            </span>
          )}
          {quantity && (
            <span className="bg-blue-100 text-blue-800 text-xs px-3 py-1 rounded-full">
              SL: {quantity}
            </span>
          )}
          <button onClick={handleClearAll} className="text-xs text-gray-500 hover:text-gray-700 ml-2">
            ✕ Xóa bộ lọc
          </button>
        </div>
      )}
    </>
  );
}

export default ImportListFilters;
