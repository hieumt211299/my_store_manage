import React, { useState, useEffect, useCallback } from 'react';
import DropdownMultiSelect from '../../../components/DropdownMultiSelect';
import { supabase } from '../../../lib/supabase';
import {
  Tables,
  CustomerFields,
  OrderStatusOptions,
  getStatusDisplay,
} from '../../../models';

function OrderListFilters({
  dateFrom,
  dateTo,
  customerFilter,
  statusFilter,
  onDateFromChange,
  onDateToChange,
  onCustomerFilterChange,
  onStatusFilterChange,
  onClearFilters,
  activeFiltersCount,
}) {
  const [showFilters, setShowFilters] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [customerSearchTerm, setCustomerSearchTerm] = useState('');
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [selectedCustomerName, setSelectedCustomerName] = useState('');

  const fetchCustomers = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from(Tables.CUSTOMERS)
        .select(`${CustomerFields.ID}, ${CustomerFields.NAME}, ${CustomerFields.ID_NUMBER}`)
        .order(CustomerFields.NAME);
      if (error) throw error;
      setCustomers(data || []);
    } catch (error) {
      console.error('Error fetching customers:', error);
    }
  }, []);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  useEffect(() => {
    if (customers.length > 0) {
      setFilteredCustomers(customers.slice(0, 10));
    }
  }, [customers]);

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
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCustomerSearch = (searchTerm) => {
    setCustomerSearchTerm(searchTerm);
    if (searchTerm.length === 0) {
      setFilteredCustomers(customers.slice(0, 10));
      setShowCustomerDropdown(customers.length > 0);
    } else if (searchTerm.length >= 1) {
      const filtered = customers.filter(c =>
        c[CustomerFields.NAME].toLowerCase().includes(searchTerm.toLowerCase()) ||
        c[CustomerFields.ID_NUMBER].includes(searchTerm)
      );
      setFilteredCustomers(filtered.slice(0, 10));
      setShowCustomerDropdown(filtered.length > 0);
    } else {
      setFilteredCustomers([]);
      setShowCustomerDropdown(false);
    }
  };

  const handleSelectCustomer = (customer) => {
    onCustomerFilterChange(customer[CustomerFields.ID]);
    setSelectedCustomerName(customer[CustomerFields.NAME]);
    setCustomerSearchTerm(`${customer[CustomerFields.NAME]} (${customer[CustomerFields.ID_NUMBER]})`);
    setShowCustomerDropdown(false);
  };

  const handleClearCustomer = () => {
    onCustomerFilterChange('');
    setSelectedCustomerName('');
    setCustomerSearchTerm('');
    setShowCustomerDropdown(false);
  };

  const handleClearAll = () => {
    setCustomerSearchTerm('');
    setSelectedCustomerName('');
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
          <div className="absolute top-full left-0 mt-2 w-96 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
            <div className="p-4 space-y-4">
              {/* Date Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">📅 Khoảng thời gian</label>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => onDateFromChange(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="date"
                    value={dateTo}
                    onChange={(e) => onDateToChange(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">📝 Trạng thái</label>
                <DropdownMultiSelect
                  values={statusFilter}
                  onChange={onStatusFilterChange}
                  options={OrderStatusOptions}
                  placeholder="Chọn một hoặc nhiều trạng thái"
                  searchPlaceholder="Tìm trạng thái..."
                  emptyText="Không tìm thấy trạng thái"
                />
              </div>

              {/* Customer Filter */}
              <div className="relative customer-search-container">
                <label className="block text-sm font-medium text-gray-700 mb-2">👤 Khách hàng</label>
                <div className="relative">
                  <input
                    type="text"
                    value={customerSearchTerm}
                    onChange={(e) => handleCustomerSearch(e.target.value)}
                    onFocus={() => {
                      if (!showCustomerDropdown && customers.length > 0) {
                        setFilteredCustomers(customers.slice(0, 10));
                        setShowCustomerDropdown(true);
                      }
                    }}
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

                {showCustomerDropdown && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto z-10">
                    {filteredCustomers.length > 0 ? (
                      <>
                        {filteredCustomers.map((customer) => (
                          <div
                            key={customer[CustomerFields.ID]}
                            onClick={() => handleSelectCustomer(customer)}
                            className="px-3 py-2 cursor-pointer hover:bg-blue-50 border-b border-gray-100 last:border-b-0"
                          >
                            <div className="font-medium text-gray-900">{customer[CustomerFields.NAME]}</div>
                            <div className="text-sm text-gray-600">CCCD: {customer[CustomerFields.ID_NUMBER]}</div>
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
          {customerFilter && selectedCustomerName && (
            <span className="bg-blue-100 text-blue-800 text-xs px-3 py-1 rounded-full">
              KH: {selectedCustomerName}
            </span>
          )}
          {statusFilter.map((status) => (
            <span key={status} className="bg-blue-100 text-blue-800 text-xs px-3 py-1 rounded-full">
              TT: {getStatusDisplay(status)}
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

export default OrderListFilters;
