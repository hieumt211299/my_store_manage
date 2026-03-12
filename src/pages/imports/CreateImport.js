import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';
import LoadingOverlay from '../../components/LoadingOverlay';
import PageHeader from '../../components/PageHeader';
import ProductSelectionDialog from '../../components/ProductSelectionDialog';
import SourceTypeSelector from './components/SourceTypeSelector';
import ImportBasicInfoForm from './components/ImportBasicInfoForm';
import AncaratInfoForm from './components/AncaratInfoForm';
import SellerInfoForm from './components/SellerInfoForm';
import ImportItemsTable from './components/ImportItemsTable';
import {
  Tables,
  ProductFields,
  ImportOrderFields,
  ImportItemFields,
  ImportOrderSourceType,
  ImportOrderStatus,
  formatCurrency,
} from '../../models';

function CreateImport() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addNotification } = useNotification();
  const [products, setProducts] = useState([]);
  const [showProductDialog, setShowProductDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form with default values
  const [importForm, setImportForm] = useState({
    sourceType: ImportOrderSourceType.ANCARAT,
    importDate: new Date().toISOString().split('T')[0],
    expectedReturnDate: (() => {
      const date = new Date();
      date.setDate(date.getDate() + 95);
      return date.toISOString().split('T')[0];
    })(),
    status: ImportOrderStatus.PENDING,
    
    // Ancarat specific fields
    ancaratInvoiceNumber: '',
    ancaratCashierName: '',
    
    // Customer seller specific fields
    seller: {
      idNumber: '',
      name: '',
      phone: '',
      address: '',
      idIssuedDate: '',
    },
    
    items: [],
  });

  const fetchProducts = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from(Tables.PRODUCTS)
        .select(`
          ${ProductFields.ID},
          ${ProductFields.NAME},
          ${ProductFields.SKU},
          ${ProductFields.IMAGE_URL},
          ${ProductFields.STOCK_QUANTITY},
          ${ProductFields.AVERAGE_PRICE}
        `)
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
    if (user?.email) {
      setImportForm(prev => ({ ...prev, createdBy: user.email }));
    }
  }, [user, fetchProducts]);

  // Handle source type change
  const handleSourceTypeChange = (sourceType) => {
    setImportForm(prev => ({
      ...prev,
      sourceType,
      // Reset fields when changing source type
      ancaratInvoiceNumber: '',
      ancaratCashierName: '',
      seller: {
        idNumber: '',
        name: '',
        phone: '',
        address: '',
        idIssuedDate: '',
      },
    }));
  };

  // Handle basic import info changes
  const handleBasicInfoChange = (field, value) => {
    setImportForm(prev => ({ ...prev, [field]: value }));
  };

  // Handle Ancarat info changes
  const handleAncaratInfoChange = (field, value) => {
    setImportForm(prev => ({ ...prev, [field]: value }));
  };

  // Handle seller info changes
  const handleSellerInfoChange = (field, value) => {
    setImportForm(prev => ({
      ...prev,
      seller: { ...prev.seller, [field]: value },
    }));
  };

  // Add products to import
  const addSelectedProductsToImport = (selectedProductIds) => {
    if (selectedProductIds.length === 0) {
      addNotification('Vui lòng chọn ít nhất một sản phẩm', 'warning');
      return;
    }

    const newItems = selectedProductIds.map(productId => {
      const product = products.find(p => p[ProductFields.ID] === parseInt(productId));
      return {
        productId: product[ProductFields.ID],
        productName: product[ProductFields.NAME],
        productSku: product[ProductFields.SKU],
        productImageUrl: product[ProductFields.IMAGE_URL],
        quantity: 1,
        importPrice: 0,
      };
    });

    setImportForm(prev => ({
      ...prev,
      items: [...prev.items, ...newItems],
    }));
    setShowProductDialog(false);
  };

  // Update import item
  const updateImportItem = (index, field, value) => {
    const updatedItems = [...importForm.items];
    
    if (field === 'quantity' || field === 'importPrice') {
      const numValue = parseFloat(value) || 0;
      updatedItems[index][field] = numValue;
    } else {
      updatedItems[index][field] = value;
    }
    
    setImportForm(prev => ({ ...prev, items: updatedItems }));
  };

  // Remove import item
  const removeImportItem = (index) => {
    const updatedItems = importForm.items.filter((_, i) => i !== index);
    setImportForm(prev => ({ ...prev, items: updatedItems }));
  };

  // Calculate total amount
  const totalAmount = importForm.items.reduce((sum, item) => 
    sum + (item.quantity * item.importPrice), 0);

  // Validate form
  const validateForm = () => {
    if (!importForm.importDate) {
      addNotification('Vui lòng nhập ngày nhập', 'error');
      return false;
    }

    if (!importForm.expectedReturnDate) {
      addNotification('Vui lòng nhập ngày dự kiến trả hàng', 'error');
      return false;
    }

    if (importForm.sourceType === ImportOrderSourceType.ANCARAT) {
      if (!importForm.ancaratInvoiceNumber.trim()) {
        addNotification('Vui lòng nhập số hóa đơn Ancarat', 'error');
        return false;
      }
      if (!importForm.ancaratCashierName.trim()) {
        addNotification('Vui lòng nhập tên thu ngân', 'error');
        return false;
      }
    }

    if (importForm.sourceType === ImportOrderSourceType.CUSTOMER) {
      if (!importForm.seller.name.trim()) {
        addNotification('Vui lòng nhập tên khách bán', 'error');
        return false;
      }
      if (!importForm.seller.phone.trim()) {
        addNotification('Vui lòng nhập số điện thoại', 'error');
        return false;
      }
      if (!importForm.seller.idNumber.trim()) {
        addNotification('Vui lòng nhập số CCCD/CMND', 'error');
        return false;
      }
    }

    if (importForm.items.length === 0) {
      addNotification('Vui lòng chọn ít nhất một sản phẩm', 'error');
      return false;
    }

    for (let i = 0; i < importForm.items.length; i++) {
      const item = importForm.items[i];
      if (!item.quantity || item.quantity <= 0) {
        addNotification(`Số lượng sản phẩm "${item.productName}" phải lớn hơn 0`, 'error');
        return false;
      }
      if (!item.importPrice || item.importPrice <= 0) {
        addNotification(`Giá nhập sản phẩm "${item.productName}" phải lớn hơn 0`, 'error');
        return false;
      }
    }

    return true;
  };

  // Build import order payload
  const buildImportOrderPayload = () => {
    const payload = {
      [ImportOrderFields.SOURCE_TYPE]: importForm.sourceType,
      [ImportOrderFields.STATUS]: importForm.status,
      [ImportOrderFields.IMPORT_DATE]: importForm.importDate,
      [ImportOrderFields.EXPECTED_RETURN_DATE]: importForm.expectedReturnDate,
      [ImportOrderFields.TOTAL_AMOUNT]: totalAmount,
      [ImportOrderFields.CREATED_BY]: user?.name || 'Admin',
    };

    if (importForm.sourceType === ImportOrderSourceType.ANCARAT) {
      payload[ImportOrderFields.ANCARAT_INVOICE_NUMBER] = importForm.ancaratInvoiceNumber.trim();
      payload[ImportOrderFields.ANCARAT_CASHIER_NAME] = importForm.ancaratCashierName.trim();
    }

    if (importForm.sourceType === ImportOrderSourceType.CUSTOMER) {
      payload[ImportOrderFields.SELLER_ID_NUMBER] = importForm.seller.idNumber.trim();
      payload[ImportOrderFields.SELLER_NAME] = importForm.seller.name.trim();
      payload[ImportOrderFields.SELLER_PHONE] = importForm.seller.phone.trim();
      payload[ImportOrderFields.SELLER_ADDRESS] = importForm.seller.address.trim();
      if (importForm.seller.idIssuedDate) {
        payload[ImportOrderFields.SELLER_ID_ISSUED_DATE] = importForm.seller.idIssuedDate;
      }
    }

    return payload;
  };

  // Build import items payload
  const buildImportItemsPayload = (importOrderId) => {
    return importForm.items.map(item => ({
      [ImportItemFields.IMPORT_ORDER_ID]: importOrderId,
      [ImportItemFields.PRODUCT_ID]: item.productId,
      [ImportItemFields.QUANTITY]: item.quantity,
      [ImportItemFields.IMPORT_PRICE]: item.importPrice,
    }));
  };

  // Submit form
  const handleSubmitImport = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);

      // Insert import order
      const { data: importOrderData, error: importOrderError } = await supabase
        .from(Tables.IMPORT_ORDERS)
        .insert([buildImportOrderPayload()])
        .select()
        .single();

      if (importOrderError) throw importOrderError;

      // Insert import items
      const importItems = buildImportItemsPayload(importOrderData[ImportOrderFields.ID]);
      const { error: itemsError } = await supabase
        .from(Tables.IMPORT_ITEMS)
        .insert(importItems);

      if (itemsError) throw itemsError;

      addNotification('Tạo đơn nhập thành công! Chuyển đến chi tiết đơn nhập...', 'success');
      setTimeout(() => navigate(`/imports/${importOrderData.id}`), 2000);
    } catch (error) {
      console.error('Error creating import:', error);
      addNotification(`Lỗi tạo đơn nhập: ${error.message}`, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (window.confirm('Bạn có chắc muốn hủy tạo đơn nhập? Tất cả thông tin đã nhập sẽ bị mất.')) {
      navigate('/imports');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <PageHeader
        title="Tạo đơn nhập mới"
        subtitle="Chọn nguồn nhập và điền thông tin sản phẩm"
        actions={
          <button
            onClick={handleCancel}
            className="text-gray-600 hover:text-gray-800 transition-colors"
          >
            ← Quay lại danh sách đơn nhập
          </button>
        }
      />

      <div className="bg-white rounded-lg shadow-md p-6">
        <form onSubmit={handleSubmitImport} className="space-y-8">
          {/* Source Type Selection */}
          <SourceTypeSelector
            selectedType={importForm.sourceType}
            onChange={handleSourceTypeChange}
          />

          {/* Basic Import Info */}
          <ImportBasicInfoForm
            importDate={importForm.importDate}
            expectedReturnDate={importForm.expectedReturnDate}
            onImportDateChange={(value) => handleBasicInfoChange('importDate', value)}
            onExpectedReturnDateChange={(value) => handleBasicInfoChange('expectedReturnDate', value)}
          />

          {/* Source-specific forms */}
          {importForm.sourceType === ImportOrderSourceType.ANCARAT && (
            <AncaratInfoForm
              invoiceNumber={importForm.ancaratInvoiceNumber}
              cashierName={importForm.ancaratCashierName}
              onInvoiceNumberChange={(value) => handleAncaratInfoChange('ancaratInvoiceNumber', value)}
              onCashierNameChange={(value) => handleAncaratInfoChange('ancaratCashierName', value)}
            />
          )}

          {importForm.sourceType === ImportOrderSourceType.CUSTOMER && (
            <SellerInfoForm
              seller={importForm.seller}
              onSellerChange={handleSellerInfoChange}
            />
          )}

          {/* Product Selection */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Danh sách sản phẩm</h2>
              <button
                type="button"
                onClick={() => setShowProductDialog(true)}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                + Thêm sản phẩm
              </button>
            </div>

            <ImportItemsTable
              items={importForm.items}
              onUpdateItem={updateImportItem}
              onRemoveItem={removeImportItem}
            />

            {importForm.items.length > 0 && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-gray-900">Tổng cộng:</span>
                  <span className="text-2xl font-bold text-green-600">
                    {formatCurrency(totalAmount)}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={handleCancel}
              className="px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSubmitting || importForm.items.length === 0}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Đang tạo...' : 'Tạo đơn nhập'}
            </button>
          </div>
        </form>
      </div>

      {/* Product Selection Dialog */}
      {showProductDialog && (
        <ProductSelectionDialog
          products={products}
          onClose={() => setShowProductDialog(false)}
          onAdd={addSelectedProductsToImport}
          existingProductIds={importForm.items.map(item => item.productId)}
        />
      )}

      {/* Loading Overlay */}
      {isSubmitting && (
        <LoadingOverlay message="Đang tạo đơn nhập..." />
      )}
    </div>
  );
}

export default CreateImport;