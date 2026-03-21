import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';
import Loading from '../../components/Loading';
import PageHeader from '../../components/PageHeader';
import {
  Tables,
  OrderFields,
  OrderStatus,
  OrderType,
  OrderSelectWithItems,
  OrderResaleFields,
  createOrderResaleFormFromOrder,
  calculateOrderResaleTotal,
  buildOrderResaleInsertPayload,
  buildOrderResaleItemsPayload,
  updateOrderResaleItemSubtotal,
  formatCurrency,
} from '../../models';

const isOrderEligibleForResale = (order, resaleExists) => {
  if (!order || resaleExists) return false;
  const today = new Date().toISOString().split('T')[0];

  return (
    order[OrderFields.ORDER_TYPE] === OrderType.ORDER &&
    order[OrderFields.STATUS] !== OrderStatus.RECEIVED &&
    order[OrderFields.STATUS] !== OrderStatus.RESOLD_TO_STORE &&
    order[OrderFields.EXPECTED_DELIVERY_DATE] >= today
  );
};

function CreateOrderResale() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const { addNotification } = useNotification();
  const orderId = searchParams.get('orderId');

  const [order, setOrder] = useState(null);
  const [orderResaleForm, setOrderResaleForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId) {
        addNotification('Thiếu mã đơn hàng để tạo giao dịch bán lại', 'error');
        navigate('/order-resales');
        return;
      }

      try {
        setLoading(true);

        const { data: orderData, error: orderError } = await supabase
          .from(Tables.ORDERS)
          .select(OrderSelectWithItems)
          .eq(OrderFields.ID, orderId)
          .single();

        if (orderError) throw orderError;

        const { data: resaleData, error: resaleError } = await supabase
          .from(Tables.ORDER_RESALES)
          .select(`${OrderResaleFields.ID}, ${OrderResaleFields.ORDER_ID}`)
          .eq(OrderResaleFields.ORDER_ID, orderId)
          .maybeSingle();

        if (resaleError) throw resaleError;

        setOrder(orderData);
        if (!isOrderEligibleForResale(orderData, resaleData)) {
          addNotification('Đơn hàng này không đủ điều kiện để bán cho cửa hàng', 'warning');
          navigate(`/orders/${orderId}`);
          return;
        }

        setOrderResaleForm(createOrderResaleFormFromOrder(orderData, user?.email || 'Admin'));
      } catch (error) {
        console.error('Error fetching order for resale:', error);
        addNotification(`Lỗi tải dữ liệu đơn hàng: ${error.message}`, 'error');
        navigate('/order-resales');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [addNotification, navigate, orderId, user?.email]);

  const totalAmount = useMemo(
    () => calculateOrderResaleTotal(orderResaleForm?.items || []),
    [orderResaleForm],
  );

  const updateItemPrice = (index, value) => {
    setOrderResaleForm((prev) => {
      const items = [...prev.items];
      items[index] = updateOrderResaleItemSubtotal(items[index], value);
      return { ...prev, items };
    });
  };

  const handleChange = (field, value) => {
    setOrderResaleForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!orderResaleForm.bankName.trim() || !orderResaleForm.bankAccountNumber.trim() || !orderResaleForm.bankAccountHolder.trim()) {
      addNotification('Vui lòng nhập đầy đủ thông tin ngân hàng', 'error');
      return;
    }

    if (orderResaleForm.items.some((item) => item.resalePrice < 0)) {
      addNotification('Giá bán lại không được âm', 'error');
      return;
    }

    let createdResaleId = null;

    try {
      setSubmitting(true);
      const payload = buildOrderResaleInsertPayload(orderResaleForm, totalAmount, user?.email || 'Admin');

      const { data: createdResale, error: resaleError } = await supabase
        .from(Tables.ORDER_RESALES)
        .insert([payload])
        .select()
        .single();

      if (resaleError) throw resaleError;
      createdResaleId = createdResale.id;

      const resaleItemsPayload = buildOrderResaleItemsPayload(orderResaleForm.items, createdResale.id);
      const { error: itemsError } = await supabase
        .from(Tables.ORDER_RESALE_ITEMS)
        .insert(resaleItemsPayload);

      if (itemsError) throw itemsError;

      const { error: orderUpdateError } = await supabase
        .from(Tables.ORDERS)
        .update({ [OrderFields.STATUS]: OrderStatus.RESOLD_TO_STORE })
        .eq(OrderFields.ID, orderId);

      if (orderUpdateError) throw orderUpdateError;

      addNotification('Tạo giao dịch bán lại cho cửa hàng thành công', 'success');
      navigate(`/order-resales/${createdResale.id}`);
    } catch (error) {
      console.error('Error creating order resale:', error);

      if (createdResaleId) {
        await supabase
          .from(Tables.ORDER_RESALES)
          .delete()
          .eq(OrderResaleFields.ID, createdResaleId);
      }

      addNotification(`Lỗi tạo giao dịch bán lại: ${error.message}`, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !orderResaleForm) {
    return <Loading type="page" message="Đang chuẩn bị giao dịch bán lại..." />;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      <PageHeader
        title={`Bán đơn #${order.id} cho cửa hàng`}
        subtitle="Giữ nguyên toàn bộ sản phẩm, chỉ điều chỉnh giá bán lại và lưu thông tin chuyển tiền."
        backTo={`/orders/${order.id}`}
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Thông tin giao dịch</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Ngày bán lại</label>
              <input
                type="date"
                value={orderResaleForm.resaleDate}
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Ngày dự kiến chuyển tiền</label>
              <input
                type="date"
                value={orderResaleForm.expectedPaymentDate}
                onChange={(e) => handleChange('expectedPaymentDate', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tên khách hàng</label>
              <input
                type="text"
                value={orderResaleForm.customerName}
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Số điện thoại</label>
              <input
                type="text"
                value={orderResaleForm.customerPhone}
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Thông tin ngân hàng nhận tiền</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Ngân hàng</label>
              <input
                type="text"
                value={orderResaleForm.bankName}
                onChange={(e) => handleChange('bankName', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ví dụ: Vietcombank"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Số tài khoản</label>
              <input
                type="text"
                value={orderResaleForm.bankAccountNumber}
                onChange={(e) => handleChange('bankAccountNumber', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Chủ tài khoản</label>
              <input
                type="text"
                value={orderResaleForm.bankAccountHolder}
                onChange={(e) => handleChange('bankAccountHolder', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Sản phẩm bán lại</h2>
              <p className="text-sm text-gray-500 mt-1">Tất cả sản phẩm từ đơn gốc được giữ nguyên, chỉ cho chỉnh giá bán lại.</p>
            </div>
            <Link to={`/orders/${order.id}`} className="text-sm text-blue-600 hover:text-blue-800">
              Xem đơn gốc
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sản phẩm</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Số lượng</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Giá bán lại</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Thành tiền</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {orderResaleForm.items.map((item, index) => (
                  <tr key={item.orderItemId}>
                    <td className="px-4 py-3">
                      <div className="flex items-center">
                        {item.productImageUrl && (
                          <img
                            src={item.productImageUrl}
                            alt={item.productName}
                            className="w-12 h-12 object-cover rounded-lg mr-3"
                          />
                        )}
                        <div>
                          <div className="font-medium text-gray-900">{item.productName}</div>
                          <div className="text-sm text-gray-500">SKU: {item.productSku || 'N/A'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <input
                        type="number"
                        value={item.quantity}
                        disabled
                        className="w-20 px-2 py-1 text-center border border-gray-300 rounded bg-gray-50"
                      />
                    </td>
                    <td className="px-4 py-3 text-center">
                      <input
                        type="number"
                        min="0"
                        value={item.resalePrice}
                        onChange={(e) => updateItemPrice(index, parseFloat(e.target.value) || 0)}
                        className="w-36 px-2 py-1 text-center border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-4 py-3 text-right font-medium">{formatCurrency(item.subtotal)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-50">
                <tr>
                  <td colSpan="3" className="px-4 py-3 text-right font-semibold text-gray-900">Tổng cộng</td>
                  <td className="px-4 py-3 text-right font-bold text-lg text-gray-900">{formatCurrency(totalAmount)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        <div className="flex justify-end space-x-4">
          <Link
            to={`/orders/${order.id}`}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            Hủy
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {submitting ? 'Đang lưu...' : 'Tạo giao dịch bán lại'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default CreateOrderResale;
