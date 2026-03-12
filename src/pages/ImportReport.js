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
  Cell,
  BarChart,
  Bar
} from 'recharts';
import {
  fetchImportData,
  getImportSummary,
  groupImportsByDate,
  formatCurrency,
  formatNumber,
  formatDateForDisplay
} from '../utils/analytics';
import {
  ImportOrderStatusLabels,
  ImportOrderStatusBadgeColors,
  ImportOrderSourceTypeLabels,
  ImportOrderSourceTypeBadgeColors,
} from '../models';

function ImportReport() {
  const { dateRange } = useOutletContext();
  const [importOrders, setImportOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setMessage('');
      const data = await fetchImportData(dateRange.startDate, dateRange.endDate);
      setImportOrders(data);
    } catch (error) {
      console.error('Error fetching import data:', error);
      setMessage(`Lỗi tải dữ liệu: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }, [dateRange]);

  // Fetch import data when date range changes
  useEffect(() => {
    if (dateRange) {
      fetchData();
    }
  }, [dateRange, fetchData]);

  // Calculate metrics
  const summary = getImportSummary(importOrders);
  const importsByDate = groupImportsByDate(importOrders);
  
  // Prepare data for status pie chart
  const statusData = Object.entries(summary.importsByStatus).map(([status, count]) => ({
    name: ImportOrderStatusLabels[status] || status,
    value: count,
    color: status === 'completed' ? '#10B981' : '#F59E0B'
  }));

  // Prepare data for source type pie chart
  const sourceTypeData = Object.entries(summary.importsBySourceType).map(([sourceType, count]) => ({
    name: ImportOrderSourceTypeLabels[sourceType] || sourceType,
    value: count,
    color: sourceType === 'ancarat' ? '#3B82F6' : '#8B5CF6'
  }));

  // Custom tooltip for line chart
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900">{formatDateForDisplay(new Date(label))}</p>
          <p className="text-green-600">
            <span className="inline-block w-3 h-3 bg-green-500 rounded-full mr-2"></span>
            Giá trị nhập: {formatCurrency(payload[0].value)}
          </p>
          <p className="text-gray-600">
            Số đơn: {payload[0].payload.orders}
          </p>
          <p className="text-blue-600">
            Số lượng sản phẩm: {payload[0].payload.itemsCount}
          </p>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        <span className="ml-3 text-lg text-gray-600">Đang tải báo cáo nhập hàng...</span>
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
        {/* Total Import Value */}
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-green-100 text-sm">Tổng giá trị nhập</p>
              <p className="text-2xl font-bold">{formatCurrency(summary.totalImportValue)}</p>
            </div>
            <div className="bg-green-400 bg-opacity-50 rounded-full p-3">
              <span className="text-2xl">📦</span>
            </div>
          </div>
        </div>

        {/* Total Import Orders */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-blue-100 text-sm">Tổng đơn nhập</p>
              <p className="text-2xl font-bold">{formatNumber(summary.totalImportOrders)}</p>
            </div>
            <div className="bg-blue-400 bg-opacity-50 rounded-full p-3">
              <span className="text-2xl">📋</span>
            </div>
          </div>
        </div>

        {/* Average Import Value */}
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-6 text-white">
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-purple-100 text-sm">Giá trị nhập TB</p>
              <p className="text-2xl font-bold">{formatCurrency(summary.avgImportValue)}</p>
            </div>
            <div className="bg-purple-400 bg-opacity-50 rounded-full p-3">
              <span className="text-2xl">📊</span>
            </div>
          </div>
        </div>

        {/* Total Items Imported */}
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg p-6 text-white">
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-orange-100 text-sm">Tổng sản phẩm</p>
              <p className="text-2xl font-bold">{formatNumber(summary.totalItemsImported)}</p>
            </div>
            <div className="bg-orange-400 bg-opacity-50 rounded-full p-3">
              <span className="text-2xl">🏷️</span>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Import Trend Chart */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Xu hướng nhập hàng</h3>
            <div className="flex items-center text-sm text-gray-500">
              <div className="flex items-center mr-4">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                <span>Giá trị nhập hàng ngày</span>
              </div>
            </div>
          </div>

          {importsByDate.length > 0 ? (
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={importsByDate}>
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
                    dataKey="importValue" 
                    stroke="#10B981" 
                    strokeWidth={3}
                    dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, stroke: '#10B981', strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-80 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <span className="text-4xl mb-2 block">📈</span>
                <p>Không có dữ liệu nhập hàng trong khoảng thời gian này</p>
              </div>
            </div>
          )}
        </div>

        {/* Import Status Distribution */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Phân bố trạng thái đơn nhập</h3>
          
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
                    <Tooltip formatter={(value) => [value, 'Đơn nhập']} />
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
                    <span className="text-sm font-semibold text-gray-900">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-48 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <span className="text-4xl mb-2 block">📊</span>
                <p>Không có dữ liệu</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Source Type Distribution */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Phân bố nguồn nhập hàng</h3>
          
          {sourceTypeData.length > 0 ? (
            <div>
              <div className="h-48 mb-4">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={sourceTypeData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {sourceTypeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                      <Tooltip formatter={(value) => [value, 'Đơn nhập']} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              
              {/* Legend */}
              <div className="space-y-2">
                {sourceTypeData.map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div 
                        className="w-3 h-3 rounded-full mr-2"
                        style={{ backgroundColor: item.color }}
                      ></div>
                      <span className="text-sm text-gray-700">{item.name}</span>
                    </div>
                    <span className="text-sm font-semibold text-gray-900">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-48 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <span className="text-4xl mb-2 block">📊</span>
                <p>Không có dữ liệu</p>
              </div>
            </div>
          )}
        </div>

        {/* Import Items Bar Chart */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Số lượng sản phẩm nhập theo ngày</h3>
          
          {importsByDate.length > 0 ? (
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={importsByDate}>
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
                  />
                  <Tooltip 
                    formatter={(value, name) => [value, 'Số lượng sản phẩm']}
                    labelFormatter={(label) => formatDateForDisplay(new Date(label))}
                  />
                  <Bar dataKey="itemsCount" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-48 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <span className="text-4xl mb-2 block">📊</span>
                <p>Không có dữ liệu</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Recent Import Orders Table */}
      {importOrders.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Đơn nhập hàng gần đây</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ngày nhập
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nguồn
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trạng thái
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Số sản phẩm
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tổng giá trị
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {importOrders.slice(0, 10).map((importOrder) => (
                  <tr key={importOrder.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDateForDisplay(new Date(importOrder.import_date))}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${ImportOrderSourceTypeBadgeColors[importOrder.source_type] || 'bg-gray-100 text-gray-800'}`}>
                        {ImportOrderSourceTypeLabels[importOrder.source_type] || importOrder.source_type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${ImportOrderStatusBadgeColors[importOrder.status] || 'bg-gray-100 text-gray-800'}`}>
                        {ImportOrderStatusLabels[importOrder.status] || importOrder.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {importOrder.import_items?.reduce((total, item) => total + item.quantity, 0) || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {formatCurrency(importOrder.total_amount)}
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

export default ImportReport;