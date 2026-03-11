import React, { useState } from 'react';
import { ProductFields } from '../models';

function ProductSelectionDialog({
  products,
  existingItemIds = [],
  onAdd,
  onClose,
}) {
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredProducts = products.filter(product =>
    product[ProductFields.NAME].toLowerCase().includes(searchTerm.toLowerCase()) ||
    product[ProductFields.SKU].toLowerCase().includes(searchTerm.toLowerCase()) ||
    product[ProductFields.ID].toString().includes(searchTerm)
  );

  const handleToggleProduct = (productId) => {
    if (existingItemIds.includes(productId)) return;
    setSelectedProducts(prev =>
      prev.includes(productId.toString())
        ? prev.filter(id => id !== productId.toString())
        : [...prev, productId.toString()]
    );
  };

  const handleAdd = () => {
    onAdd(selectedProducts);
    setSelectedProducts([]);
    setSearchTerm('');
  };

  const handleClose = () => {
    setSelectedProducts([]);
    setSearchTerm('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[80vh]">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Chọn sản phẩm</h3>
          <button onClick={handleClose} className="text-gray-500 hover:text-gray-700">
            ✕
          </button>
        </div>

        {/* Search */}
        <div className="mb-4">
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Tìm kiếm theo tên, SKU hoặc ID sản phẩm..."
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
          {searchTerm && (
            <p className="text-sm text-gray-500 mt-2">
              Tìm thấy {filteredProducts.length} sản phẩm
            </p>
          )}
        </div>

        {/* Product Table */}
        <div className="border border-gray-300 rounded-lg overflow-hidden mb-4">
          <div className="max-h-96 overflow-y-auto">
            <table className="w-full">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="w-12 px-4 py-2 text-left">
                    <input
                      type="checkbox"
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedProducts(
                            filteredProducts
                              .filter(p => !existingItemIds.includes(p.id))
                              .map(p => p.id.toString())
                          );
                        } else {
                          setSelectedProducts([]);
                        }
                      }}
                      checked={
                        selectedProducts.length > 0 &&
                        selectedProducts.length === filteredProducts.filter(p => !existingItemIds.includes(p.id)).length
                      }
                    />
                  </th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Hình ảnh</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Sản phẩm</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">SKU</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-4 py-8 text-center text-gray-500">
                      {searchTerm ? 'Không tìm thấy sản phẩm nào phù hợp' : 'Chưa có sản phẩm nào'}
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((product) => {
                    const isSelected = selectedProducts.includes(product.id.toString());
                    const isAlreadyAdded = existingItemIds.includes(product.id);

                    return (
                      <tr
                        key={product.id}
                        className={`border-t cursor-pointer ${
                          isAlreadyAdded
                            ? 'bg-gray-100 opacity-50 cursor-not-allowed'
                            : isSelected
                              ? 'bg-blue-50 hover:bg-blue-100'
                              : 'hover:bg-gray-50'
                        }`}
                        onClick={() => handleToggleProduct(product.id)}
                      >
                        <td className="px-4 py-2">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            disabled={isAlreadyAdded}
                            onChange={(e) => {
                              e.stopPropagation();
                              handleToggleProduct(product.id);
                            }}
                          />
                        </td>
                        <td className="px-4 py-2">
                          <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center">
                            {product.image_url ? (
                              <img
                                src={product.image_url}
                                alt={product.name}
                                className="w-full h-full object-cover rounded"
                              />
                            ) : (
                              <span className="text-2xl">📦</span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-2 font-medium">{product.name}</td>
                        <td className="px-4 py-2 text-gray-600">{product.sku}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">
            Đã chọn: {selectedProducts.length} sản phẩm
          </span>
          <div className="space-x-2">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={handleAdd}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              disabled={selectedProducts.length === 0}
            >
              Thêm sản phẩm
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductSelectionDialog;
