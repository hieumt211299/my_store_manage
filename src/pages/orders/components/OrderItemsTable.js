import React from 'react';
import { formatCurrency } from '../../../models';

function OrderItemsTable({ items, onUpdateItem, onRemoveItem }) {
  if (items.length === 0) {
    return (
      <div className="text-center py-8 border border-gray-300 border-dashed rounded-lg">
        <p className="text-gray-500">Chưa có sản phẩm nào được chọn</p>
        <p className="text-sm text-gray-400 mt-1">Nhấn "Chọn sản phẩm" để thêm sản phẩm vào đơn hàng</p>
      </div>
    );
  }

  const total = items.reduce((sum, item) => sum + item.subtotal, 0);

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden">
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Sản phẩm</th>
            <th className="px-4 py-2 text-center text-sm font-medium text-gray-700">Số lượng</th>
            <th className="px-4 py-2 text-center text-sm font-medium text-gray-700">Giá bán</th>
            <th className="px-4 py-2 text-right text-sm font-medium text-gray-700">Thành tiền</th>
            <th className="px-4 py-2 text-center text-sm font-medium text-gray-700">Xóa</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => (
            <tr key={index} className="border-t">
              <td className="px-4 py-2">
                <div>
                  <div className="font-medium">{item.productName}</div>
                  <div className="text-sm text-gray-500">SKU: {item.productSku}</div>
                </div>
              </td>
              <td className="px-4 py-2 text-center">
                <input
                  type="number"
                  min="1"
                  value={item.quantity}
                  onChange={(e) => onUpdateItem(index, 'quantity', parseInt(e.target.value) || 1)}
                  className="w-20 px-2 py-1 text-center border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </td>
              <td className="px-4 py-2 text-center">
                <input
                  type="number"
                  min="0"
                  value={item.sellingPrice}
                  onChange={(e) => onUpdateItem(index, 'sellingPrice', parseFloat(e.target.value) || 0)}
                  className="w-32 px-2 py-1 text-center border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Nhập giá"
                />
              </td>
              <td className="px-4 py-2 text-right font-medium">{formatCurrency(item.subtotal)}</td>
              <td className="px-4 py-2 text-center">
                <button
                  type="button"
                  onClick={() => onRemoveItem(index)}
                  className="text-red-600 hover:text-red-800"
                >
                  Xóa
                </button>
              </td>
            </tr>
          ))}
          <tr className="border-t bg-gray-50">
            <td colSpan="3" className="px-4 py-2 text-right font-medium">Tổng cộng:</td>
            <td className="px-4 py-2 text-right font-bold text-lg">{formatCurrency(total)}</td>
            <td></td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

export default OrderItemsTable;
