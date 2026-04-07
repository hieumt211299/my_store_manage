import React from 'react';
import {
  ImportOrderFields,
  ImportOrderSourceType,
  formatDate,
} from '../../../models';

function ImportSourceInfo({ importOrder }) {
  const isAncarat = importOrder[ImportOrderFields.SOURCE_TYPE] === ImportOrderSourceType.ANCARAT;
  const isCustomer = importOrder[ImportOrderFields.SOURCE_TYPE] === ImportOrderSourceType.CUSTOMER;

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">
        {isAncarat ? 'Thông tin Ancarat' : 'Thông tin khách bán'}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {isAncarat && (
          <>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Số hóa đơn:</span>
                <span className="font-medium">
                  {importOrder[ImportOrderFields.ANCARAT_INVOICE_NUMBER] || 'N/A'}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Tên thu ngân:</span>
                <span className="font-medium">
                  {importOrder[ImportOrderFields.ANCARAT_CASHIER_NAME] || 'N/A'}
                </span>
              </div>
            </div>
          </>
        )}

        {isCustomer && (
          <>
            <div>
              <div className="flex mb-2">
                <span className="font-medium min-w-32">CMND/CCCD:</span>
                <span>{importOrder[ImportOrderFields.SELLER_ID_NUMBER] || 'N/A'}</span>
              </div>
              <div className="flex mb-2">
                <span className="font-medium min-w-32">Họ và tên:</span>
                <span>{importOrder[ImportOrderFields.SELLER_NAME] || 'N/A'}</span>
              </div>
              <div className="flex mb-2">
                <span className="font-medium min-w-32">Số điện thoại:</span>
                <span>{importOrder[ImportOrderFields.SELLER_PHONE] || 'N/A'}</span>
              </div>
              {importOrder[ImportOrderFields.SELLER_EMAIL] && (
                <div className="flex mb-2">
                  <span className="font-medium min-w-32">Email:</span>
                  <span>{importOrder[ImportOrderFields.SELLER_EMAIL]}</span>
                </div>
              )}
            </div>

            <div>
              <div className="flex mb-2">
                <span className="font-medium min-w-32">Ngày cấp:</span>
                <span>
                  {importOrder[ImportOrderFields.SELLER_ID_ISSUED_DATE] 
                    ? formatDate(importOrder[ImportOrderFields.SELLER_ID_ISSUED_DATE])
                    : 'N/A'
                  }
                </span>
              </div>
              <div className="flex mb-2">
                <span className="font-medium min-w-32">Địa chỉ:</span>
                <span>
                  {importOrder[ImportOrderFields.SELLER_ADDRESS] || 'N/A'}
                </span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default ImportSourceInfo;
