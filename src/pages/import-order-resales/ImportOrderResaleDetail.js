import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useNotification } from '../../contexts/NotificationContext';
import Loading from '../../components/Loading';
import PageHeader from '../../components/PageHeader';
import StatusBadge from '../../components/StatusBadge';
import {
  Tables,
  ImportOrderResaleFields,
  ImportOrderResaleStatus,
  ImportOrderResaleSelectWithItems,
  getImportOrderResaleStatusBadgeColor,
  getImportOrderResaleStatusDisplay,
  formatCurrency,
  formatDate,
  formatDateTime,
} from '../../models';

function ImportOrderResaleDetail() {
  const { id } = useParams();
  const { addNotification } = useNotification();
  const [importOrderResale, setImportOrderResale] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from(Tables.IMPORT_ORDER_RESALES)
          .select(ImportOrderResaleSelectWithItems)
          .eq(ImportOrderResaleFields.ID, id)
          .single();

        if (error) throw error;
        setImportOrderResale(data);
      } catch (error) {
        console.error('Error fetching import order resale detail:', error);
        addNotification(`Lỗi tải giao dịch bán lại: ${error.message}`, 'error');
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchDetail();
  }, [addNotification, id]);

  const markAsReceived = async () => {
    try {
      setUpdating(true);
      const receivedAt = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase
        .from(Tables.IMPORT_ORDER_RESALES)
        .update({
          [ImportOrderResaleFields.STATUS]: ImportOrderResaleStatus.RECEIVED,
          [ImportOrderResaleFields.RECEIVED_AT]: receivedAt,
        })
        .eq(ImportOrderResaleFields.ID, id)
        .eq(ImportOrderResaleFields.STATUS, ImportOrderResaleStatus.PENDING_RECEIPT)
        .select()
        .single();

      if (error) throw error;
      setImportOrderResale((prev) => ({ ...prev, ...data }));
      addNotification('Đã cập nhật trạng thái nhận tiền thành công', 'success');
    } catch (error) {
      console.error('Error updating import resale status:', error);
      addNotification(`Lỗi cập nhật trạng thái: ${error.message}`, 'error');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return <Loading type="page" message="Đang tải giao dịch bán lại Ancarat..." />;
  }

  if (!importOrderResale) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <div className="text-lg text-red-600 mb-4">Không tìm thấy giao dịch bán lại</div>
          <Link to="/import-order-resales" className="text-blue-600 hover:text-blue-800">
            ← Quay lại danh sách giao dịch
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      <PageHeader
        title={`Bán lại Ancarat #${importOrderResale.id}`}
        subtitle={`Đơn nhập gốc #${importOrderResale.import_order_id}`}
        backTo="/import-order-resales"
        actions={
          importOrderResale.status === ImportOrderResaleStatus.PENDING_RECEIPT ? (
            <button
              onClick={markAsReceived}
              disabled={updating}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              {updating ? 'Đang cập nhật...' : 'Đánh dấu đã nhận tiền'}
            </button>
          ) : null
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Thông tin giao dịch</h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="font-medium text-gray-600">Trạng thái</span>
              <StatusBadge color={getImportOrderResaleStatusBadgeColor(importOrderResale.status)}>
                {getImportOrderResaleStatusDisplay(importOrderResale.status)}
              </StatusBadge>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-gray-600">Ngày bán lại</span>
              <span>{formatDate(importOrderResale.resale_date)}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-gray-600">Ngày dự kiến nhận tiền</span>
              <span>{formatDate(importOrderResale.expected_received_date)}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-gray-600">Ngày đã nhận tiền</span>
              <span>{formatDate(importOrderResale.received_at)}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-gray-600">Người tạo</span>
              <span>{importOrderResale.created_by || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-gray-600">Thời điểm tạo</span>
              <span>{formatDateTime(importOrderResale.created_at)}</span>
            </div>
            <div className="pt-3 border-t border-gray-200 flex justify-between text-base">
              <span className="font-semibold text-gray-900">Tổng tiền</span>
              <span className="font-bold text-gray-900">{formatCurrency(importOrderResale.total_amount)}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Thông tin Ancarat</h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="font-medium text-gray-600">Số hóa đơn</span>
              <span>{importOrderResale.ancarat_invoice_number || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-gray-600">Thu ngân</span>
              <span>{importOrderResale.ancarat_cashier_name || 'N/A'}</span>
            </div>
            <div className="pt-3 border-t border-gray-200">
              <Link to={`/imports/${importOrderResale.import_order_id}`} className="text-blue-600 hover:text-blue-800">
                Xem đơn nhập gốc #{importOrderResale.import_order_id}
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Chi tiết sản phẩm</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sản phẩm</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">SL</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Giá bán lại</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Thành tiền</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {(importOrderResale.import_order_resale_items || []).map((item) => (
                <tr key={item.id}>
                  <td className="px-4 py-3">
                    <div className="flex items-center">
                      {item.products?.image_url && (
                        <img src={item.products.image_url} alt={item.products?.name} className="w-12 h-12 object-cover rounded-lg mr-3" />
                      )}
                      <div>
                        <div className="font-medium text-gray-900">{item.products?.name || 'Sản phẩm không xác định'}</div>
                        <div className="text-sm text-gray-500">SKU: {item.products?.sku || 'N/A'}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">{item.quantity}</td>
                  <td className="px-4 py-3 text-right">{formatCurrency(item.resale_price)}</td>
                  <td className="px-4 py-3 text-right font-medium">{formatCurrency(item.quantity * item.resale_price)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default ImportOrderResaleDetail;
