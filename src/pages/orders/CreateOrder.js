import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';
import LoadingOverlay from '../../components/LoadingOverlay';
import PageHeader from '../../components/PageHeader';
import ProductSelectionDialog from '../../components/ProductSelectionDialog';
import OrderInfoForm from './components/OrderInfoForm';
import CustomerInfoForm from './components/CustomerInfoForm';
import OrderItemsTable from './components/OrderItemsTable';
import {
  Tables,
  CustomerFields,
  ProductFields,
  OrderFields,
  OrderType,
  createDefaultOrderForm,
  updateOrderFormForType,
  buildCustomerInsertPayload,
  buildOrderInsertPayload,
  buildOrderItemsPayload,
  createOrderItemFromProduct,
  formatCurrency,
} from '../../models';

function CreateOrder() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addNotification } = useNotification();
  const [products, setProducts] = useState([]);
  const [employeeOptions, setEmployeeOptions] = useState([]);
  const [employeesLoading, setEmployeesLoading] = useState(false);
  const [showProductDialog, setShowProductDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [customerSearch, setCustomerSearch] = useState('');

  const [orderForm, setOrderForm] = useState(
    createDefaultOrderForm()
  );

  const fetchProducts = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from(Tables.PRODUCTS)
        .select('*')
        .is(ProductFields.DELETED_AT, null)
        .order(ProductFields.NAME);

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      addNotification(`Lỗi tải sản phẩm: ${error.message}`, 'error');
    }
  }, [addNotification]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const fetchEmployees = useCallback(async () => {
    try {
      setEmployeesLoading(true);
      const { data, error } = await supabase
        .from(Tables.EMPLOYEES)
        .select('id, full_name, employee_code')
        .eq('status', 'active')
        .is('deleted_at', null)
        .order('full_name');

      if (error) throw error;

      setEmployeeOptions(
        (data || []).map((employee) => ({
          value: String(employee.id),
          label: `${employee.full_name} (${employee.employee_code})`,
          keywords: `${employee.full_name} ${employee.employee_code}`,
          employeeName: employee.full_name,
        }))
      );
    } catch (error) {
      console.error('Error fetching employees:', error);
      addNotification(`Lỗi tải danh sách nhân viên: ${error.message}`, 'error');
    } finally {
      setEmployeesLoading(false);
    }
  }, [addNotification]);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  const addSelectedProductsToOrder = (selectedProductIds) => {
    if (selectedProductIds.length === 0) {
      addNotification('Vui lòng chọn ít nhất một sản phẩm', 'warning');
      return;
    }

    const newItems = selectedProductIds.map(productId => {
      const product = products.find(p => p[ProductFields.ID] === parseInt(productId));
      return createOrderItemFromProduct(product);
    });

    setOrderForm(prev => ({
      ...prev,
      items: [...prev.items, ...newItems],
    }));
    setShowProductDialog(false);
  };

  const updateOrderItem = (index, field, value) => {
    const updatedItems = [...orderForm.items];
    updatedItems[index][field] = value;
    updatedItems[index].subtotal = updatedItems[index].quantity * updatedItems[index].sellingPrice;
    setOrderForm(prev => ({ ...prev, items: updatedItems }));
  };

  const removeItemFromOrder = (index) => {
    const updatedItems = orderForm.items.filter((_, i) => i !== index);
    setOrderForm(prev => ({ ...prev, items: updatedItems }));
  };

  const calculateTotal = () => {
    return orderForm.items.reduce((total, item) => total + item.subtotal, 0);
  };

  // Handle order form changes with special logic for order type changes
  const handleOrderFormChange = (newOrderForm) => {
    // If order type changed, update form with appropriate defaults
    if (newOrderForm.orderType !== orderForm.orderType) {
      const updatedForm = updateOrderFormForType(newOrderForm, newOrderForm.orderType);
      setOrderForm(updatedForm);
    } else {
      setOrderForm(newOrderForm);
    }
  };

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
    if (!orderForm.employeeId) {
      addNotification('Vui lòng chọn nhân viên phụ trách', 'error');
      return;
    }
    
    // Only validate expected delivery date for orders, not warranty
    if (orderForm.orderType === OrderType.ORDER && !orderForm.expectedDeliveryDate) {
      addNotification('Vui lòng chọn ngày giao hàng dự kiến', 'error');
      return;
    }

    try {
      setIsSubmitting(true);
      const totalAmount = calculateTotal();

      let customerId = null;
      const { data: existingCustomer, error: customerSearchError } = await supabase
        .from(Tables.CUSTOMERS)
        .select(CustomerFields.ID)
        .eq(CustomerFields.ID_NUMBER, customer.idNumber)
        .single();

      if (customerSearchError && customerSearchError.code !== 'PGRST116') {
        throw customerSearchError;
      }

      if (existingCustomer) {
        customerId = existingCustomer.id;
      } else {
        const { data: newCustomer, error: customerCreateError } = await supabase
          .from(Tables.CUSTOMERS)
          .insert([buildCustomerInsertPayload(customer)])
          .select()
          .single();
        if (customerCreateError) throw customerCreateError;
        customerId = newCustomer.id;
      }

      const { data: orderData, error: orderError } = await supabase
        .from(Tables.ORDERS)
        .insert([buildOrderInsertPayload(orderForm, customerId, totalAmount, user?.email || 'Admin')])
        .select()
        .single();
      if (orderError) throw orderError;

      const orderItems = buildOrderItemsPayload(orderForm.items, orderData[OrderFields.ID]);
      const { error: itemsError } = await supabase
        .from(Tables.ORDER_ITEMS)
        .insert(orderItems);
      if (itemsError) throw itemsError;

      const successMessage = orderForm.orderType === OrderType.WARRANTY 
        ? 'Tạo phiếu đảm bảo thành công! Chuyển đến chi tiết phiếu đảm bảo...'
        : 'Tạo đơn hàng thành công! Chuyển đến chi tiết đơn hàng...';
      addNotification(successMessage, 'success');
      setTimeout(() => navigate(`/orders/${orderData.id}`), 300);
    } catch (error) {
      console.error('Error creating order:', error);
      addNotification(`Lỗi tạo đơn hàng: ${error.message}`, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    const confirmMessage = orderForm.orderType === OrderType.WARRANTY 
      ? 'Bạn có chắc muốn hủy tạo phiếu đảm bảo? Tất cả thông tin đã nhập sẽ bị mất.'
      : 'Bạn có chắc muốn hủy tạo đơn hàng? Tất cả thông tin đã nhập sẽ bị mất.';
    if (window.confirm(confirmMessage)) {
      navigate('/orders');
    }
  };

  const getPageTitle = () => {
    return orderForm.orderType === OrderType.WARRANTY 
      ? 'Tạo phiếu đảm bảo mới'
      : 'Tạo đơn hàng mới';
  };

  const getPageSubtitle = () => {
    return orderForm.orderType === OrderType.WARRANTY 
      ? 'Điền thông tin khách hàng và chọn sản phẩm đảm bảo'
      : 'Điền thông tin khách hàng và chọn sản phẩm';
  };

  const getSubmitButtonText = () => {
    if (isSubmitting) {
      return orderForm.orderType === OrderType.WARRANTY ? 'Đang tạo...' : 'Đang tạo...';
    }
    return orderForm.orderType === OrderType.WARRANTY ? 'Tạo phiếu đảm bảo' : 'Tạo đơn hàng';
  };

  const handleEmployeeChange = (employeeId) => {
    const selectedEmployee = employeeOptions.find((option) => option.value === employeeId);
    setOrderForm((prev) => ({
      ...prev,
      employeeId,
      createdBy: selectedEmployee?.employeeName || '',
    }));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <PageHeader
        title={getPageTitle()}
        subtitle={getPageSubtitle()}
        actions={
          <button
            onClick={handleCancel}
            className="text-gray-600 hover:text-gray-800 transition-colors"
          >
            ← Quay lại danh sách đơn hàng
          </button>
        }
      />

      <div className="bg-white rounded-lg shadow-md p-6">
        <form onSubmit={handleSubmitOrder} className="space-y-8">
          {/* Order Info */}
          <OrderInfoForm
            orderForm={orderForm}
            onChange={handleOrderFormChange}
            onEmployeeChange={handleEmployeeChange}
            employeeOptions={employeeOptions}
            employeesLoading={employeesLoading}
            disabled={isSubmitting}
          />

          {/* Customer Info */}
          <CustomerInfoForm
            orderForm={orderForm}
            onChange={setOrderForm}
            customerSearch={customerSearch}
            onCustomerSearchChange={setCustomerSearch}
            onNotification={addNotification}
            disabled={isSubmitting}
          />

          {/* Product Selection */}
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

            {showProductDialog && (
              <ProductSelectionDialog
                products={products}
                existingItemIds={orderForm.items.map(item => item.productId)}
                onAdd={addSelectedProductsToOrder}
                onClose={() => setShowProductDialog(false)}
              />
            )}

            <OrderItemsTable
              items={orderForm.items}
              onUpdateItem={updateOrderItem}
              onRemoveItem={removeItemFromOrder}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between items-center pt-6 border-t">
            <p className="text-lg font-semibold text-gray-900">
              Tổng đơn hàng: <span className="text-blue-600">{formatCurrency(calculateTotal())}</span>
            </p>
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
                {getSubmitButtonText()}
              </button>
            </div>
          </div>
        </form>
      </div>

      <LoadingOverlay 
        isVisible={isSubmitting} 
        message={orderForm.orderType === OrderType.WARRANTY 
          ? 'Đang tạo phiếu đảm bảo...' 
          : 'Đang tạo đơn hàng...'
        } 
      />
    </div>
  );
}

export default CreateOrder;
