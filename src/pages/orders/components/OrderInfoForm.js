import React from 'react';
import {
  PaymentMethod,
  PaymentMethodLabels,
  OrderType,
} from '../../../models';
import OrderTypeSelector from './OrderTypeSelector';

function OrderInfoForm({ orderForm, onChange, disabled = false }) {
  const handleChange = (field, value) => {
    onChange({ ...orderForm, [field]: value });
  };

  const handleOrderTypeChange = (orderType) => {
    onChange({ ...orderForm, orderType });
  };

  return (
    <div className="space-y-6">
      {/* Order Type Selection */}
      <OrderTypeSelector
        selectedType={orderForm.orderType}
        onChange={handleOrderTypeChange}
      />

      {/* Order Info */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Thông tin đơn hàng</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ngày tạo *
            </label>
            <input
              type="date"
              value={orderForm.createDate}
              onChange={(e) => handleChange('createDate', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          
          {/* Only show Expected Delivery Date for orders, not warranty */}
          {orderForm.orderType === OrderType.ORDER && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ngày giao hàng dự kiến *
              </label>
              <input
                type="date"
                value={orderForm.expectedDeliveryDate}
                onChange={(e) => handleChange('expectedDeliveryDate', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={disabled}
                required
              />
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phương thức thanh toán *
            </label>
            <select
              value={orderForm.paymentMethod}
              onChange={(e) => handleChange('paymentMethod', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={disabled}
            >
              <option value={PaymentMethod.BANK}>{PaymentMethodLabels[PaymentMethod.BANK]}</option>
              <option value={PaymentMethod.CASH}>{PaymentMethodLabels[PaymentMethod.CASH]}</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OrderInfoForm;
