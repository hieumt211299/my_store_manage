import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

function CreateOrder() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [showProductDialog, setShowProductDialog] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state for creating orders
  const getDefaultReceiveDate = () => {
    const date = new Date();
    date.setDate(date.getDate() + 90);
    return date.toISOString().split('T')[0];
  };

  const [orderForm, setOrderForm] = useState({
    createDate: new Date().toISOString().split('T')[0],
    receiveDate: getDefaultReceiveDate(),
    paymentMethod: 'bank',
    customer: {
      idNumber: '',
      name: '',
      phone: '',
      idIssuedDate: '',
      address: ''
    },
    items: []
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  // Fetch products for selection
  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('name');

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      setMessage(`Lỗi tải sản phẩm: ${error.message}`);
    }
  };

  // Add selected products to order
  const addSelectedProductsToOrder = () => {
    if (selectedProducts.length === 0) {
      setMessage('Vui lòng chọn ít nhất một sản phẩm');
      return;
    }

    const newItems = selectedProducts.map(productId => {
      const product = products.find(p => p.id === parseInt(productId));
      return {
        productId: product.id,
        productName: product.name,
        productSku: product.sku,
        quantity: 1,
        sellingPrice: 0,
        subtotal: 0
      };
    });

    setOrderForm({
      ...orderForm,
      items: [...orderForm.items, ...newItems]
    });

    setSelectedProducts([]);
    setShowProductDialog(false);
    setMessage('');
  };

  // Update item quantity or price
  const updateOrderItem = (index, field, value) => {
    const updatedItems = [...orderForm.items];
    updatedItems[index][field] = value;
    
    // Recalculate subtotal
    updatedItems[index].subtotal = updatedItems[index].quantity * updatedItems[index].sellingPrice;
    
    setOrderForm({ ...orderForm, items: updatedItems });
  };

  // Remove item from order
  const removeItemFromOrder = (index) => {
    const updatedItems = orderForm.items.filter((_, i) => i !== index);
    setOrderForm({ ...orderForm, items: updatedItems });
  };

  // Calculate total amount
  const calculateTotal = () => {
    return orderForm.items.reduce((total, item) => total + item.subtotal, 0);
  };

  // Create new order
  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    
    const { customer } = orderForm;
    if (!customer.idNumber || !customer.name || !customer.phone || !customer.address) {
      setMessage('Vui lòng điền đầy đủ thông tin khách hàng');
      return;
    }

    if (orderForm.items.length === 0) {
      setMessage('Vui lòng thêm ít nhất một sản phẩm');
      return;
    }

    if (!orderForm.receiveDate) {
      setMessage('Vui lòng chọn ngày nhận hàng');
      return;
    }

    try {
      setIsSubmitting(true);
      const totalAmount = calculateTotal();

      // Create order
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert([
          {
            created_date: orderForm.createDate,
            customer_id_number: customer.idNumber,
            customer_name: customer.name,
            customer_phone: customer.phone,
            customer_id_issued_date: customer.idIssuedDate || null,
            customer_address: customer.address,
            total_amount: totalAmount,
            receive_date: orderForm.receiveDate,
            payment_method: orderForm.paymentMethod
          }
        ])
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items
      const orderItems = orderForm.items.map(item => ({
        order_id: orderData.id,
        product_id: item.productId,
        quantity: item.quantity,
        selling_price: item.sellingPrice
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      setMessage('Tạo đơn hàng thành công! Chuyển đến chi tiết đơn hàng...');
      
      setTimeout(() => {
        navigate(`/orders/${orderData.id}`);
      }, 1500);
      
    } catch (error) {
      console.error('Error creating order:', error);
      setMessage(`Lỗi tạo đơn hàng: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const handleCancel = () => {
    if (window.confirm('Bạn có chắc muốn hủy tạo đơn hàng? Tất cả thông tin đã nhập sẽ bị mất.')) {
      navigate('/orders');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tạo đơn hàng mới</h1>
          <p className="text-gray-600 mt-1">Điền thông tin khách hàng và chọn sản phẩm</p>
        </div>
        <button
          onClick={handleCancel}
          className="text-gray-600 hover:text-gray-800 transition-colors"
        >
          ← Quay lại danh sách đơn hàng
        </button>
      </div>

      {/* Message */}
      {message && (
        <div className={`mb-6 p-4 rounded-lg ${
          message.includes('thành công') 
            ? 'bg-green-50 text-green-700 border border-green-200' 
            : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {message}
        </div>
      )}

      {/* Create Order Form */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <form onSubmit={handleSubmitOrder} className="space-y-8">
          
          {/* Order Info */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Thông tin đơn hàng</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ngày tạo *
                </label>
                <input
                  type="date"
                  value={orderForm.createDate}
                  onChange={(e) => setOrderForm({ ...orderForm, createDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ngày nhận hàng *
                </label>
                <input
                  type="date"
                  value={orderForm.receiveDate}
                  onChange={(e) => setOrderForm({ ...orderForm, receiveDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phương thức thanh toán *
                </label>
                <select
                  value={orderForm.paymentMethod}
                  onChange={(e) => setOrderForm({ ...orderForm, paymentMethod: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="bank">Chuyển khoản</option>
                  <option value="cash">Tiền mặt</option>
                </select>
              </div>
            </div>
          </div>

          {/* Customer Info */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Thông tin khách hàng</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Số CMND/CCCD *
                </label>
                <input
                  type="text"
                  value={orderForm.customer.idNumber}
                  onChange={(e) => setOrderForm({
                    ...orderForm,
                    customer: { ...orderForm.customer, idNumber: e.target.value }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Nhập số CMND/CCCD"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Họ tên *
                </label>
                <input
                  type="text"
                  value={orderForm.customer.name}
                  onChange={(e) => setOrderForm({
                    ...orderForm,
                    customer: { ...orderForm.customer, name: e.target.value }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Nhập họ tên khách hàng"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Số điện thoại *
                </label>
                <input
                  type="tel"
                  value={orderForm.customer.phone}
                  onChange={(e) => setOrderForm({
                    ...orderForm,
                    customer: { ...orderForm.customer, phone: e.target.value }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Nhập số điện thoại"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ngày cấp
                </label>
                <input
                  type="date"
                  value={orderForm.customer.idIssuedDate}
                  onChange={(e) => setOrderForm({
                    ...orderForm,
                    customer: { ...orderForm.customer, idIssuedDate: e.target.value }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Địa chỉ *
                </label>
                <input
                  type="text"
                  value={orderForm.customer.address}
                  onChange={(e) => setOrderForm({
                    ...orderForm,
                    customer: { ...orderForm.customer, address: e.target.value }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Nhập địa chỉ khách hàng"
                  required
                />
              </div>
            </div>
          </div>

          {/* Add Products */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Chọn sản phẩm</h2>
              <button
                type="button"
                onClick={() => setShowProductDialog(true)}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                + Chọn sản phẩm
              </button>
            </div>

            {/* Product Selection Dialog */}
            {showProductDialog && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[80vh] overflow-y-auto">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">Chọn sản phẩm</h3>
                    <button
                      onClick={() => {
                        setShowProductDialog(false);
                        setSelectedProducts([]);
                      }}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      ✕
                    </button>
                  </div>
                  
                  <div className="border border-gray-300 rounded-lg overflow-hidden mb-4">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="w-12 px-4 py-2 text-left">
                            <input
                              type="checkbox"
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedProducts(products.map(p => p.id.toString()));
                                } else {
                                  setSelectedProducts([]);
                                }
                              }}
                              checked={selectedProducts.length === products.length && products.length > 0}
                            />
                          </th>
                          <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Hình ảnh</th>
                          <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Sản phẩm</th>
                          <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">SKU</th>
                        </tr>
                      </thead>
                      <tbody>
                        {products.map((product) => {
                          const isSelected = selectedProducts.includes(product.id.toString());
                          const isAlreadyAdded = orderForm.items.some(item => item.productId === product.id);
                          
                          return (
                            <tr key={product.id} className={`border-t ${
                              isAlreadyAdded ? 'bg-gray-100 opacity-50' : isSelected ? 'bg-blue-50' : 'hover:bg-gray-50'
                            }`}>
                              <td className="px-4 py-2">
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  disabled={isAlreadyAdded}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setSelectedProducts([...selectedProducts, product.id.toString()]);
                                    } else {
                                      setSelectedProducts(selectedProducts.filter(id => id !== product.id.toString()));
                                    }
                                  }}
                                />
                              </td>
                              <td className="px-4 py-2">
                                <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center">
                                  {product.image_url ? (
                                    <img 
                                      src={product.image_url} 
                                      alt={product.name}
                                      className="w-full h-full object-cover rounded"
                                    />
                                  ) : (
                                    <span className="text-2xl">📦</span>
                                  )}
                                </div>
                              </td>
                              <td className="px-4 py-2 font-medium">{product.name}</td>
                              <td className="px-4 py-2 text-gray-600">{product.sku}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">
                      Đã chọn: {selectedProducts.length} sản phẩm
                    </span>
                    <div className="space-x-2">
                      <button
                        type="button"
                        onClick={() => {
                          setShowProductDialog(false);
                          setSelectedProducts([]);
                        }}
                        className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                      >
                        Hủy
                      </button>
                      <button
                        type="button"
                        onClick={addSelectedProductsToOrder}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      >
                        Thêm sản phẩm
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Order Items List */}
            {orderForm.items.length > 0 && (
              <div className="border border-gray-300 rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Sản phẩm</th>
                      <th className="px-4 py-2 text-center text-sm font-medium text-gray-700">Số lượng</th>
                      <th className="px-4 py-2 text-center text-sm font-medium text-gray-700">Giá bán</th>
                      <th className="px-4 py-2 text-right text-sm font-medium text-gray-700">Thành tiền</th>
                      <th className="px-4 py-2 text-center text-sm font-medium text-gray-700">Xóa</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orderForm.items.map((item, index) => (
                      <tr key={index} className="border-t">
                        <td className="px-4 py-2">
                          <div>
                            <div className="font-medium">{item.productName}</div>
                            <div className="text-sm text-gray-500">SKU: {item.productSku}</div>
                          </div>
                        </td>
                        <td className="px-4 py-2 text-center">
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => updateOrderItem(index, 'quantity', parseInt(e.target.value) || 1)}
                            className="w-20 px-2 py-1 text-center border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </td>
                        <td className="px-4 py-2 text-center">
                          <input
                            type="number"
                            min="0"
                            value={item.sellingPrice}
                            onChange={(e) => updateOrderItem(index, 'sellingPrice', parseFloat(e.target.value) || 0)}
                            className="w-32 px-2 py-1 text-center border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Nhập giá"
                          />
                        </td>
                        <td className="px-4 py-2 text-right font-medium">{formatCurrency(item.subtotal)}</td>
                        <td className="px-4 py-2 text-center">
                          <button
                            type="button"
                            onClick={() => removeItemFromOrder(index)}
                            className="text-red-600 hover:text-red-800"
                          >
                            Xóa
                          </button>
                        </td>
                      </tr>
                    ))}
                    <tr className="border-t bg-gray-50">
                      <td colSpan="3" className="px-4 py-2 text-right font-medium">Tổng cộng:</td>
                      <td className="px-4 py-2 text-right font-bold text-lg">{formatCurrency(calculateTotal())}</td>
                      <td></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}

            {orderForm.items.length === 0 && (
              <div className="text-center py-8 border border-gray-300 border-dashed rounded-lg">
                <p className="text-gray-500">Chưa có sản phẩm nào được chọn</p>
                <p className="text-sm text-gray-400 mt-1">Nhấn "Chọn sản phẩm" để thêm sản phẩm vào đơn hàng</p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between items-center pt-6 border-t">
            <div>
              <p className="text-lg font-semibold text-gray-900">
                Tổng đơn hàng: <span className="text-blue-600">{formatCurrency(calculateTotal())}</span>
              </p>
            </div>
            <div className="flex space-x-4">
              <button
                type="button"
                onClick={handleCancel}
                className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors"
                disabled={isSubmitting}
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={isSubmitting || orderForm.items.length === 0}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Đang tạo...' : 'Tạo đơn hàng'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateOrder;