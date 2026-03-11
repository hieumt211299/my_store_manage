import React from 'react';

function ImportBasicInfoForm({ 
  importDate, 
  expectedReturnDate,
  onImportDateChange, 
  onExpectedReturnDateChange 
}) {
  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Thông tin cơ bản</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Ngày nhập *
          </label>
          <input
            type="date"
            value={importDate}
            onChange={(e) => onImportDateChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <div className="text-sm text-gray-500 mt-1">
            Ngày thực hiện nhập hàng vào kho
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Ngày nhận hàng dự kiến *
          </label>
          <input
            type="date"
            value={expectedReturnDate}
            onChange={(e) => onExpectedReturnDateChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <div className="text-sm text-gray-500 mt-1">
            Ngày dự kiến Ancarat trả hàng  (mặc định 95 ngày)
          </div>
        </div>
      </div>
    </div>
  );
}

export default ImportBasicInfoForm;