import React from 'react';
import {
  ImportItemFields,
  ProductFields,
  formatCurrency,
} from '../../../models';

function ImportItemsDetail({ items }) {
  if (!items || items.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Danh sách sản phẩm</h2>
        <div className="text-center text-gray-500 py-8">
          Chưa có sản phẩm nào được thêm vào đơn nhập này
        </div>
      </div>
    );
  }

  const totalQuantity = items.reduce((sum, item) => sum + item[ImportItemFields.QUANTITY], 0);
  const totalAmount = items.reduce((sum, item) => 
    sum + (item[ImportItemFields.QUANTITY] * item[ImportItemFields.IMPORT_PRICE]), 0);

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-900">Danh sách sản phẩm</h2>
        <div className="text-sm text-gray-600">
          {items.length} sản phẩm • {totalQuantity} món
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                STT
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tên sản phẩm
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                SKU
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Số lượng
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Giá nhập
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Thành tiền
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {items.map((item, index) => (
              <tr key={item[ImportItemFields.ID]} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {index + 1}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    {item.products?.[ProductFields.IMAGE_URL] && (
                      <img 
                        className="h-10 w-10 rounded-lg object-cover mr-3" 
                        src={item.products[ProductFields.IMAGE_URL]}
                        alt={item.products[ProductFields.NAME]}
                      />
                    )}
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {item.products?.[ProductFields.NAME] || 'Sản phẩm không tồn tại'}
                      </div>
                      <div className="text-sm text-gray-500">
                        ID: {item[ImportItemFields.PRODUCT_ID]}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {item.products?.[ProductFields.SKU] || 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {item[ImportItemFields.QUANTITY]}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                  {formatCurrency(item[ImportItemFields.IMPORT_PRICE])}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-gray-900">
                  {formatCurrency(item[ImportItemFields.QUANTITY] * item[ImportItemFields.IMPORT_PRICE])}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Summary */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-600">
            Tổng cộng: {items.length} sản phẩm • {totalQuantity} món
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-lg font-semibold text-gray-900">TỔNG CỘNG:</span>
            <span className="text-lg font-bold text-green-600">{formatCurrency(totalAmount)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ImportItemsDetail;