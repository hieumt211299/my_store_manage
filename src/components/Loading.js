import React from 'react';

const Loading = React.memo(function Loading({ type = 'page', message = 'Đang tải...', colSpan = 6, className = '' }) {
  // Loading cho trang (fullscreen)
  if (type === 'page') {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-center items-center h-64">
          <div className={`flex items-center space-x-2 text-lg text-gray-600 ${className}`}>
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span>{message}</span>
          </div>
        </div>
      </div>
    );
  }

  // Loading cho bảng (table row)
  if (type === 'table') {
    return (
      <tr>
        <td colSpan={colSpan} className="px-6 py-12 text-center">
          <div className={`flex justify-center items-center space-x-2 text-lg text-gray-600 ${className}`}>
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span>{message}</span>
          </div>
        </td>
      </tr>
    );
  }

  // Loading inline (cho button, text, etc.)
  if (type === 'inline') {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
        <span>{message}</span>
      </div>
    );
  }

  // Loading đơn giản (chỉ text với spinner)
  return (
    <div className={`flex items-center space-x-2 text-gray-600 ${className}`}>
      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
      <span>{message}</span>
    </div>
  );
});

export default Loading;