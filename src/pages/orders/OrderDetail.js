import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useReactToPrint } from 'react-to-print';
import { supabase } from '../../lib/supabase';
import { useNotification } from '../../contexts/NotificationContext';
import PrintOrder from '../../components/PrintOrder';
import Loading from '../../components/Loading';
import PageHeader from '../../components/PageHeader';
import CustomerInfoCard from './components/CustomerInfoCard';
import OrderStatusSection from './components/OrderStatusSection';
import OrderItemsDetail from './components/OrderItemsDetail';
import {
  Tables,
  OrderFields,
  OrderStatus,
  OrderType,
  OrderResaleFields,
  OrderSelectWithItems,
  getStatusDisplay,
  formatDate,
} from '../../models';

function OrderDetail() {
  const { id } = useParams();
  const { addNotification } = useNotification();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [fetchError, setFetchError] = useState(null);
  const [statusLoading, setStatusLoading] = useState(false);
  const [orderResale, setOrderResale] = useState(null);
  const printRef = useRef(null);

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Phieu-dat-hang-${id}`,
  });

  useEffect(() => {
    const fetchOrderDetail = async () => {
      try {
        setLoading(true);
        setNotFound(false);
        setFetchError(null);
        const { data, error } = await supabase
          .from(Tables.ORDERS)
          .select(OrderSelectWithItems)
          .eq(OrderFields.ID, id)
          .single();

        if (error) {
          if (error.code === 'PGRST116') {
            setNotFound(true);
            setFetchError(null);
            addNotification('Không tìm thấy đơn hàng', 'error');
          } else {
            throw error;
          }
        } else {
          setOrder(data);

          const { data: resaleData, error: resaleError } = await supabase
            .from(Tables.ORDER_RESALES)
            .select(`${OrderResaleFields.ID}, ${OrderResaleFields.STATUS}, ${OrderResaleFields.EXPECTED_PAYMENT_DATE}`)
            .eq(OrderResaleFields.ORDER_ID, id)
            .maybeSingle();

          if (resaleError) throw resaleError;
          setOrderResale(resaleData);
        }
      } catch (error) {
        console.error('Error fetching order detail:', error);
        setFetchError(error.message);
        setNotFound(false);
        addNotification(`Lỗi tải đơn hàng: ${error.message}`, 'error');
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchOrderDetail();
  }, [id, addNotification]);

  const updateOrderStatus = async (newStatus) => {
    try {
      setStatusLoading(true);
      const updateData = { [OrderFields.STATUS]: newStatus };

      const { data, error } = await supabase
        .from(Tables.ORDERS)
        .update(updateData)
        .eq(OrderFields.ID, id)
        .select()
        .single();

      if (error) throw error;
      setOrder(prev => ({ ...prev, ...data }));

      if (newStatus === OrderStatus.RECEIVED) {
        addNotification('Đã cập nhật trạng thái đơn hàng thành "Đã nhận hàng" thành công!', 'success');
      } else {
        const statusText = getStatusDisplay(newStatus);
        addNotification(`Đã cập nhật trạng thái đơn hàng thành "${statusText}" thành công!`, 'success');
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      addNotification(`Lỗi cập nhật trạng thái: ${error.message}`, 'error');
    } finally {
      setStatusLoading(false);
    }
  };

  const today = new Date().toISOString().split('T')[0];
  const canCreateResale =
    order?.[OrderFields.ORDER_TYPE] === OrderType.ORDER &&
    order?.[OrderFields.STATUS] !== OrderStatus.RECEIVED &&
    order?.[OrderFields.STATUS] !== OrderStatus.RESOLD_TO_STORE &&
    order?.[OrderFields.EXPECTED_DELIVERY_DATE] >= today &&
    !orderResale;

  if (loading) {
    return <Loading type="page" message="Đang tải chi tiết đơn hàng..." />;
  }

  if (!order) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-center h-64">
          {fetchError ? (
            <>
              <div className="text-lg text-red-600 mb-2">Lỗi tải đơn hàng</div>
              <div className="text-sm text-gray-500 mb-4">{fetchError}</div>
            </>
          ) : notFound ? (
            <div className="text-lg text-red-600 mb-4">Không tìm thấy đơn hàng</div>
          ) : null}
          <Link
            to="/orders"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            ← Quay lại danh sách đơn hàng
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <PageHeader
        title={`Chi tiết đơn hàng #${order.id}`}
        backTo="/orders"
        actions={
          <>
            {canCreateResale && (
              <Link
                to={`/order-resales/create?orderId=${order.id}`}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Bán cho cửa hàng
              </Link>
            )}
            {orderResale && (
              <Link
                to={`/order-resales/${orderResale.id}`}
                className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
              >
                Xem giao dịch bán lại
              </Link>
            )}
            <button
              onClick={handlePrint}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center"
            >
              🖨️ In phiếu
            </button>
          </>
        }
      />

      {orderResale && (
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div>
              <div className="font-semibold text-purple-900">Đơn hàng này đã được bán lại cho cửa hàng</div>
              <div className="text-sm text-purple-700 mt-1">
                Giao dịch #{orderResale.id} với ngày dự kiến chuyển tiền {formatDate(orderResale.expected_payment_date)}.
              </div>
            </div>
            <Link to={`/order-resales/${orderResale.id}`} className="text-sm font-medium text-purple-700 hover:text-purple-900">
              Mở chi tiết giao dịch
            </Link>
          </div>
        </div>
      )}

      {/* Customer Info + Status */}
      <CustomerInfoCard order={order}>
        <OrderStatusSection
          order={order}
          statusLoading={statusLoading}
          onUpdateStatus={updateOrderStatus}
        />
      </CustomerInfoCard>

      {/* Order Items */}
      <OrderItemsDetail order={order} />

      {/* Hidden Print Template */}
      <div style={{ display: 'none' }}>
        <PrintOrder ref={printRef} order={order} />
      </div>
    </div>
  );
}

export default OrderDetail;
