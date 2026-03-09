import React from 'react';
import { FaSpinner } from 'react-icons/fa';

const LoadingOverlay = ({
  isVisible = false,
  message = 'Đang xử lý...',
  background = 'rgba(0, 0, 0, 0.5)',
  zIndex = 9999
}) => {
  if (!isVisible) return null;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center"
      style={{
        backgroundColor: background,
        zIndex: zIndex,
        pointerEvents: 'auto' // Prevent clicking through
      }}
    >
      <div className="bg-white rounded-lg shadow-xl p-8 flex flex-col items-center space-y-4 min-w-64">
        <FaSpinner className="text-4xl text-blue-600 animate-spin" />
        <div className="text-lg font-medium text-gray-900 text-center">
          {message}
        </div>
        <div className="text-sm text-gray-500 text-center">
          Vui lòng đợi và không đóng trình duyệt...
        </div>
      </div>
    </div>
  );
};

export default LoadingOverlay;