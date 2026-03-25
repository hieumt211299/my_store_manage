import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

function SearchInputDropdown({
  tableName,
  selectedId,
  selectedDisplayName,
  onSelectionChange,
  placeholder = "Tìm kiếm...",
  label = "Tìm kiếm",
  emoji = "🔍",
  disabled = false,
  className = "relative search-container",
  // Field mappings
  fields = {
    id: 'id',
    name: 'name', 
    searchFields: ['name'], // fields to search in
    displayFields: [] // additional fields to display in dropdown
  },
  // Custom formatters
  formatDisplayText = (item) => item[fields.name],
  formatDropdownItem = (item) => ({
    primary: item[fields.name],
    secondary: null
  }),
  // Custom search
  customSearchFilter = null,
  // Limits
  initialLimit = 10,
  searchMinLength = 1
}) {
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch all items from database
  const fetchItems = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // Build select fields
      const selectFields = [
        fields.id,
        fields.name,
        ...fields.displayFields
      ].join(', ');
      
      const { data, error } = await supabase
        .from(tableName)
        .select(selectFields)
        .order(fields.name);
        
      if (error) throw error;
      setItems(data || []);
    } catch (error) {
      console.error(`Error fetching ${tableName}:`, error);
      setItems([]);
    } finally {
      setIsLoading(false);
    }
  }, [tableName, fields]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  useEffect(() => {
    if (items.length > 0) {
      setFilteredItems(items.slice(0, initialLimit));
    }
  }, [items, initialLimit]);

  // Update display text when selection changes
  useEffect(() => {
    if (selectedId && items.length > 0) {
      const selected = items.find(item => item[fields.id].toString() === selectedId.toString());
      if (selected) {
        setSearchTerm(formatDisplayText(selected));
      }
    } else if (!selectedId) {
      setSearchTerm('');
    }
  }, [selectedId, items, fields.id, formatDisplayText]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest(`.${className.split(' ')[1]}`)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [className]);

  const handleSearch = (searchValue) => {
    setSearchTerm(searchValue);
    
    if (searchValue.length === 0) {
      setFilteredItems(items.slice(0, initialLimit));
      setShowDropdown(items.length > 0);
    } else if (searchValue.length >= searchMinLength) {
      let filtered;
      
      if (customSearchFilter) {
        filtered = customSearchFilter(items, searchValue);
      } else {
        // Default search implementation
        filtered = items.filter(item => {
          return fields.searchFields.some(field => {
            const fieldValue = item[field];
            return fieldValue && fieldValue.toLowerCase().includes(searchValue.toLowerCase());
          });
        });
      }
      
      setFilteredItems(filtered.slice(0, initialLimit));
      setShowDropdown(filtered.length > 0);
    } else {
      setFilteredItems([]);
      setShowDropdown(false);
    }
  };

  const handleSelectItem = (item) => {
    const itemId = item[fields.id];
    const displayText = formatDisplayText(item);
    
    onSelectionChange(itemId, item);
    setSearchTerm(displayText);
    setShowDropdown(false);
  };

  const handleClear = () => {
    onSelectionChange('', null);
    setSearchTerm('');
    setShowDropdown(false);
  };

  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {emoji} {label}
      </label>
      <div className="relative">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => handleSearch(e.target.value)}
          onFocus={() => {
            if (!showDropdown && items.length > 0) {
              setFilteredItems(items.slice(0, initialLimit));
              setShowDropdown(true);
            }
          }}
          placeholder={placeholder}
          disabled={disabled}
          className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
        />
        {selectedDisplayName && (
          <button
            onClick={handleClear}
            className="absolute right-2 top-2 text-gray-400 hover:text-gray-600"
            disabled={disabled}
          >
            ✕
          </button>
        )}
      </div>

      {showDropdown && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto z-10">
          {isLoading ? (
            <div className="px-3 py-2 text-gray-500 text-sm text-center">
              Đang tải...
            </div>
          ) : filteredItems.length > 0 ? (
            <>
              {filteredItems.map((item) => {
                const dropdownItem = formatDropdownItem(item);
                return (
                  <div
                    key={item[fields.id]}
                    onClick={() => handleSelectItem(item)}
                    className="px-3 py-2 cursor-pointer hover:bg-blue-50 border-b border-gray-100 last:border-b-0"
                  >
                    <div className="font-medium text-gray-900">{dropdownItem.primary}</div>
                    {dropdownItem.secondary && (
                      <div className="text-sm text-gray-600">{dropdownItem.secondary}</div>
                    )}
                  </div>
                );
              })}
              {items.length > initialLimit && filteredItems.length === initialLimit && !searchTerm && (
                <div className="px-3 py-2 text-xs text-gray-500 text-center border-t border-gray-100">
                  Nhập để tìm kiếm thêm...
                </div>
              )}
            </>
          ) : (
            <div className="px-3 py-2 text-gray-500 text-sm">
              {searchTerm ? `Không tìm thấy ${label.toLowerCase()} nào` : `Chưa có ${label.toLowerCase()} nào`}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default SearchInputDropdown;