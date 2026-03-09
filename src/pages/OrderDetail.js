import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useReactToPrint } from 'react-to-print';
import { supabase } from '../lib/supabase';
import { useNotification } from '../contexts/NotificationContext';
import PrintOrder from '../components/PrintOrder';
import Loading from '../components/Loading';

function OrderDetail() {
  const { id } = useParams();
  const { addNotification } = useNotification();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusLoading, setStatusLoading] = useState(false);
  const printRef = useRef(null);

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Phieu-dat-hang-${id}`,
  });

  useEffect(() => {
    // Fetch order detail from database
    const fetchOrderDetail = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('orders')
          .select(`
            *,
            order_items (
              id,
              quantity,
              selling_price,
              products (
                id,
                name,
                sku,
                image_url
              )
            )
          `)
          .eq('id', id)
          .single();

        if (error) {
          if (error.code === 'PGRST116') {
            addNotification('Không tìm thấy đơn hàng', 'error');
          } else {
            throw error;
          }
        } else {
          setOrder(data);
        }
      } catch (error) {
        console.error('Error fetching order detail:', error);
        addNotification(`Lỗi tải đơn hàng: ${error.message}`, 'error');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchOrderDetail();
    }
  }, [id,addNotification]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const updateOrderStatus = async (newStatus) => {
    try {
      setStatusLoading(true);
      
      // Prepare update data
      const updateData = { status: newStatus };
      
      // If changing to 'received', the trigger will automatically set date_received
      // If changing from 'received', the trigger will clear date_received
      
      const { data, error } = await supabase
        .from('orders')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      
      // Update the local order state
      setOrder(prev => ({ ...prev, ...data }));
      
      if (newStatus === 'received') {
        addNotification('Đã cập nhật trạng thái đơn hàng thành "Đã nhận hàng" thành công!', 'success');
      } else {
        const statusText = newStatus === 'customer_holds' ? 'Khách giữ phiếu' : 'Cửa hàng giữ phiếu';
        addNotification(`Đã cập nhật trạng thái đơn hàng thành "${statusText}" thành công!`, 'success');
      }
      
    } catch (error) {
      console.error('Error updating order status:', error);
      addNotification(`Lỗi cập nhật trạng thái: ${error.message}`, 'error');
    } finally {
      setStatusLoading(false);
    }
  };

  const getStatusDisplay = (status) => {
    switch (status) {
      case 'received': return 'Đã nhận hàng';
      case 'customer_holds': return 'Khách giữ phiếu';
      case 'store_holds': return 'Cửa hàng giữ phiếu';
      default: return 'Cửa hàng giữ phiếu';
    }
  };

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'received': return 'bg-green-100 text-green-800';
      case 'customer_holds': return 'bg-yellow-100 text-yellow-800';
      case 'store_holds': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return <Loading type="page" message="Đang tải chi tiết đơn hàng..." />;
  }

  if (!order) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-center h-64">
          <div className="text-lg text-red-600 mb-4">Không tìm thấy đơn hàng</div>
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
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <Link
            to="/orders"
            className="text-gray-500 hover:text-gray-700"
          >
            ← Quay lại
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Chi tiết đơn hàng #{order.id}</h1>
        </div>
        <div className="flex space-x-2">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            order.payment_method === 'bank' 
              ? 'bg-blue-100 text-blue-800' 
              : 'bg-green-100 text-green-800'
          }`}>
            {order.payment_method === 'bank' ? 'Chuyển khoản' : 'Tiền mặt'}
          </span>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeColor(order.status || 'store_holds')}`}>
            {getStatusDisplay(order.status || 'store_holds')}
          </span>
          <button
            onClick={handlePrint}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center"
          >
            🖨️ In phiếu
          </button>
        </div>
      </div>

      {/* Customer Information */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Thông tin khách hàng</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="flex mb-2">
              <span className="font-medium min-w-32">CMND/CCCD:</span>
              <span>{order.customer_id_number}</span>
            </div>
            <div className="flex mb-2">
              <span className="font-medium min-w-32">Họ và tên:</span>
              <span>{order.customer_name}</span>
            </div>
            <div className="flex mb-2">
              <span className="font-medium min-w-32">Số điện thoại:</span>
              <span>{order.customer_phone}</span>
            </div>
          </div>
          <div>
            {order.customer_id_issued_date && (
              <div className="flex mb-2">
                <span className="font-medium min-w-32">Ngày cấp:</span>
                <span>{new Date(order.customer_id_issued_date).toLocaleDateString('vi-VN')}</span>
              </div>
            )}
            <div className="flex mb-2">
              <span className="font-medium min-w-32">Địa chỉ:</span>
              <span>{order.customer_address}</span>
            </div>
            <div className="flex mb-2">
              <span className="font-medium min-w-32">Ngày giao hàng dự kiến:</span>
              <span>{new Date(order.expected_delivery_date).toLocaleDateString('vi-VN')}</span>
            </div>
            {order.date_received && (
              <div className="flex mb-2">
                <span className="font-medium min-w-32">Ngày đã nhận thực tế:</span>
                <span className="text-green-600 font-semibold">{new Date(order.date_received).toLocaleDateString('vi-VN')}</span>
              </div>
            )}
          </div>
        </div>
        
        {/* Order Status Management */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Trạng thái đơn hàng</h3>
              <p className="text-sm text-gray-600">
                Trạng thái hiện tại: <span className="font-medium">{getStatusDisplay(order.status || 'store_holds')}</span>
                {order.status === 'received' && (
                  <span className="ml-2 text-green-600">(Không thể thay đổi)</span>
                )}
              </p>
            </div>
            
            {/* Status Update Dropdown */}
            {order.status !== 'received' && (
              <div className="flex items-center space-x-4">
                <label htmlFor="status-select" className="text-sm font-medium text-gray-700">
                  Cập nhật trạng thái:
                </label>
                <select
                  id="status-select"
                  value={order.status || 'store_holds'}
                  onChange={(e) => updateOrderStatus(e.target.value)}
                  disabled={statusLoading}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  <option value="store_holds">Cửa hàng giữ phiếu</option>
                  <option value="customer_holds">Khách giữ phiếu</option>
                  <option value="received">Đã nhận hàng</option>
                </select>
                {statusLoading && (
                  <div className="text-sm text-gray-600">Đang cập nhật...</div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Order Items */}
      {order.order_items && order.order_items.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Danh sách sản phẩm</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">STT</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tên sản phẩm</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SKU</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SL</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Đơn giá</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thành tiền</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {order.order_items.map((item, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-center">{index + 1}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {item.products?.image_url && (
                          <img
                            src={item.products.image_url}
                            alt={item.products?.name}
                            className="w-12 h-12 object-cover rounded-lg mr-3"
                          />
                        )}
                        <div className="text-sm font-medium">
                          {item.products?.name || 'Sản phẩm không xác định'}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900">{item.products?.sku || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900">{item.quantity}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">{formatCurrency(item.selling_price)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-semibold text-gray-900">{formatCurrency(item.quantity * item.selling_price)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Order Summary */}
          <div className="mt-6 flex justify-end">
            <div className="w-full max-w-md">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-gray-600">Số loại sản phẩm:</span>
                  <span className="text-sm font-medium">{order.order_items.length}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-gray-600">Tổng số lượng:</span>
                  <span className="text-sm font-medium">{order.order_items.reduce((sum, item) => sum + item.quantity, 0)}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-gray-600">Phương thức thanh toán:</span>
                  <span className="text-sm font-medium">{order.payment_method === 'bank' ? 'Chuyển khoản' : 'Tiền mặt'}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-gray-200">
                  <span className="text-lg font-semibold text-gray-900">TỔNG CỘNG:</span>
                  <span className="text-lg font-bold text-gray-900">{formatCurrency(order.total_amount)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hidden Print Template */}
      <div style={{ display: 'none' }}>
        <PrintOrder ref={printRef} order={order} />
      </div>
    </div>
  );
}

export default OrderDetail;