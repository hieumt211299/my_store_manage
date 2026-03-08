import React, { useState, useEffect, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts';
import {
  fetchProductSalesData,
  groupProductSalesData,
  formatCurrency,
  formatNumber
} from '../utils/analytics';

function ProductSalesReport() {
  const { dateRange } = useOutletContext();
  const [productSales, setProductSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setMessage('');
      const data = await fetchProductSalesData(dateRange.startDate, dateRange.endDate);
      const groupedData = groupProductSalesData(data);
      setProductSales(groupedData);
    } catch (error) {
      console.error('Error fetching product sales data:', error);
      setMessage(`Lỗi tải dữ liệu: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }, [dateRange]);

  // Fetch product sales data when date range changes
  useEffect(() => {
    if (dateRange) {
      fetchData();
    }
  }, [dateRange, fetchData]);

  // Calculate total metrics
  const totalQuantitySold = productSales.reduce((sum, item) => sum + item.totalQuantity, 0);
  const totalRevenue = productSales.reduce((sum, item) => sum + item.totalRevenue, 0);
  const totalProducts = productSales.length;
  const avgRevenuePerProduct = totalProducts > 0 ? totalRevenue / totalProducts : 0;

  // Prepare data for bar chart (top 10 best sellers by quantity)
  const topProductsByQuantity = productSales.slice(0, 10).map(product => ({
    name: product.name.length > 15 ? product.name.substring(0, 15) + '...' : product.name,
    fullName: product.name,
    quantity: product.totalQuantity,
    revenue: product.totalRevenue,
    sku: product.sku
  }));

  // Prepare data for revenue chart (top 10 by revenue)
  const topProductsByRevenue = [...productSales]
    .sort((a, b) => b.totalRevenue - a.totalRevenue)
    .slice(0, 10)
    .map(product => ({
      name: product.name.length > 15 ? product.name.substring(0, 15) + '...' : product.name,
      fullName: product.name,
      revenue: product.totalRevenue,
      quantity: product.totalQuantity,
      sku: product.sku
    }));

  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg max-w-xs">
          <p className="font-medium text-gray-900 mb-2">{data.fullName}</p>
          <p className="text-sm text-gray-600 mb-1">SKU: {data.sku}</p>
          <p className="text-blue-600">
            <span className="inline-block w-3 h-3 bg-blue-500 rounded-full mr-2"></span>
            Số lượng: {formatNumber(data.quantity)}
          </p>
          <p className="text-green-600">
            <span className="inline-block w-3 h-3 bg-green-500 rounded-full mr-2"></span>
            Doanh thu: {formatCurrency(data.revenue)}
          </p>
        </div>
      );
    }
    return null;
  };

  const RevenueTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg max-w-xs">
          <p className="font-medium text-gray-900 mb-2">{data.fullName}</p>
          <p className="text-sm text-gray-600 mb-1">SKU: {data.sku}</p>
          <p className="text-green-600">
            <span className="inline-block w-3 h-3 bg-green-500 rounded-full mr-2"></span>
            Doanh thu: {formatCurrency(data.revenue)}
          </p>
          <p className="text-blue-600">
            <span className="inline-block w-3 h-3 bg-blue-500 rounded-full mr-2"></span>
            Số lượng: {formatNumber(data.quantity)}
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
        <span className="ml-3 text-lg text-gray-600">Đang tải báo cáo sản phẩm...</span>
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
        {/* Total Products Sold */}
        <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-lg p-6 text-white">
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-indigo-100 text-sm">Tổng sản phẩm bán</p>
              <p className="text-2xl font-bold">{formatNumber(totalQuantitySold)}</p>
            </div>
            <div className="bg-indigo-400 bg-opacity-50 rounded-full p-3">
              <span className="text-2xl">📦</span>
            </div>
          </div>
        </div>

        {/* Total Revenue */}
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-green-100 text-sm">Tổng doanh thu</p>
              <p className="text-2xl font-bold">{formatCurrency(totalRevenue)}</p>
            </div>
            <div className="bg-green-400 bg-opacity-50 rounded-full p-3">
              <span className="text-2xl">💰</span>
            </div>
          </div>
        </div>

        {/* Total Product Types */}
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-6 text-white">
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-purple-100 text-sm">Loại sản phẩm</p>
              <p className="text-2xl font-bold">{formatNumber(totalProducts)}</p>
            </div>
            <div className="bg-purple-400 bg-opacity-50 rounded-full p-3">
              <span className="text-2xl">🗂️</span>
            </div>
          </div>
        </div>

        {/* Average Revenue per Product */}
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg p-6 text-white">
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-orange-100 text-sm">DT TB/Sản phẩm</p>
              <p className="text-2xl font-bold">{formatCurrency(avgRevenuePerProduct)}</p>
            </div>
            <div className="bg-orange-400 bg-opacity-50 rounded-full p-3">
              <span className="text-2xl">📊</span>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products by Quantity */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Top sản phẩm bán chạy</h3>
            <div className="flex items-center text-sm text-gray-500">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                <span>Số lượng bán</span>
              </div>
            </div>
          </div>

          {topProductsByQuantity.length > 0 ? (
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topProductsByQuantity} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis 
                    type="number"
                    stroke="#6B7280"
                    fontSize={12}
                    tickFormatter={formatNumber}
                  />
                  <YAxis 
                    type="category"
                    dataKey="name"
                    stroke="#6B7280"
                    fontSize={11}
                    width={120}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar 
                    dataKey="quantity" 
                    fill="#3B82F6"
                    radius={[0, 4, 4, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-80 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <span className="text-4xl mb-2 block">📦</span>
                <p>Không có dữ liệu bán hàng trong khoảng thời gian này</p>
              </div>
            </div>
          )}
        </div>

        {/* Top Products by Revenue */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Top sản phẩm theo doanh thu</h3>
            <div className="flex items-center text-sm text-gray-500">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                <span>Doanh thu</span>
              </div>
            </div>
          </div>

          {topProductsByRevenue.length > 0 ? (
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={topProductsByRevenue}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis 
                    dataKey="name"
                    stroke="#6B7280"
                    fontSize={11}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis 
                    stroke="#6B7280"
                    fontSize={12}
                    tickFormatter={formatNumber}
                  />
                  <Tooltip content={<RevenueTooltip />} />
                  <Area 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#10B981"
                    fill="#10B981"
                    fillOpacity={0.6}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-80 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <span className="text-4xl mb-2 block">💰</span>
                <p>Không có dữ liệu doanh thu trong khoảng thời gian này</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Detailed Product Table */}
      {productSales.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Chi tiết bán hàng theo sản phẩm</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sản phẩm
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    SKU
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Số lượng
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Doanh thu
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Giá TB
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    % Doanh thu
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {productSales.map((product, index) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-8 w-8 bg-gray-200 rounded-full flex items-center justify-center">
                          <span className="text-xs font-medium text-gray-600">#{index + 1}</span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 max-w-xs truncate" title={product.name}>
                            {product.name}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {product.sku}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {formatNumber(product.totalQuantity)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {formatCurrency(product.totalRevenue)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(product.totalQuantity > 0 ? product.totalRevenue / product.totalQuantity : 0)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-1 bg-gray-200 rounded-full h-2 mr-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{
                              width: `${totalRevenue > 0 ? (product.totalRevenue / totalRevenue * 100) : 0}%`
                            }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-600 min-w-0">
                          {totalRevenue > 0 ? ((product.totalRevenue / totalRevenue * 100).toFixed(1)) : 0}%
                        </span>
                      </div>
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

export default ProductSalesReport;