import React, { useState, useMemo } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import {
  getTimePeriodOptions,
  getMonthOptions,
  formatDateForDisplay
} from '../utils/analytics';

function ReportsLayout() {
  const [selectedPeriod, setSelectedPeriod] = useState('last30days');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');

  const timePeriodOptions = getTimePeriodOptions();
  const monthOptions = getMonthOptions();

  // Calculate current date range based on selected period
  const currentDateRange = useMemo(() => {
    const selectedOption = timePeriodOptions.find(option => option.key === selectedPeriod);
    
    if (selectedPeriod === 'custom') {
      if (customStartDate && customEndDate) {
        return {
          startDate: new Date(customStartDate),
          endDate: new Date(customEndDate + 'T23:59:59')
        };
      }
      return null;
    } else if (selectedPeriod === 'month' && selectedMonth) {
      const monthOption = monthOptions.find(option => option.value === selectedMonth);
      return monthOption ? {
        startDate: monthOption.startDate,
        endDate: monthOption.endDate
      } : null;
    } else {
      return selectedOption?.getValue();
    }
  }, [selectedPeriod, customStartDate, customEndDate, selectedMonth, timePeriodOptions, monthOptions]);

  const handlePeriodChange = (e) => {
    setSelectedPeriod(e.target.value);
  };

  const handleMonthChange = (e) => {
    setSelectedMonth(e.target.value);
  };

  const reportNavItems = [
    {
      path: '/reports/revenue',
      label: 'Báo cáo doanh thu',
      icon: '💰'
    },
    {
      path: '/reports/products', 
      label: 'Báo cáo sản phẩm',
      icon: '📦'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Báo cáo</h1>
        <p className="text-gray-600">Theo dõi hiệu suất kinh doanh và xu hướng bán hàng</p>
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

      {/* Time Filter Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Bộ lọc thời gian</h3>
          
          {currentDateRange && (
            <div className="text-sm text-gray-600">
              <span className="font-medium">
                {formatDateForDisplay(currentDateRange.startDate)} - {formatDateForDisplay(currentDateRange.endDate)}
              </span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Time Period Selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Khoảng thời gian
            </label>
            <select
              value={selectedPeriod}
              onChange={handlePeriodChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {timePeriodOptions.map((option) => (
                <option key={option.key} value={option.key}>
                  {option.label}
                </option>
              ))}
              <option value="month">Theo tháng</option>
            </select>
          </div>

          {/* Month Selector (when period is 'month') */}
          {selectedPeriod === 'month' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Chọn tháng
              </label>
              <select
                value={selectedMonth}
                onChange={handleMonthChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Chọn tháng...</option>
                {monthOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Custom Date Range (when period is 'custom') */}
          {selectedPeriod === 'custom' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Từ ngày
                </label>
                <input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Đến ngày
                </label>
                <input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  min={customStartDate}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </>
          )}
        </div>

        {/* Invalid date range warning */}
        {selectedPeriod === 'custom' && customStartDate && customEndDate && new Date(customStartDate) > new Date(customEndDate) && (
          <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-700">Ngày bắt đầu không thể sau ngày kết thúc</p>
          </div>
        )}
      </div>

      {/* Report Content */}
      <div className="pb-8">
        {currentDateRange ? (
          <Outlet context={{ dateRange: currentDateRange }} />
        ) : (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <span className="text-yellow-400 text-xl">⚠️</span>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">
                  Vui lòng chọn khoảng thời gian
                </h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>Để xem báo cáo, hãy chọn một khoảng thời gian hợp lệ ở phía trên.</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ReportsLayout;