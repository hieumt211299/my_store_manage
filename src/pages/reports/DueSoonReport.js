import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  fetchDueSoonData,
  getDueSoonSummary,
  groupDueSoonItems,
  DueSoonKindLabels,
  formatCurrency,
  formatDateForDisplay,
} from '../../utils/analytics';

const getDueBadge = (daysUntilDue) => {
  if (daysUntilDue < 0) {
    return { label: `Quá hạn ${Math.abs(daysUntilDue)} ngày`, className: 'bg-red-100 text-red-700' };
  }

  if (daysUntilDue === 0) {
    return { label: 'Đến hạn hôm nay', className: 'bg-orange-100 text-orange-700' };
  }

  if (daysUntilDue <= 3) {
    return { label: `${daysUntilDue} ngày nữa`, className: 'bg-amber-100 text-amber-700' };
  }

  return { label: `${daysUntilDue} ngày nữa`, className: 'bg-sky-100 text-sky-700' };
};

function DueSoonList({ title, items }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <span className="text-sm font-medium text-gray-500">{items.length} đơn</span>
      </div>

      {items.length === 0 ? (
        <div className="text-sm text-gray-500">Không có đơn trong nhóm này.</div>
      ) : (
        <div className="space-y-3">
          {items.slice(0, 6).map((item) => {
            const badge = getDueBadge(item.days_until_due);

            return (
              <div key={`${item.kind}-${item.id}`} className="rounded-xl border border-gray-200 p-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                        {DueSoonKindLabels[item.kind]}
                      </span>
                      <Link to={item.detail_path} className="text-sm font-semibold text-blue-600 hover:text-blue-800 hover:underline">
                        #{item.id}
                      </Link>
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${badge.className}`}>
                        {badge.label}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-gray-900 mt-2">{item.customer_or_source_name}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      Đến hạn: {formatDateForDisplay(new Date(item.due_date))}
                    </p>
                  </div>
                  <div className="text-left md:text-right">
                    <p className="text-sm text-gray-500">{item.display_status}</p>
                    <p className="text-lg font-semibold text-gray-900 mt-1">{formatCurrency(item.total_amount)}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function DueSoonReport() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setMessage('');
      const data = await fetchDueSoonData(7);
      setItems(data);
    } catch (error) {
      console.error('Error fetching due soon report:', error);
      setMessage(`Lỗi tải dữ liệu: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const summary = useMemo(() => getDueSoonSummary(items), [items]);
  const grouped = useMemo(() => groupDueSoonItems(items), [items]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-700"></div>
        <span className="ml-3 text-lg text-gray-600">Đang tải báo cáo sắp tới hạn...</span>
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

  if (items.length === 0) {
    return (
      <div className="bg-white border border-dashed border-gray-300 rounded-3xl p-10 text-center">
        <div className="mx-auto h-16 w-16 rounded-full bg-green-100 flex items-center justify-center text-2xl text-green-700">
          ✓
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mt-4">Không có đơn nào cần xử lý trong 7 ngày tới</h3>
        <p className="text-gray-600 mt-2">
          Hệ thống hiện không có đơn trả khách hay đơn nhập Ancarat nào đang quá hạn hoặc sắp đến hạn.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-800 rounded-3xl p-8 text-white shadow-xl">
        <p className="text-sm uppercase tracking-[0.2em] text-slate-300">Due Tracking</p>
        <h2 className="text-3xl font-semibold mt-2">Báo cáo sắp tới hạn giao/trả</h2>
        <p className="text-slate-300 mt-3 max-w-3xl">
          Tập trung các đơn hàng sắp tới hạn trả khách và các đơn nhập Ancarat sắp tới ngày lấy trong 7 ngày tới, kèm cả những đơn đã quá hạn.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
          <p className="text-sm text-gray-500">Tổng việc cần theo dõi</p>
          <p className="text-3xl font-semibold text-gray-900 mt-2">{summary.total}</p>
        </div>
        <div className="bg-white rounded-2xl border border-red-200 p-5 shadow-sm">
          <p className="text-sm text-red-600">Quá hạn</p>
          <p className="text-3xl font-semibold text-red-700 mt-2">{summary.overdue}</p>
        </div>
        <div className="bg-white rounded-2xl border border-amber-200 p-5 shadow-sm">
          <p className="text-sm text-amber-600">Trong 3 ngày tới</p>
          <p className="text-3xl font-semibold text-amber-700 mt-2">{summary.next3Days}</p>
        </div>
        <div className="bg-white rounded-2xl border border-sky-200 p-5 shadow-sm">
          <p className="text-sm text-sky-600">Trong 7 ngày tới</p>
          <p className="text-3xl font-semibold text-sky-700 mt-2">{summary.next7Days}</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
          <p className="text-sm text-gray-500">Order / Import</p>
          <p className="text-2xl font-semibold text-gray-900 mt-2">{summary.orders} / {summary.importOrders}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <DueSoonList title="Đơn quá hạn" items={grouped.overdue} />
        <DueSoonList title="Đơn sắp tới hạn" items={grouped.upcoming} />
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="px-6 py-5 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Chi tiết tất cả đơn cần theo dõi</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Loại</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Khách/Nguồn</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ngày đến hạn</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Còn lại</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Giá trị</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {items.map((item) => {
                const badge = getDueBadge(item.days_until_due);

                return (
                  <tr key={`${item.kind}-${item.id}`} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {DueSoonKindLabels[item.kind]}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <Link to={item.detail_path} className="font-semibold text-blue-600 hover:text-blue-800 hover:underline">
                        #{item.id}
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {item.customer_or_source_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {formatDateForDisplay(new Date(item.due_date))}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${badge.className}`}>
                        {badge.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {item.display_status}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                      {formatCurrency(item.total_amount)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default DueSoonReport;
