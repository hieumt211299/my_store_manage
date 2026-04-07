import React from 'react';
import CustomerSearchInput from '../../../components/CustomerSearchInput';

function SellerInfoForm({
  seller,
  customerSearch,
  onSellerChange,
  onCustomerSearchChange,
  onSelectCustomer,
  onClearCustomer,
  disabled = false,
}) {
  const handleChange = (field, value) => {
    onSellerChange(field, value);
  };

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Thông tin khách bán</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <CustomerSearchInput
          value={customerSearch}
          onSelect={onSelectCustomer}
          onClear={onClearCustomer}
          onChange={(value) => {
            handleChange('idNumber', value);
            if (onCustomerSearchChange) onCustomerSearchChange(value);
          }}
          disabled={disabled}
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Ngày cấp</label>
          <input
            type="date"
            value={seller.idIssuedDate}
            onChange={(e) => handleChange('idIssuedDate', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={disabled}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Họ tên *</label>
          <input
            type="text"
            value={seller.name}
            onChange={(e) => handleChange('name', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Nhập họ tên khách bán"
            disabled={disabled}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Số điện thoại *
          </label>
          <input
            type="tel"
            value={seller.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Nhập số điện thoại"
            disabled={disabled}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
          <input
            type="email"
            value={seller.email}
            onChange={(e) => handleChange('email', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Nhập email khách bán"
            disabled={disabled}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Địa chỉ *</label>
          <input
            type="text"
            value={seller.address}
            onChange={(e) => handleChange('address', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Nhập địa chỉ khách bán"
            disabled={disabled}
            required
          />
        </div>
      </div>
    </div>
  );
}

export default SellerInfoForm;
