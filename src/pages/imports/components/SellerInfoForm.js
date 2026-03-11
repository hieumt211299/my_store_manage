import React from 'react';

function SellerInfoForm({ seller, onSellerChange }) {
  const handleChange = (field, value) => {
    onSellerChange(field, value);
  };

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Thông tin khách bán</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Họ và tên *
          </label>
          <input
            type="text"
            value={seller.name}
            onChange={(e) => handleChange('name', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Nhập họ và tên"
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
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Số CCCD/CMND *
          </label>
          <input
            type="text"
            value={seller.idNumber}
            onChange={(e) => handleChange('idNumber', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Nhập số CCCD/CMND"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Ngày cấp CCCD
          </label>
          <input
            type="date"
            value={seller.idIssuedDate}
            onChange={(e) => handleChange('idIssuedDate', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Địa chỉ
          </label>
          <textarea
            value={seller.address}
            onChange={(e) => handleChange('address', e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Nhập địa chỉ chi tiết"
          />
        </div>
      </div>
    </div>
  );
}

export default SellerInfoForm;