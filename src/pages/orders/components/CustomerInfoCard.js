import React from 'react';
import { OrderFields, formatDate, getCustomerDiscoverySourceLabel } from '../../../models';

function CustomerInfoCard({ order, children }) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Thông tin khách hàng</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <div className="flex mb-2">
            <span className="font-medium min-w-32">CMND/CCCD:</span>
            <span>{order[OrderFields.CUSTOMER_ID_NUMBER]}</span>
          </div>
          <div className="flex mb-2">
            <span className="font-medium min-w-32">Họ và tên:</span>
            <span>{order[OrderFields.CUSTOMER_NAME]}</span>
          </div>
          <div className="flex mb-2">
            <span className="font-medium min-w-32">Số điện thoại:</span>
            <span>{order[OrderFields.CUSTOMER_PHONE]}</span>
          </div>
        </div>
        <div>
          {order[OrderFields.CUSTOMER_ID_ISSUED_DATE] && (
            <div className="flex mb-2">
              <span className="font-medium min-w-32">Ngày cấp:</span>
              <span>{formatDate(order[OrderFields.CUSTOMER_ID_ISSUED_DATE])}</span>
            </div>
          )}
          <div className="flex mb-2">
            <span className="font-medium min-w-32">Địa chỉ:</span>
            <span>{order[OrderFields.CUSTOMER_ADDRESS]}</span>
          </div>
          {order[OrderFields.CUSTOMER_DISCOVERY_SOURCE] && (
            <div className="flex mb-2">
              <span className="font-medium min-w-32">Nguồn khách biết đến:</span>
              <span>{getCustomerDiscoverySourceLabel(order[OrderFields.CUSTOMER_DISCOVERY_SOURCE])}</span>
            </div>
          )}
          <div className="flex mb-2">
            <span className="font-medium min-w-32">Ngày giao hàng dự kiến:</span>
            <span>{formatDate(order[OrderFields.EXPECTED_DELIVERY_DATE])}</span>
          </div>
          {order[OrderFields.CREATED_BY] && (
            <div className="flex mb-2">
              <span className="font-medium min-w-32">Nhân viên phụ trách:</span>
              <span>{order[OrderFields.CREATED_BY]}</span>
            </div>
          )}
          {order[OrderFields.DATE_RECEIVED] && (
            <div className="flex mb-2">
              <span className="font-medium min-w-32">Ngày đã nhận thực tế:</span>
              <span className="text-green-600 font-semibold">{formatDate(order[OrderFields.DATE_RECEIVED])}</span>
            </div>
          )}
        </div>
      </div>
      {children}
    </div>
  );
}

export default CustomerInfoCard;
