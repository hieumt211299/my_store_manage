import React from 'react';
import {
  OrderType,
  OrderTypeLabels,
} from '../../../models';

function OrderTypeSelector({ selectedType, onChange }) {
  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Chọn loại đơn hàng</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Order Option */}
        <div
          className={`border-2 rounded-lg p-6 cursor-pointer transition-all ${
            selectedType === OrderType.ORDER
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-300 hover:border-gray-400'
          }`}
          onClick={() => onChange(OrderType.ORDER)}
        >
          <div className="flex items-center">
            <input
              type="radio"
              name="orderType"
              value={OrderType.ORDER}
              checked={selectedType === OrderType.ORDER}
              onChange={() => onChange(OrderType.ORDER)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
            />
            <label className="ml-3 text-sm font-medium text-gray-900">
              {OrderTypeLabels[OrderType.ORDER]}
            </label>
          </div>
          <div className="mt-2 text-sm text-gray-600">
            Tạo đơn đặt hàng mới với ngày giao hàng dự kiến và trạng thái giao hàng
          </div>
          <div className="mt-3 text-xs text-gray-500">
            ✓ Ngày giao hàng dự kiến<br />
            ✓ Trạng thái giao hàng<br />
            ✓ Điều khoản và cam kết
          </div>
        </div>

        {/* Warranty Option */}
        <div
          className={`border-2 rounded-lg p-6 cursor-pointer transition-all ${
            selectedType === OrderType.WARRANTY
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-300 hover:border-gray-400'
          }`}
          onClick={() => onChange(OrderType.WARRANTY)}
        >
          <div className="flex items-center">
            <input
              type="radio"
              name="orderType"
              value={OrderType.WARRANTY}
              checked={selectedType === OrderType.WARRANTY}
              onChange={() => onChange(OrderType.WARRANTY)}
              className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300"
            />
            <label className="ml-3 text-sm font-medium text-gray-900">
              {OrderTypeLabels[OrderType.WARRANTY]}
            </label>
          </div>
          <div className="mt-2 text-sm text-gray-600">
            Tạo phiếu đảm bảo sản phẩm - tự động đã giao hàng, không có ngày dự kiến
          </div>
          <div className="mt-3 text-xs text-gray-500">
            ✓ Tự động đã nhận hàng<br />
            ✓ Không cần ngày giao<br />
            ✓ Phiếu đảm bảo đơn giản
          </div>
        </div>
      </div>
    </div>
  );
}

export default OrderTypeSelector;