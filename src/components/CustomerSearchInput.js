import React, { useState, useRef, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { Tables, CustomerFields } from '../models';

function CustomerSearchInput({
  value,
  onSelect,
  onClear,
  onChange,
  disabled = false,
  minSearchLength = 3,
}) {
  const [searchTerm, setSearchTerm] = useState(value || '');
  const [results, setResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);
  const debounceTimer = useRef(null);

  useEffect(() => {
    setSearchTerm(value || '');
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current && !dropdownRef.current.contains(event.target) &&
        inputRef.current && !inputRef.current.contains(event.target)
      ) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, []);

  const searchCustomers = useCallback(async (term) => {
    if (!term || term.length < minSearchLength) {
      setResults([]);
      setShowDropdown(false);
      return;
    }
    try {
      setIsSearching(true);
      const { data, error } = await supabase
        .from(Tables.CUSTOMERS)
        .select('*')
        .or(`${CustomerFields.ID_NUMBER}.ilike.%${term}%,${CustomerFields.NAME}.ilike.%${term}%,${CustomerFields.PHONE}.ilike.%${term}%`)
        .order(CustomerFields.CREATED_AT, { ascending: false })
        .limit(10);

      if (error) throw error;
      setResults(data || []);
      setShowDropdown(data && data.length > 0);
    } catch (error) {
      console.error('Error searching customers:', error);
      setResults([]);
      setShowDropdown(false);
    } finally {
      setIsSearching(false);
    }
  }, [minSearchLength]);

  const handleChange = (e) => {
    const val = e.target.value;
    setSearchTerm(val);
    if (onChange) onChange(val);

    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      searchCustomers(val);
    }, 300);
  };

  const handleSelect = (customer) => {
    setSearchTerm(customer[CustomerFields.ID_NUMBER]);
    setShowDropdown(false);
    if (onSelect) onSelect(customer);
  };

  const handleClear = () => {
    setSearchTerm('');
    setResults([]);
    setShowDropdown(false);
    if (onClear) onClear();
  };

  return (
    <div className="relative">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Số CMND/CCCD *
      </label>
      <div ref={inputRef}>
        <input
          type="text"
          value={searchTerm}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Nhập số CMND/CCCD để tìm kiếm..."
          disabled={disabled}
          required
        />
        {isSearching && (
          <div className="absolute right-3 top-9 text-gray-400">
            <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
          </div>
        )}
        {searchTerm && !isSearching && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-9 text-gray-400 hover:text-gray-600"
            title="Xóa chọn khách hàng"
          >
            ✕
          </button>
        )}
      </div>

      {showDropdown && results.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto"
        >
          {results.map((customer) => (
            <div
              key={customer[CustomerFields.ID]}
              onClick={() => handleSelect(customer)}
              className="px-4 py-3 cursor-pointer hover:bg-blue-50 border-b border-gray-100 last:border-b-0"
            >
              <div className="font-medium text-gray-900">{customer[CustomerFields.NAME]}</div>
              <div className="text-sm text-gray-600">
                CCCD: {customer[CustomerFields.ID_NUMBER]} • SĐT: {customer[CustomerFields.PHONE]}
              </div>
              <div className="text-xs text-gray-500 truncate">
                {customer[CustomerFields.ADDRESS]}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-1 text-sm text-gray-500">
        💡 Nhập số CCCD để tìm kiếm khách hàng có sẵn hoặc điền thông tin mới
      </div>
    </div>
  );
}

export default CustomerSearchInput;
