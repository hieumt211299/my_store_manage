import React from 'react';
import {
  OrderFields,
  OrderStatus,
  getStatusDisplay,
  getStatusBadgeColor,
  getPaymentMethodLabel,
  getPaymentMethodBadgeColor,
  getCustomerTypeLabel,
  getCustomerTypeBadgeColor,
} from '../../../models';

function OrderStatusSection({ order, statusLoading, onUpdateStatus }) {
  return (
    <div className="mt-6 pt-6 border-t border-gray-200">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Trạng thái đơn hàng</h3>

      {/* Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="text-sm font-medium text-gray-700 mb-1">Trạng thái hiện tại</div>
          <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeColor(order[OrderFields.STATUS] || OrderStatus.STORE_HOLDS)}`}>
            {getStatusDisplay(order[OrderFields.STATUS] || OrderStatus.STORE_HOLDS)}
          </span>
          {order[OrderFields.STATUS] === OrderStatus.RECEIVED && (
            <div className="text-xs text-green-600 mt-1">(Không thể thay đổi)</div>
          )}
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="text-sm font-medium text-gray-700 mb-1">Phương thức thanh toán</div>
          <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getPaymentMethodBadgeColor(order[OrderFields.PAYMENT_METHOD])}`}>
            {getPaymentMethodLabel(order[OrderFields.PAYMENT_METHOD])}
          </span>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="text-sm font-medium text-gray-700 mb-1">Loại khách hàng</div>
          <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getCustomerTypeBadgeColor(order[OrderFields.CUSTOMER_TYPE])}`}>
            {getCustomerTypeLabel(order[OrderFields.CUSTOMER_TYPE])}
          </span>
        </div>
      </div>

      {/* Status Update Dropdown */}
      {order[OrderFields.STATUS] !== OrderStatus.RECEIVED && (
        <div className="flex items-center space-x-4">
          <label htmlFor="status-select" className="text-sm font-medium text-gray-700">
            Cập nhật trạng thái:
          </label>
          <select
            id="status-select"
            value={order[OrderFields.STATUS] || OrderStatus.STORE_HOLDS}
            onChange={(e) => onUpdateStatus(e.target.value)}
            disabled={statusLoading}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
          >
            <option value={OrderStatus.STORE_HOLDS}>{getStatusDisplay(OrderStatus.STORE_HOLDS)}</option>
            <option value={OrderStatus.CUSTOMER_HOLDS}>{getStatusDisplay(OrderStatus.CUSTOMER_HOLDS)}</option>
            <option value={OrderStatus.RECEIVED}>{getStatusDisplay(OrderStatus.RECEIVED)}</option>
          </select>
          {statusLoading && (
            <div className="text-sm text-gray-600">Đang cập nhật...</div>
          )}
        </div>
      )}
    </div>
  );
}

export default OrderStatusSection;
