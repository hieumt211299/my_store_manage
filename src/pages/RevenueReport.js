import React, { useState, useEffect, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import {
  fetchRevenueData,
  getRevenueSummary,
  groupRevenueByDate,
  formatCurrency,
  formatNumber,
  formatDateForDisplay
} from '../utils/analytics';
import {
  OrderStatusLabels,
  OrderStatusChartColors,
} from '../models';

function RevenueReport() {
  const { dateRange } = useOutletContext();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setMessage('');
      const data = await fetchRevenueData(dateRange.startDate, dateRange.endDate);
      setOrders(data);
    } catch (error) {
      console.error('Error fetching revenue data:', error);
      setMessage(`Lỗi tải dữ liệu: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }, [dateRange]);

  // Fetch revenue data when date range changes
  useEffect(() => {
    if (dateRange) {
      fetchData();
    }
  }, [dateRange, fetchData]);

  // Calculate metrics
  const summary = getRevenueSummary(orders);
  const revenueByDate = groupRevenueByDate(orders);
  
  // Prepare data for pie chart (orders by status)
  const statusData = Object.entries(summary.ordersByStatus).map(([status, count]) => ({
    name: OrderStatusLabels[status] || status,
    value: count,
    color: OrderStatusChartColors[status] || '#6B7280'
  }));

  // Custom tooltip for line chart
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900">{formatDateForDisplay(new Date(label))}</p>
          <p className="text-blue-600">
            <span className="inline-block w-3 h-3 bg-blue-500 rounded-full mr-2"></span>
            Doanh thu: {formatCurrency(payload[0].value)}
          </p>
          <p className="text-gray-600">
            Số đơn: {payload[0].payload.orders}
          </p>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-lg text-gray-600">Đang tải báo cáo doanh thu...</span>
      </div>
    );
  }

  if (message) {
    return (
      <div className="bg-red-50 text-red-700 border border-red-200 p-4 rounded-lg">
        {message}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Revenue */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-blue-100 text-sm">Tổng doanh thu</p>
              <p className="text-2xl font-bold">{formatCurrency(summary.totalRevenue)}</p>
            </div>
            <div className="bg-blue-400 bg-opacity-50 rounded-full p-3">
              <span className="text-2xl">💰</span>
            </div>
          </div>
        </div>

        {/* Total Orders */}
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-green-100 text-sm">Tổng đơn hàng</p>
              <p className="text-2xl font-bold">{formatNumber(summary.totalOrders)}</p>
            </div>
            <div className="bg-green-400 bg-opacity-50 rounded-full p-3">
              <span className="text-2xl">📋</span>
            </div>
          </div>
        </div>

        {/* Average Order Value */}
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-6 text-white">
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-purple-100 text-sm">Giá trị đơn TB</p>
              <p className="text-2xl font-bold">{formatCurrency(summary.avgOrderValue)}</p>
            </div>
            <div className="bg-purple-400 bg-opacity-50 rounded-full p-3">
              <span className="text-2xl">📊</span>
            </div>
          </div>
        </div>

        {/* Received Orders */}
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg p-6 text-white">
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-orange-100 text-sm">Đơn đã nhận</p>
              <p className="text-2xl font-bold">{formatNumber(summary.ordersByStatus.received || 0)}</p>
            </div>
            <div className="bg-orange-400 bg-opacity-50 rounded-full p-3">
              <span className="text-2xl">✅</span>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Trend Chart */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Xu hướng doanh thu</h3>
            <div className="flex items-center text-sm text-gray-500">
              <div className="flex items-center mr-4">
                <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                <span>Doanh thu hàng ngày</span>
              </div>
            </div>
          </div>

          {revenueByDate.length > 0 ? (
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={revenueByDate}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis 
                    dataKey="date" 
                    stroke="#6B7280"
                    fontSize={12}
                    tickFormatter={(value) => {
                      const date = new Date(value);
                      return `${date.getDate()}/${date.getMonth() + 1}`;
                    }}
                  />
                  <YAxis 
                    stroke="#6B7280"
                    fontSize={12}
                    tickFormatter={(value) => formatNumber(value)}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Line 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#3B82F6" 
                    strokeWidth={3}
                    dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, stroke: '#3B82F6', strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-80 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <span className="text-4xl mb-2 block">📈</span>
                <p>Không có dữ liệu doanh thu trong khoảng thời gian này</p>
              </div>
            </div>
          )}
        </div>

        {/* Order Status Distribution */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Phân bố trạng thái đơn hàng</h3>
          
          {statusData.length > 0 ? (
            <div>
              <div className="h-48 mb-4">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [value, 'Đơn hàng']} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              
              {/* Legend */}
              <div className="space-y-2">
                {statusData.map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div 
                        className="w-3 h-3 rounded-full mr-2"
                        style={{ backgroundColor: item.color }}
                      ></div>
                      <span className="text-sm text-gray-700">{item.name}</span>
                    </div>
                    <span className="text-sm font-medium text-gray-900">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-48 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <span className="text-4xl mb-2 block">📊</span>
                <p className="text-sm">Không có dữ liệu</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Summary Table */}
      {revenueByDate.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Chi tiết theo ngày</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ngày
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Doanh thu
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Số đơn
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Giá trị TB
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {revenueByDate.slice(-7).reverse().map((row) => (
                  <tr key={row.date} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDateForDisplay(new Date(row.date))}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {formatCurrency(row.revenue)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {row.orders}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(row.orders > 0 ? row.revenue / row.orders : 0)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default RevenueReport;