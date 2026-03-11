import React from 'react';

function AncaratInfoForm({ 
  invoiceNumber, 
  cashierName, 
  onInvoiceNumberChange, 
  onCashierNameChange 
}) {
  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Thông tin Ancarat</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Số hóa đơn Ancarat *
          </label>
          <input
            type="text"
            value={invoiceNumber}
            onChange={(e) => onInvoiceNumberChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Nhập số hóa đơn"
            required
          />
          <div className="text-sm text-gray-500 mt-1">
            Số hóa đơn từ công ty Ancarat
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tên thu ngân *
          </label>
          <input
            type="text"
            value={cashierName}
            onChange={(e) => onCashierNameChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Nhập tên thu ngân"
            required
          />
          <div className="text-sm text-gray-500 mt-1">
            Tên nhân viên thu ngân của Ancarat
          </div>
        </div>
      </div>
    </div>
  );
}

export default AncaratInfoForm;