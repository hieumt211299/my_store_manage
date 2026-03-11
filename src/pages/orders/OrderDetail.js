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
  OrderSelectWithItems,
  getStatusDisplay,
} from '../../models';

function OrderDetail() {
  const { id } = useParams();
  const { addNotification } = useNotification();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [fetchError, setFetchError] = useState(null);
  const [statusLoading, setStatusLoading] = useState(false);
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
          <button
            onClick={handlePrint}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center"
          >
            🖨️ In phiếu
          </button>
        }
      />

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
