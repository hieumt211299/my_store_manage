import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { Tables, ProductFields } from '../models';

function ProductSearchInput({
  selectedProductId,
  onProductFilterChange,
  placeholder = "Tìm kiếm sản phẩm...",
  disabled = false,
  className = "relative product-search-container"
}) {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [productSearchTerm, setProductSearchTerm] = useState('');
  const [showProductDropdown, setShowProductDropdown] = useState(false);
  const [selectedProductName, setSelectedProductName] = useState('');

  const fetchProducts = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from(Tables.PRODUCTS)
        .select(`${ProductFields.ID}, ${ProductFields.NAME}, ${ProductFields.SKU}`)
        .order(ProductFields.NAME);
      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    if (products.length > 0) {
      setFilteredProducts(products.slice(0, 10));
    }
  }, [products]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.product-search-container')) {
        setShowProductDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Update selected product name when selectedProductId changes
  useEffect(() => {
    if (selectedProductId && products.length > 0) {
      const selected = products.find(p => p[ProductFields.ID] === selectedProductId);
      if (selected) {
        setSelectedProductName(selected[ProductFields.NAME]);
        setProductSearchTerm(`${selected[ProductFields.NAME]} (${selected[ProductFields.SKU]})`);
      }
    } else if (!selectedProductId) {
      setSelectedProductName('');
      setProductSearchTerm('');
    }
  }, [selectedProductId, products]);

  const handleProductSearch = (searchTerm) => {
    setProductSearchTerm(searchTerm);
    if (searchTerm.length === 0) {
      setFilteredProducts(products.slice(0, 10));
      setShowProductDropdown(products.length > 0);
    } else if (searchTerm.length >= 1) {
      const filtered = products.filter(p =>
        p[ProductFields.NAME].toLowerCase().includes(searchTerm.toLowerCase()) ||
        p[ProductFields.SKU].toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredProducts(filtered.slice(0, 10));
      setShowProductDropdown(filtered.length > 0);
    } else {
      setFilteredProducts([]);
      setShowProductDropdown(false);
    }
  };

  const handleSelectProduct = (product) => {
    onProductFilterChange(product[ProductFields.ID]);
    setSelectedProductName(product[ProductFields.NAME]);
    setProductSearchTerm(`${product[ProductFields.NAME]} (${product[ProductFields.SKU]})`);
    setShowProductDropdown(false);
  };

  const handleClearProduct = () => {
    onProductFilterChange('');
    setSelectedProductName('');
    setProductSearchTerm('');
    setShowProductDropdown(false);
  };

  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-700 mb-2">🛍️ Sản phẩm</label>
      <div className="relative">
        <input
          type="text"
          value={productSearchTerm}
          onChange={(e) => handleProductSearch(e.target.value)}
          onFocus={() => {
            if (!showProductDropdown && products.length > 0) {
              setFilteredProducts(products.slice(0, 10));
              setShowProductDropdown(true);
            }
          }}
          placeholder={placeholder}
          disabled={disabled}
          className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {selectedProductName && (
          <button
            onClick={handleClearProduct}
            className="absolute right-2 top-2 text-gray-400 hover:text-gray-600"
            disabled={disabled}
          >
            ✕
          </button>
        )}
      </div>

      {showProductDropdown && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto z-10">
          {filteredProducts.length > 0 ? (
            <>
              {filteredProducts.map((product) => (
                <div
                  key={product[ProductFields.ID]}
                  onClick={() => handleSelectProduct(product)}
                  className="px-3 py-2 cursor-pointer hover:bg-blue-50 border-b border-gray-100 last:border-b-0"
                >
                  <div className="font-medium text-gray-900">{product[ProductFields.NAME]}</div>
                  <div className="text-sm text-gray-600">SKU: {product[ProductFields.SKU]}</div>
                </div>
              ))}
              {products.length > 10 && filteredProducts.length === 10 && !productSearchTerm && (
                <div className="px-3 py-2 text-xs text-gray-500 text-center border-t border-gray-100">
                  Nhập để tìm kiếm thêm sản phẩm...
                </div>
              )}
            </>
          ) : (
            <div className="px-3 py-2 text-gray-500 text-sm">
              {productSearchTerm ? 'Không tìm thấy sản phẩm nào' : 'Chưa có sản phẩm nào'}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default ProductSearchInput;