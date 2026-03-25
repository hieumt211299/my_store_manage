import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';

function ReportsLayout() {
  const reportNavItems = [
    {
      path: '/reports/revenue',
      label: 'Báo cáo doanh thu',
      icon: '💰'
    },
    {
      path: '/reports/due-soon',
      label: 'Sắp tới hạn',
      icon: '⏰'
    },
    {
      path: '/reports/purchase-ledger',
      label: 'Bảng kê thu mua',
      icon: '🧾'
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Báo cáo</h1>
        <p className="text-gray-600">Theo dõi dòng tiền, bảng kê thu mua và các đơn sắp tới hạn cần xử lý</p>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex space-x-8">
          {reportNavItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                  isActive
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`
              }
            >
              <span className="mr-2">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Report Content */}
      <div className="pb-8">
        <Outlet />
      </div>
    </div>
  );
}

export default ReportsLayout;
