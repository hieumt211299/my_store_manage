import React, { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { Tables, ProductFields } from '../models';

function ProductSearchDropdown({ 
  selectedProducts = [], 
  onSelectedProductsChange, 
  placeholder = "Tìm kiếm sản phẩm...",
  disabled = false 
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Search products function with useCallback to avoid infinite loop
  const searchProducts = useCallback(async () => {
    if (!searchTerm.trim()) return;
    
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from(Tables.PRODUCTS)
        .select(`
          ${ProductFields.ID},
          ${ProductFields.NAME},
          ${ProductFields.SKU}
        `)
        .or(`${ProductFields.NAME}.ilike.%${searchTerm.trim()}%,${ProductFields.SKU}.ilike.%${searchTerm.trim()}%`)
        .limit(10)
        .order(ProductFields.NAME);

      if (error) throw error;
      
      setSearchResults(data || []);
      setIsDropdownOpen(true);
    } catch (error) {
      console.error('Error searching products:', error);
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  }, [searchTerm]);

  // Debounced search
  useEffect(() => {
    if (searchTerm.trim().length >= 2) {
      const timer = setTimeout(searchProducts, 300);
      return () => clearTimeout(timer);
    } else {
      setSearchResults([]);
      setIsDropdownOpen(false);
    }
  }, [searchTerm, searchProducts]);

  const handleProductSelect = (product) => {
    // Check if product already selected
    const isAlreadySelected = selectedProducts.some(p => p.id === product.id);
    
    if (isAlreadySelected) {
      // Remove from selection
      const updatedProducts = selectedProducts.filter(p => p.id !== product.id);
      onSelectedProductsChange(updatedProducts);
    } else {
      // Add to selection
      const updatedProducts = [...selectedProducts, product];
      onSelectedProductsChange(updatedProducts);
    }
    
    // Clear search after selection
    setSearchTerm('');
    setSearchResults([]);
    setIsDropdownOpen(false);
  };

  const handleRemoveProduct = (productId) => {
    const updatedProducts = selectedProducts.filter(p => p.id !== productId);
    onSelectedProductsChange(updatedProducts);
  };

  const handleInputFocus = () => {
    if (!disabled) {
      inputRef.current?.focus();
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Selected Products Tags */}
      {selectedProducts.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {selectedProducts.map((product) => (
            <span
              key={product.id}
              className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full"
            >
              <span>{product.name}</span>
              <button
                onClick={() => handleRemoveProduct(product.id)}
                className="text-blue-600 hover:text-blue-800"
                type="button"
              >
                ✕
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Search Input */}
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={handleInputFocus}
          placeholder={placeholder}
          disabled={disabled}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
        />
        
        {isLoading && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
          </div>
        )}
      </div>

      {/* Search Results Dropdown */}
      {isDropdownOpen && searchResults.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {searchResults.map((product) => {
            const isSelected = selectedProducts.some(p => p.id === product.id);
            return (
              <button
                key={product.id}
                onClick={() => handleProductSelect(product)}
                className={`w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 flex items-center justify-between ${
                  isSelected ? 'bg-blue-50' : ''
                }`}
              >
                <div>
                  <div className="font-medium text-gray-900">{product.name}</div>
                  <div className="text-sm text-gray-500">SKU: {product.sku}</div>
                </div>
                {isSelected && (
                  <span className="text-blue-600 text-sm">✓ Đã chọn</span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* No Results */}
      {isDropdownOpen && !isLoading && searchTerm.trim().length >= 2 && searchResults.length === 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-4 text-center text-gray-500">
          Không tìm thấy sản phẩm nào
        </div>
      )}
    </div>
  );
}

export default ProductSearchDropdown;