import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useNotification } from '../../contexts/NotificationContext';
import Loading from '../../components/Loading';
import PageHeader from '../../components/PageHeader';
import StatusBadge from '../../components/StatusBadge';
import {
  Tables,
  OrderResaleFields,
  OrderResaleStatus,
  OrderResaleSelectWithItems,
  getOrderResaleStatusBadgeColor,
  getOrderResaleStatusDisplay,
  formatCurrency,
  formatDate,
  formatDateTime,
} from '../../models';

function OrderResaleDetail() {
  const { id } = useParams();
  const { addNotification } = useNotification();
  const [orderResale, setOrderResale] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const fetchOrderResale = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from(Tables.ORDER_RESALES)
          .select(OrderResaleSelectWithItems)
          .eq(OrderResaleFields.ID, id)
          .single();

        if (error) throw error;
        setOrderResale(data);
      } catch (error) {
        console.error('Error fetching order resale detail:', error);
        addNotification(`Lỗi tải giao dịch bán lại: ${error.message}`, 'error');
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchOrderResale();
  }, [addNotification, id]);

  const markAsPaid = async () => {
    try {
      setUpdating(true);
      const paidAt = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase
        .from(Tables.ORDER_RESALES)
        .update({
          [OrderResaleFields.STATUS]: OrderResaleStatus.PAID,
          [OrderResaleFields.PAID_AT]: paidAt,
        })
        .eq(OrderResaleFields.ID, id)
        .eq(OrderResaleFields.STATUS, OrderResaleStatus.PENDING_PAYMENT)
        .select()
        .single();

      if (error) throw error;
      setOrderResale((prev) => ({ ...prev, ...data }));
      addNotification('Đã cập nhật trạng thái chuyển tiền thành công', 'success');
    } catch (error) {
      console.error('Error updating order resale status:', error);
      addNotification(`Lỗi cập nhật trạng thái: ${error.message}`, 'error');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return <Loading type="page" message="Đang tải giao dịch bán lại..." />;
  }

  if (!orderResale) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <div className="text-lg text-red-600 mb-4">Không tìm thấy giao dịch bán lại</div>
          <Link to="/order-resales" className="text-blue-600 hover:text-blue-800">
            ← Quay lại danh sách giao dịch
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      <PageHeader
        title={`Giao dịch bán lại #${orderResale.id}`}
        subtitle={`Đơn gốc #${orderResale.order_id}`}
        backTo="/order-resales"
        actions={
          orderResale.status === OrderResaleStatus.PENDING_PAYMENT ? (
            <button
              onClick={markAsPaid}
              disabled={updating}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              {updating ? 'Đang cập nhật...' : 'Đánh dấu đã chuyển tiền'}
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
              <StatusBadge color={getOrderResaleStatusBadgeColor(orderResale.status)}>
                {getOrderResaleStatusDisplay(orderResale.status)}
              </StatusBadge>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-gray-600">Ngày bán lại</span>
              <span>{formatDate(orderResale.resale_date)}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-gray-600">Ngày dự kiến chuyển tiền</span>
              <span>{formatDate(orderResale.expected_payment_date)}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-gray-600">Ngày đã chuyển tiền</span>
              <span>{formatDate(orderResale.paid_at)}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-gray-600">Người tạo</span>
              <span>{orderResale.created_by || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-gray-600">Thời điểm tạo</span>
              <span>{formatDateTime(orderResale.created_at)}</span>
            </div>
            <div className="pt-3 border-t border-gray-200 flex justify-between text-base">
              <span className="font-semibold text-gray-900">Tổng tiền</span>
              <span className="font-bold text-gray-900">{formatCurrency(orderResale.total_amount)}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Thông tin nhận tiền</h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="font-medium text-gray-600">Khách hàng</span>
              <span>{orderResale.customer_name}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-gray-600">Số điện thoại</span>
              <span>{orderResale.customer_phone}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-gray-600">CMND/CCCD</span>
              <span>{orderResale.customer_id_number}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-gray-600">Ngân hàng</span>
              <span>{orderResale.bank_name}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-gray-600">Số tài khoản</span>
              <span>{orderResale.bank_account_number}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-gray-600">Chủ tài khoản</span>
              <span>{orderResale.bank_account_holder}</span>
            </div>
            <div className="pt-3 border-t border-gray-200">
              <Link to={`/orders/${orderResale.order_id}`} className="text-blue-600 hover:text-blue-800">
                Xem đơn gốc #{orderResale.order_id}
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
              {(orderResale.order_resale_items || []).map((item) => (
                <tr key={item.id}>
                  <td className="px-4 py-3">
                    <div className="flex items-center">
                      {item.products?.image_url && (
                        <img
                          src={item.products.image_url}
                          alt={item.products?.name}
                          className="w-12 h-12 object-cover rounded-lg mr-3"
                        />
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

export default OrderResaleDetail;
