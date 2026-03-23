import React from 'react';
import {
  ImportOrderFields,
  ImportItemFields,
  ProductFields,
  ImportOrderSourceType,
  ImportOrderSourceTypeLabels,
  getImportStatusDisplay,
  formatCurrency,
  formatDate,
} from '../../../models';

const ImportPrintTemplate = React.forwardRef(({ importOrder }, ref) => {
  if (!importOrder) return null;

  const isAncarat = importOrder[ImportOrderFields.SOURCE_TYPE] === ImportOrderSourceType.ANCARAT;
  const isCustomer = importOrder[ImportOrderFields.SOURCE_TYPE] === ImportOrderSourceType.CUSTOMER;

  const totalQuantity = importOrder.import_items?.reduce((sum, item) => 
    sum + item[ImportItemFields.QUANTITY], 0) || 0;

  return (
    <div ref={ref} className="print-container">
      <style>{`
        @media print {
          @page {
            size: A4;
            margin: 15mm;
          }
          body * {
            visibility: hidden;
          }
          .print-container, .print-container * {
            visibility: visible;
          }
          .print-container {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
        }

        .print-container {
          background: #fff;
          padding: 32px;
          max-width: 896px;
          margin: 0 auto;
        }

        @media print {
          .print-container {
            font-size: 12px;
            max-width: none;
            margin: 0;
            padding: 20px;
          }
          
          .print-container h1 {
            font-size: 24px;
          }
          
          .print-container h3 {
            font-size: 14px;
          }
          
          .print-container table {
            font-size: 11px;
          }
        }
      `}</style>
      {/* Header */}
      <div className="border-b-2 border-black pb-4 mb-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold uppercase mb-2">PHIẾU NHẬP HÀNG</h1>
          <div className="text-lg font-semibold">
            Số: #{importOrder[ImportOrderFields.ID]}
          </div>
          <div className="text-sm text-gray-600 mt-1">
            Ngày tạo: {formatDate(importOrder[ImportOrderFields.CREATED_AT])}
          </div>
        </div>
      </div>

      {/* Import Info */}
      <div className="grid grid-cols-2 gap-8 mb-6">
        <div>
          <h3 className="font-bold text-lg mb-3 border-b border-gray-300 pb-1">THÔNG TIN NHẬP HÀNG</h3>
          <div className="space-y-2">
            <div className="flex">
              <span className="w-32 font-medium">Nguồn nhập:</span>
              <span>{ImportOrderSourceTypeLabels[importOrder[ImportOrderFields.SOURCE_TYPE]]}</span>
            </div>
            <div className="flex">
              <span className="w-32 font-medium">Ngày nhập:</span>
              <span>{formatDate(importOrder[ImportOrderFields.IMPORT_DATE])}</span>
            </div>
            {importOrder[ImportOrderFields.EXPECTED_RETURN_DATE] && (
              <div className="flex">
                <span className="w-32 font-medium">Ngày dự kiến trả:</span>
                <span>{formatDate(importOrder[ImportOrderFields.EXPECTED_RETURN_DATE])}</span>
              </div>
            )}
            <div className="flex">
              <span className="w-32 font-medium">Trạng thái:</span>
              <span>{getImportStatusDisplay(importOrder[ImportOrderFields.STATUS])}</span>
            </div>
            <div className="flex">
              <span className="w-32 font-medium">Người tạo:</span>
              <span>{importOrder[ImportOrderFields.CREATED_BY] || 'N/A'}</span>
            </div>
          </div>
        </div>

        <div>
          {isAncarat && (
            <>
              <h3 className="font-bold text-lg mb-3 border-b border-gray-300 pb-1">THÔNG TIN ANCARAT</h3>
              <div className="space-y-2">
                <div className="flex">
                  <span className="w-32 font-medium">Số hóa đơn:</span>
                  <span>{importOrder[ImportOrderFields.ANCARAT_INVOICE_NUMBER] || 'N/A'}</span>
                </div>
                <div className="flex">
                  <span className="w-32 font-medium">Tên thu ngân:</span>
                  <span>{importOrder[ImportOrderFields.ANCARAT_CASHIER_NAME] || 'N/A'}</span>
                </div>
              </div>
            </>
          )}

          {isCustomer && (
            <>
              <h3 className="font-bold text-lg mb-3 border-b border-gray-300 pb-1">THÔNG TIN KHÁCH BÁN</h3>
              <div className="space-y-2">
                <div className="flex">
                  <span className="w-32 font-medium">Tên:</span>
                  <span>{importOrder[ImportOrderFields.SELLER_NAME] || 'N/A'}</span>
                </div>
                <div className="flex">
                  <span className="w-32 font-medium">Số điện thoại:</span>
                  <span>{importOrder[ImportOrderFields.SELLER_PHONE] || 'N/A'}</span>
                </div>
                <div className="flex">
                  <span className="w-32 font-medium">CCCD/CMND:</span>
                  <span>{importOrder[ImportOrderFields.SELLER_ID_NUMBER] || 'N/A'}</span>
                </div>
                {importOrder[ImportOrderFields.SELLER_ID_ISSUED_DATE] && (
                  <div className="flex">
                    <span className="w-32 font-medium">Ngày cấp:</span>
                    <span>{formatDate(importOrder[ImportOrderFields.SELLER_ID_ISSUED_DATE])}</span>
                  </div>
                )}
                {importOrder[ImportOrderFields.SELLER_ADDRESS] && (
                  <div className="flex">
                    <span className="w-32 font-medium">Địa chỉ:</span>
                    <span>{importOrder[ImportOrderFields.SELLER_ADDRESS]}</span>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Products Table */}
      <div className="mb-6">
        <h3 className="font-bold text-lg mb-3 border-b border-gray-300 pb-1">DANH SÁCH SẢN PHẨM</h3>
        <table className="w-full border-collapse border border-black">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-black px-3 py-2 text-center font-bold">STT</th>
              <th className="border border-black px-3 py-2 text-left font-bold">Tên sản phẩm</th>
              <th className="border border-black px-3 py-2 text-left font-bold">SKU</th>
              <th className="border border-black px-3 py-2 text-center font-bold">Số lượng</th>
              <th className="border border-black px-3 py-2 text-right font-bold">Giá nhập</th>
              <th className="border border-black px-3 py-2 text-right font-bold">Thành tiền</th>
            </tr>
          </thead>
          <tbody>
            {importOrder.import_items?.map((item, index) => (
              <tr key={item[ImportItemFields.ID]}>
                <td className="border border-black px-3 py-2 text-center">{index + 1}</td>
                <td className="border border-black px-3 py-2">
                  <div>{item.products?.[ProductFields.NAME] || 'Sản phẩm không tồn tại'}</div>
                  <div className="text-xs text-gray-600">ID: {item[ImportItemFields.PRODUCT_ID]}</div>
                </td>
                <td className="border border-black px-3 py-2">
                  {item.products?.[ProductFields.SKU] || 'N/A'}
                </td>
                <td className="border border-black px-3 py-2 text-center">
                  {item[ImportItemFields.QUANTITY]}
                </td>
                <td className="border border-black px-3 py-2 text-right">
                  {formatCurrency(item[ImportItemFields.IMPORT_PRICE])}
                </td>
                <td className="border border-black px-3 py-2 text-right">
                  {formatCurrency(item[ImportItemFields.QUANTITY] * item[ImportItemFields.IMPORT_PRICE])}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-8 mb-8">
        <div>
          <div className="text-sm">
            <div className="mb-2">Tổng số loại sản phẩm: <strong>{importOrder.import_items?.length || 0}</strong></div>
            <div className="mb-2">Tổng số lượng: <strong>{totalQuantity}</strong></div>
          </div>
        </div>
        
        <div>
          <div className="text-right">
            <div className="text-2xl font-bold border-t border-black pt-2">
              TỔNG CỘNG: {formatCurrency(importOrder[ImportOrderFields.TOTAL_AMOUNT])}
            </div>
          </div>
        </div>
      </div>

      {/* Signatures */}
      <div className="grid grid-cols-3 gap-8 text-center mt-12">
        <div>
          <div className="font-bold mb-8">NGƯỜI LẬP PHIẾU</div>
          <div className="text-sm">(Ký, ghi rõ họ tên)</div>
          <div className="h-16"></div>
          <div className="border-t border-gray-400 pt-2 text-sm">
            {importOrder[ImportOrderFields.CREATED_BY] || ''}
          </div>
        </div>
        
        <div>
          <div className="font-bold mb-8">NGƯỜI GIAO HÀNG</div>
          <div className="text-sm">(Ký, ghi rõ họ tên)</div>
          <div className="h-16"></div>
          <div className="border-t border-gray-400 pt-2 text-sm">
            {isAncarat 
              ? (importOrder[ImportOrderFields.ANCARAT_CASHIER_NAME] || '')
              : (importOrder[ImportOrderFields.SELLER_NAME] || '')
            }
          </div>
        </div>
        
        <div>
          <div className="font-bold mb-8">NGƯỜI NHẬN HÀNG</div>
          <div className="text-sm">(Ký, ghi rõ họ tên)</div>
          <div className="h-16"></div>
          <div className="border-t border-gray-400 pt-2 text-sm"></div>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center text-xs text-gray-500 mt-8 border-t border-gray-300 pt-4">
        Phiếu nhập hàng được tạo tự động • In lúc: {new Date().toLocaleString('vi-VN')}
      </div>
    </div>
  );
});

ImportPrintTemplate.displayName = 'ImportPrintTemplate';

export default ImportPrintTemplate;
