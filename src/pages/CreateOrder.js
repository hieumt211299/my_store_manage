import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import LoadingOverlay from '../components/LoadingOverlay';

function CreateOrder() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addNotification } = useNotification();
  const [products, setProducts] = useState([]);
  const [showProductDialog, setShowProductDialog] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Customer search state
  const [customerSearch, setCustomerSearch] = useState('');
  const [searchedCustomers, setSearchedCustomers] = useState([]);
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [isSearchingCustomer, setIsSearchingCustomer] = useState(false);
  const customerSearchRef = useRef(null);
  const dropdownRef = useRef(null);
  
  // Debounce timer
  const debounceTimer = useRef(null);

  // Form state for creating orders
  const getDefaultExpectedDeliveryDate = () => {
    const date = new Date();
    date.setDate(date.getDate() + 90);
    return date.toISOString().split('T')[0];
  };

  const [orderForm, setOrderForm] = useState({
    createDate: new Date().toISOString().split('T')[0],
    expectedDeliveryDate: getDefaultExpectedDeliveryDate(),
    paymentMethod: 'bank',
    createdBy: user?.email || 'Admin', // Thêm created_by field
    customer: {
      idNumber: '',
      name: '',
      phone: '',
      idIssuedDate: '',
      address: ''
    },
    items: []
  });

  // Fetch products for selection
  const fetchProducts = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .is('deleted_at', null)
        .order('name');

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      addNotification(`Lỗi tải sản phẩm: ${error.message}`, 'error');
    }
  }, [addNotification]);

  useEffect(() => {
    fetchProducts();

    // Update created_by when user changes
    if (user?.email && orderForm.createdBy === 'Admin') {
      setOrderForm(prev => ({
        ...prev,
        createdBy: user.email
      }));
    }

    // Close dropdown when clicking outside
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target) &&
        customerSearchRef.current &&
        !customerSearchRef.current.contains(event.target)
      ) {
        setShowCustomerDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [user, orderForm.createdBy, fetchProducts]);  // Add fetchProducts to dependency array

  // Search customers with debounce
  const searchCustomers = useCallback(async (searchTerm) => {
    if (!searchTerm || searchTerm.length < 3) {
      setSearchedCustomers([]);
      setShowCustomerDropdown(false);
      return;
    }

    try {
      setIsSearchingCustomer(true);
      
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .or(`id_number.ilike.%${searchTerm}%,name.ilike.%${searchTerm}%,phone.ilike.%${searchTerm}%`)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      
      setSearchedCustomers(data || []);
      setShowCustomerDropdown(data && data.length > 0);
    } catch (error) {
      console.error('Error searching customers:', error);
      setSearchedCustomers([]);
      setShowCustomerDropdown(false);
    } finally {
      setIsSearchingCustomer(false);
    }
  }, []);

  // Handle customer search with debounce
  const handleCustomerSearchChange = (value) => {
    setCustomerSearch(value);
    
    // Clear debounce timer
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
    
    // Set new timer
    debounceTimer.current = setTimeout(() => {
      searchCustomers(value);
    }, 300); // 300ms debounce
  };

  // Select customer from dropdown
  const selectCustomer = (customer) => {
    setOrderForm({
      ...orderForm,
      customer: {
        idNumber: customer.id_number,
        name: customer.name,
        phone: customer.phone,
        idIssuedDate: customer.id_issued_date || '',
        address: customer.address
      }
    });
    
    setCustomerSearch(customer.id_number);
    setShowCustomerDropdown(false);
    addNotification('Đã chọn khách hàng thành công!', 'success', 3000);
  };

  // Clear customer selection
  const clearCustomerSelection = () => {
    setOrderForm({
      ...orderForm,
      customer: {
        idNumber: '',
        name: '',
        phone: '',
        idIssuedDate: '',
        address: ''
      }
    });
    setCustomerSearch('');
    setSearchedCustomers([]);
    setShowCustomerDropdown(false);
  };

  // Handle manual customer input change
  const handleCustomerFieldChange = (field, value) => {
    setOrderForm({
      ...orderForm,
      customer: { ...orderForm.customer, [field]: value }
    });
    
    // If user is editing ID number manually, update search field too
    if (field === 'idNumber') {
      setCustomerSearch(value);
      handleCustomerSearchChange(value);
    }
  };

  // Add selected products to order
  const addSelectedProductsToOrder = () => {
    if (selectedProducts.length === 0) {
      addNotification('Vui lòng chọn ít nhất một sản phẩm', 'warning');
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
      addNotification('Vui lòng điền đầy đủ thông tin khách hàng', 'error');
      return;
    }

    if (orderForm.items.length === 0) {
      addNotification('Vui lòng thêm ít nhất một sản phẩm', 'error');
      return;
    }

    if (!orderForm.expectedDeliveryDate) {
      addNotification('Vui lòng chọn ngày giao hàng dự kiến', 'error');
      return;
    }

    try {
      setIsSubmitting(true);
      const totalAmount = calculateTotal();

      // Check if customer exists, create if not
      let customerId = null;
      
      // First, try to find existing customer
      const { data: existingCustomer, error: customerSearchError } = await supabase
        .from('customers')
        .select('id')
        .eq('id_number', customer.idNumber)
        .single();

      if (customerSearchError && customerSearchError.code !== 'PGRST116') {
        // Error other than "no rows returned"
        throw customerSearchError;
      }

      if (existingCustomer) {
        customerId = existingCustomer.id;
      } else {
        // Create new customer
        const { data: newCustomer, error: customerCreateError } = await supabase
          .from('customers')
          .insert([
            {
              id_number: customer.idNumber,
              name: customer.name,
              phone: customer.phone,
              id_issued_date: customer.idIssuedDate || null,
              address: customer.address
            }
          ])
          .select()
          .single();

        if (customerCreateError) throw customerCreateError;
        customerId = newCustomer.id;
      }

      // Create order with customer_id
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert([
          {
            created_date: orderForm.createDate,
            customer_id: customerId,
            customer_id_number: customer.idNumber,
            customer_name: customer.name,
            customer_phone: customer.phone,
            customer_id_issued_date: customer.idIssuedDate || null,
            customer_address: customer.address,
            total_amount: totalAmount,
            expected_delivery_date: orderForm.expectedDeliveryDate,
            payment_method: orderForm.paymentMethod,
            created_by: orderForm.createdBy,
            status: 'customer_holds'
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

      addNotification('Tạo đơn hàng thành công! Chuyển đến chi tiết đơn hàng...', 'success');
      
      // Navigate after a short delay to show success message
      setTimeout(() => {
        navigate(`/orders/${orderData.id}`);
      }, 2000);
      
    } catch (error) {
      console.error('Error creating order:', error);
      addNotification(`Lỗi tạo đơn hàng: ${error.message}`, 'error');
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

  // Filter products based on search term
  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.id.toString().includes(searchTerm)
  );

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

      {/* Create Order Form */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <form onSubmit={handleSubmitOrder} className="space-y-8">
          
          {/* Order Info */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Thông tin đơn hàng</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
                  Ngày giao hàng dự kiến *
                </label>
                <input
                  type="date"
                  value={orderForm.expectedDeliveryDate}
                  onChange={(e) => setOrderForm({ ...orderForm, expectedDeliveryDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={isSubmitting}
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
                  disabled={isSubmitting}
                >
                  <option value="bank">Chuyển khoản</option>
                  <option value="cash">Tiền mặt</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Người tạo *
                </label>
                <input
                  type="text"
                  value={orderForm.createdBy}
                  onChange={(e) => setOrderForm({ ...orderForm, createdBy: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Nhập tên người tạo"
                  disabled={isSubmitting}
                  required
                />
              </div>
            </div>
          </div>

          {/* Customer Info */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Thông tin khách hàng</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Số CMND/CCCD *
                </label>
                <div ref={customerSearchRef}>
                  <input
                    type="text"
                    value={customerSearch}
                    onChange={(e) => {
                      handleCustomerSearchChange(e.target.value);
                      handleCustomerFieldChange('idNumber', e.target.value);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Nhập số CMND/CCCD để tìm kiếm..."
                    required
                  />
                  {isSearchingCustomer && (
                    <div className="absolute right-3 top-9 text-gray-400">
                      <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                    </div>
                  )}
                  {orderForm.customer.name && (
                    <button
                      type="button"
                      onClick={clearCustomerSelection}
                      className="absolute right-3 top-9 text-gray-400 hover:text-gray-600"
                      title="Xóa chọn khách hàng"
                    >
                      ✕
                    </button>
                  )}
                </div>
                
                {/* Customer Dropdown */}
                {showCustomerDropdown && searchedCustomers.length > 0 && (
                  <div 
                    ref={dropdownRef}
                    className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto"
                  >
                    {searchedCustomers.map((customer) => (
                      <div
                        key={customer.id}
                        onClick={() => selectCustomer(customer)}
                        className="px-4 py-3 cursor-pointer hover:bg-blue-50 border-b border-gray-100 last:border-b-0"
                      >
                        <div className="font-medium text-gray-900">{customer.name}</div>
                        <div className="text-sm text-gray-600">
                          CCCD: {customer.id_number} • SĐT: {customer.phone}
                        </div>
                        <div className="text-xs text-gray-500 truncate">
                          {customer.address}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Họ tên *
                </label>
                <input
                  type="text"
                  value={orderForm.customer.name}
                  onChange={(e) => handleCustomerFieldChange('name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Nhập họ tên khách hàng"
                  disabled={isSubmitting}
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
                  onChange={(e) => handleCustomerFieldChange('phone', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Nhập số điện thoại"
                  disabled={isSubmitting}
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
                  onChange={(e) => handleCustomerFieldChange('idIssuedDate', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={isSubmitting}
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Địa chỉ *
                </label>
                <input
                  type="text"
                  value={orderForm.customer.address}
                  onChange={(e) => handleCustomerFieldChange('address', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Nhập địa chỉ khách hàng"
                  disabled={isSubmitting}
                  required
                />
              </div>
            </div>
            
            {/* Customer info hint */}
            <div className="mt-3 text-sm text-gray-500">
              💡 Nhập số CCCD để tìm kiếm khách hàng có sẵn hoặc điền thông tin mới
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
                <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[80vh]">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">Chọn sản phẩm</h3>
                    <button
                      onClick={() => {
                        setShowProductDialog(false);
                        setSelectedProducts([]);
                        setSearchTerm('');
                      }}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      ✕
                    </button>
                  </div>
                  
                  {/* Search Input */}
                  <div className="mb-4">
                    <div className="relative">
                      <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Tìm kiếm theo tên, SKU hoặc ID sản phẩm..."
                      />
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      </div>
                    </div>
                    {searchTerm && (
                      <p className="text-sm text-gray-500 mt-2">
                        Tìm thấy {filteredProducts.length} sản phẩm
                      </p>
                    )}
                  </div>
                  
                  <div className="border border-gray-300 rounded-lg overflow-hidden mb-4">
                    <div className="max-h-96 overflow-y-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50 sticky top-0">
                          <tr>
                            <th className="w-12 px-4 py-2 text-left">
                              <input
                                type="checkbox"
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedProducts(filteredProducts.map(p => p.id.toString()));
                                  } else {
                                    setSelectedProducts([]);
                                  }
                                }}
                                checked={selectedProducts.length === filteredProducts.length && filteredProducts.length > 0}
                              />
                            </th>
                            <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Hình ảnh</th>
                            <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Sản phẩm</th>
                            <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">SKU</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredProducts.length === 0 ? (
                            <tr>
                              <td colSpan="4" className="px-4 py-8 text-center text-gray-500">
                                {searchTerm ? 'Không tìm thấy sản phẩm nào phù hợp' : 'Chưa có sản phẩm nào'}
                              </td>
                            </tr>
                          ) : (
                            filteredProducts.map((product) => {
                              const isSelected = selectedProducts.includes(product.id.toString());
                              const isAlreadyAdded = orderForm.items.some(item => item.productId === product.id);
                              
                              const handleToggleProduct = () => {
                                if (isAlreadyAdded) return;
                                
                                if (isSelected) {
                                  setSelectedProducts(selectedProducts.filter(id => id !== product.id.toString()));
                                } else {
                                  setSelectedProducts([...selectedProducts, product.id.toString()]);
                                }
                              };
                            
                              return (
                                <tr 
                                  key={product.id} 
                                  className={`border-t cursor-pointer ${
                                    isAlreadyAdded 
                                      ? 'bg-gray-100 opacity-50 cursor-not-allowed' 
                                      : isSelected 
                                        ? 'bg-blue-50 hover:bg-blue-100' 
                                        : 'hover:bg-gray-50'
                                  }`}
                                  onClick={handleToggleProduct}
                                >
                                  <td className="px-4 py-2">
                                    <input
                                      type="checkbox"
                                      checked={isSelected}
                                      disabled={isAlreadyAdded}
                                      onChange={(e) => {
                                        e.stopPropagation(); // Ngăn trigger click của row
                                        handleToggleProduct();
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
                            })
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
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
                          setSearchTerm('');
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

      {/* Loading Overlay */}
      <LoadingOverlay 
        isVisible={isSubmitting}
        message="Đang tạo đơn hàng..."
      />
    </div>
  );
}

export default CreateOrder;