import React from 'react';
import CustomerSearchInput from '../../../components/CustomerSearchInput';
import SearchableSelect from '../../../components/SearchableSelect';
import {
  CustomerType,
  CustomerTypeLabels,
  CustomerDiscoverySourceOptions,
  OrderStatus,
  OrderStatusLabels,
  mapCustomerRowToForm,
  createDefaultCustomerForm,
} from '../../../models';

function CustomerInfoForm({
  orderForm,
  onChange,
  customerSearch,
  onCustomerSearchChange,
  onNotification,
  disabled = false,
}) {
  const handleCustomerFieldChange = (field, value) => {
    onChange({
      ...orderForm,
      customer: { ...orderForm.customer, [field]: value },
    });

    if (field === 'idNumber' && onCustomerSearchChange) {
      onCustomerSearchChange(value);
    }
  };

  const handleSelectCustomer = (customer) => {
    onChange({
      ...orderForm,
      customer: mapCustomerRowToForm(customer),
    });
    if (onNotification) onNotification('Đã chọn khách hàng thành công!', 'success', 3000);
  };

  const handleClearCustomer = () => {
    onChange({
      ...orderForm,
      customer: createDefaultCustomerForm(),
    });
    if (onCustomerSearchChange) onCustomerSearchChange('');
  };

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Thông tin khách hàng</h2>

      {/* Customer Type & Status Row */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Loại khách hàng *
          </label>
          <select
            value={orderForm.customerType}
            onChange={(e) => onChange({ ...orderForm, customerType: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={disabled}
            required
          >
            <option value={CustomerType.ONLINE}>{CustomerTypeLabels[CustomerType.ONLINE]}</option>
            <option value={CustomerType.OFFLINE}>{CustomerTypeLabels[CustomerType.OFFLINE]}</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Trạng thái đơn hàng *
          </label>
          <select
            value={orderForm.status}
            onChange={(e) => onChange({ ...orderForm, status: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={disabled}
            required
          >
            <option value={OrderStatus.CUSTOMER_HOLDS}>{OrderStatusLabels[OrderStatus.CUSTOMER_HOLDS]}</option>
            <option value={OrderStatus.STORE_HOLDS}>{OrderStatusLabels[OrderStatus.STORE_HOLDS]}</option>
            <option value={OrderStatus.RECEIVED}>{OrderStatusLabels[OrderStatus.RECEIVED]}</option>
          </select>
        </div>
        <SearchableSelect
          label="Lý do khách biết đến cửa hàng"
          value={orderForm.customerDiscoverySource}
          onChange={(value) => onChange({ ...orderForm, customerDiscoverySource: value })}
          options={CustomerDiscoverySourceOptions}
          placeholder="Chọn nguồn khách biết đến cửa hàng"
          searchPlaceholder="Tìm nguồn khách..."
          emptyText="Không tìm thấy nguồn phù hợp"
          disabled={disabled}
          optional
          className="md:col-span-2"
        />
      </div>

      {/* Customer Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <CustomerSearchInput
          value={customerSearch}
          onSelect={handleSelectCustomer}
          onClear={handleClearCustomer}
          onChange={(val) => {
            handleCustomerFieldChange('idNumber', val);
          }}
          disabled={disabled}
        />
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Ngày cấp</label>
          <input
            type="date"
            value={orderForm.customer.idIssuedDate}
            onChange={(e) => handleCustomerFieldChange('idIssuedDate', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={disabled}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Họ tên *</label>
          <input
            type="text"
            value={orderForm.customer.name}
            onChange={(e) => handleCustomerFieldChange('name', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Nhập họ tên khách hàng"
            disabled={disabled}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
          <input
            type="email"
            value={orderForm.customer.email}
            onChange={(e) => handleCustomerFieldChange('email', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Nhập email khách hàng"
            disabled={disabled}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Số điện thoại *</label>
          <input
            type="tel"
            value={orderForm.customer.phone}
            onChange={(e) => handleCustomerFieldChange('phone', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Nhập số điện thoại"
            disabled={disabled}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Địa chỉ *</label>
          <input
            type="text"
            value={orderForm.customer.address}
            onChange={(e) => handleCustomerFieldChange('address', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Nhập địa chỉ khách hàng"
            disabled={disabled}
            required
          />
        </div>
      </div>
    </div>
  );
}

export default CustomerInfoForm;
