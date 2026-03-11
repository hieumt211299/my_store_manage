import React from 'react';
import { formatCurrency } from '../../../models';

function ImportItemsTable({ items, onUpdateItem, onRemoveItem }) {
  if (items.length === 0) {
    return (
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
        <div className="text-gray-500">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2 2v-5m16 0h-6l-2 2-2-2H4" />
          </svg>
          <div className="mt-2 text-sm text-gray-600">
            Chưa có sản phẩm nào được thêm
          </div>
          <div className="mt-1 text-xs text-gray-500">
            Nhấn "Thêm sản phẩm" để bắt đầu
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto border border-gray-300 rounded-lg">
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Sản phẩm</th>
            <th className="px-4 py-2 text-center text-sm font-medium text-gray-700">Số lượng</th>
            <th className="px-4 py-2 text-center text-sm font-medium text-gray-700">Giá nhập</th>
            <th className="px-4 py-2 text-right text-sm font-medium text-gray-700">Thành tiền</th>
            <th className="px-4 py-2 text-center text-sm font-medium text-gray-700">Xóa</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {items.map((item, index) => (
            <tr key={`${item.productId}-${index}`} className="hover:bg-gray-50">
              <td className="px-4 py-3">
                <div className="flex items-center">
                  {item.productImageUrl && (
                    <img 
                      className="h-10 w-10 rounded-lg object-cover mr-3" 
                      src={item.productImageUrl}
                      alt={item.productName}
                    />
                  )}
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {item.productName}
                    </div>
                    <div className="text-sm text-gray-500">
                      SKU: {item.productSku} • ID: {item.productId}
                    </div>
                  </div>
                </div>
              </td>
              
              <td className="px-4 py-3 text-center">
                <input
                  type="number"
                  min="1"
                  value={item.quantity}
                  onChange={(e) => onUpdateItem(index, 'quantity', e.target.value)}
                  className="w-20 px-2 py-1 text-center border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </td>
              
              <td className="px-4 py-3 text-center">
                <div className="flex items-center justify-center">
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={item.importPrice}
                    onChange={(e) => onUpdateItem(index, 'importPrice', e.target.value)}
                    className="w-24 px-2 py-1 text-right border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0"
                  />
                  <span className="ml-1 text-sm text-gray-500">₫</span>
                </div>
              </td>
              
              <td className="px-4 py-3 text-right">
                <span className="text-sm font-medium text-gray-900">
                  {formatCurrency(item.quantity * item.importPrice)}
                </span>
              </td>
              
              <td className="px-4 py-3 text-center">
                <button
                  onClick={() => onRemoveItem(index)}
                  className="text-red-600 hover:text-red-800 transition-colors"
                  title="Xóa sản phẩm"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ImportItemsTable;