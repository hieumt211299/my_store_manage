import React from 'react';
import StatusBadge from '../../../components/StatusBadge';
import {
  ImportOrderFields,
  ImportOrderStatus,
  getImportStatusDisplay,
  getImportStatusBadgeColor,
  getImportSourceTypeLabel,
  getImportSourceTypeBadgeColor,
  formatCurrency,
  formatDate,
} from '../../../models';

function ImportInfoCard({ importOrder, statusLoading, onUpdateStatus }) {
  const canChangeStatus = importOrder[ImportOrderFields.STATUS] === ImportOrderStatus.PENDING;

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-start mb-4">
        <h2 className="text-xl font-semibold text-gray-900">Thông tin đơn nhập</h2>
        <div className="flex items-center space-x-3">
          <StatusBadge color={getImportStatusBadgeColor(importOrder[ImportOrderFields.STATUS])}>
            {getImportStatusDisplay(importOrder[ImportOrderFields.STATUS])}
          </StatusBadge>
          {canChangeStatus && (
            <button
              onClick={() => onUpdateStatus(ImportOrderStatus.COMPLETED)}
              disabled={statusLoading}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50"
            >
              {statusLoading ? 'Đang cập nhật...' : 'Hoàn thành đơn'}
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Basic Info */}
        <div className="space-y-4">
          <div className="flex justify-between">
            <span className="text-gray-600">ID:</span>
            <span className="font-medium">#{importOrder[ImportOrderFields.ID]}</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-gray-600">Nguồn nhập:</span>
            <StatusBadge color={getImportSourceTypeBadgeColor(importOrder[ImportOrderFields.SOURCE_TYPE])}>
              {getImportSourceTypeLabel(importOrder[ImportOrderFields.SOURCE_TYPE])}
            </StatusBadge>
          </div>
          
          <div className="flex justify-between">
            <span className="text-gray-600">Ngày nhập:</span>
            <span className="font-medium">
              {formatDate(importOrder[ImportOrderFields.IMPORT_DATE])}
            </span>
          </div>
          
          {importOrder[ImportOrderFields.EXPECTED_RETURN_DATE] && (
            <div className="flex justify-between">
              <span className="text-gray-600">Ngày dự kiến trả:</span>
              <span className="font-medium">
                {formatDate(importOrder[ImportOrderFields.EXPECTED_RETURN_DATE])}
              </span>
            </div>
          )}
          
          {importOrder[ImportOrderFields.ACTUAL_RETURN_DATE] && (
            <div className="flex justify-between">
              <span className="text-gray-600">Ngày trả thực tế:</span>
              <span className="font-medium text-green-700">
                {formatDate(importOrder[ImportOrderFields.ACTUAL_RETURN_DATE])}
              </span>
            </div>
          )}
        </div>

        {/* Financial Info */}
        <div className="space-y-4">
          <div className="flex justify-between">
            <span className="text-gray-600">Người tạo:</span>
            <span className="font-medium">
              {importOrder[ImportOrderFields.CREATED_BY] || 'N/A'}
            </span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-gray-600">Ngày tạo:</span>
            <span className="font-medium">
              {formatDate(importOrder[ImportOrderFields.CREATED_AT])}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ImportInfoCard;