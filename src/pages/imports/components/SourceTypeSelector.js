import React from 'react';
import {
  ImportOrderSourceType,
  ImportOrderSourceTypeLabels,
} from '../../../models';

function SourceTypeSelector({ selectedType, onChange }) {
  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Chọn nguồn nhập hàng</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Ancarat Option */}
        <div
          className={`border-2 rounded-lg p-6 cursor-pointer transition-all ${
            selectedType === ImportOrderSourceType.ANCARAT
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-300 hover:border-gray-400'
          }`}
          onClick={() => onChange(ImportOrderSourceType.ANCARAT)}
        >
          <div className="flex items-center">
            <input
              type="radio"
              name="sourceType"
              value={ImportOrderSourceType.ANCARAT}
              checked={selectedType === ImportOrderSourceType.ANCARAT}
              onChange={() => onChange(ImportOrderSourceType.ANCARAT)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
            />
            <label className="ml-3 text-sm font-medium text-gray-900">
              {ImportOrderSourceTypeLabels[ImportOrderSourceType.ANCARAT]}
            </label>
          </div>
          <div className="mt-2 text-sm text-gray-600">
            Nhập hàng từ công ty Ancarat với thông tin hóa đơn và ngày dự kiến trả hàng
          </div>
          <div className="mt-3 text-xs text-gray-500">
            ✓ Số hóa đơn Ancarat<br />
            ✓ Tên thu ngân<br />
            ✓ Ngày dự kiến trả hàng (95 ngày)
          </div>
        </div>

        {/* Customer Option */}
        <div
          className={`border-2 rounded-lg p-6 cursor-pointer transition-all ${
            selectedType === ImportOrderSourceType.CUSTOMER
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-300 hover:border-gray-400'
          }`}
          onClick={() => onChange(ImportOrderSourceType.CUSTOMER)}
        >
          <div className="flex items-center">
            <input
              type="radio"
              name="sourceType"
              value={ImportOrderSourceType.CUSTOMER}
              checked={selectedType === ImportOrderSourceType.CUSTOMER}
              onChange={() => onChange(ImportOrderSourceType.CUSTOMER)}
              className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300"
            />
            <label className="ml-3 text-sm font-medium text-gray-900">
              {ImportOrderSourceTypeLabels[ImportOrderSourceType.CUSTOMER]}
            </label>
          </div>
          <div className="mt-2 text-sm text-gray-600">
            Nhập hàng từ khách hàng cá nhân với thông tin chi tiết người bán
          </div>
          <div className="mt-3 text-xs text-gray-500">
            ✓ Thông tin khách hàng<br />
            ✓ CCCD/CMND<br />
            ✓ Địa chỉ và liên hệ
          </div>
        </div>
      </div>
    </div>
  );
}

export default SourceTypeSelector;