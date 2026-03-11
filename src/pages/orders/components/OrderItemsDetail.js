import React from 'react';
import {
  OrderFields,
  formatCurrency,
  getPaymentMethodLabel,
} from '../../../models';

function OrderItemsDetail({ order }) {
  if (!order.order_items || order.order_items.length === 0) return null;

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Danh sách sản phẩm</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">STT</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tên sản phẩm</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SKU</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SL</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Đơn giá</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thành tiền</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {order.order_items.map((item, index) => (
              <tr key={index}>
                <td className="px-6 py-4 whitespace-nowrap text-center">{index + 1}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    {item.products?.image_url && (
                      <img
                        src={item.products.image_url}
                        alt={item.products?.name}
                        className="w-12 h-12 object-cover rounded-lg mr-3"
                      />
                    )}
                    <div className="text-sm font-medium">
                      {item.products?.name || 'Sản phẩm không xác định'}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900">{item.products?.sku || 'N/A'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900">{item.quantity}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">{formatCurrency(item.selling_price)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-semibold text-gray-900">{formatCurrency(item.quantity * item.selling_price)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Order Summary */}
      <div className="mt-6 flex justify-end">
        <div className="w-full max-w-md">
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex justify-between mb-2">
              <span className="text-sm text-gray-600">Số loại sản phẩm:</span>
              <span className="text-sm font-medium">{order.order_items.length}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-sm text-gray-600">Tổng số lượng:</span>
              <span className="text-sm font-medium">{order.order_items.reduce((sum, item) => sum + item.quantity, 0)}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-sm text-gray-600">Phương thức thanh toán:</span>
              <span className="text-sm font-medium">{getPaymentMethodLabel(order[OrderFields.PAYMENT_METHOD])}</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-gray-200">
              <span className="text-lg font-semibold text-gray-900">TỔNG CỘNG:</span>
              <span className="text-lg font-bold text-gray-900">{formatCurrency(order[OrderFields.TOTAL_AMOUNT])}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OrderItemsDetail;
