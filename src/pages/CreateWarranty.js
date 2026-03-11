import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import {
  Tables,
  ProductFields,
  PaymentMethod,
} from '../models';

function CreateWarranty() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [showProductDialog, setShowProductDialog] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');



  // Form state for creating warranty
  const [warrantyForm, setWarrantyForm] = useState({
    createDate: new Date().toISOString().split('T')[0],
    paymentMethod: PaymentMethod.BANK,
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
  }, [user]);



  // Handle customer field change
  const handleCustomerFieldChange = (field, value) => {
    setWarrantyForm({
      ...warrantyForm,
      customer: { ...warrantyForm.customer, [field]: value }
    });
  };

  // Fetch products for selection
  const fetchProducts = async () => {
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
      setMessage(`Lỗi tải sản phẩm: ${error.message}`);
    }
  };

  // Add selected products to warranty
  const addSelectedProductsToWarranty = () => {
    if (selectedProducts.length === 0) {
      setMessage('Vui lòng chọn ít nhất một sản phẩm');
      return;
    }

    const newItems = selectedProducts.map(productId => {
      const product = products.find(p => p[ProductFields.ID] === parseInt(productId));
      return {
        productId: product[ProductFields.ID],
        productName: product[ProductFields.NAME],
        productSku: product[ProductFields.SKU],
        quantity: 1,
        sellingPrice: 0,
        subtotal: 0,
        purchaseDate: '',
        description: product.description || ''
      };
    });

    setWarrantyForm({
      ...warrantyForm,
      items: [...warrantyForm.items, ...newItems]
    });

    setSelectedProducts([]);
    setShowProductDialog(false);
    setMessage('');
  };

  // Update item field
  const updateWarrantyItem = (index, field, value) => {
    const updatedItems = [...warrantyForm.items];
    updatedItems[index][field] = value;
    
    // Recalculate subtotal if quantity or price changes
    if (field === 'quantity' || field === 'sellingPrice') {
      updatedItems[index].subtotal = updatedItems[index].quantity * updatedItems[index].sellingPrice;
    }
    
    setWarrantyForm({ ...warrantyForm, items: updatedItems });
  };

  // Remove item from warranty
  const removeItemFromWarranty = (index) => {
    const updatedItems = warrantyForm.items.filter((_, i) => i !== index);
    setWarrantyForm({ ...warrantyForm, items: updatedItems });
  };

  // Generate automatic warranty ID
  const generateWarrantyId = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `BH${year}${month}${day}${random}`;
  };

  // Validate and print warranty
  const handlePrintWarranty = async (e) => {
    e.preventDefault();
    
    const { customer } = warrantyForm;
    if (!customer.idNumber || !customer.name || !customer.phone || !customer.address) {
      setMessage('Vui lòng điền đầy đủ thông tin khách hàng');
      return;
    }

    if (warrantyForm.items.length === 0) {
      setMessage('Vui lòng thêm ít nhất một sản phẩm');
      return;
    }

    try {
      setIsSubmitting(true);
      
      // Generate warranty ID
      const warrantyId = generateWarrantyId();
      
      // Create warranty data for printing
      const warrantyData = {
        ...warrantyForm,
        warrantyId,
        generateDate: new Date().toLocaleString('vi-VN')
      };
      
      setMessage('Tạo phiếu đảm bảo thành công! Đang in...');
      
      // Create a temporary element to hold the print content
      const printWindow = window.open('', '_blank');
      printWindow.document.write(`
        <html>
          <head>
            <title>Phiếu Đảm Bảo - ${warrantyData.warrantyId}</title>
            <style>
              @page { size: A4; margin: 15mm; }
              body { font-family: 'Times New Roman', Times, serif; color: #000; padding: 20px; max-width: 800px; margin: 0 auto; font-size: 14px; line-height: 1.5; }
              .print-header { text-align: center; margin-bottom: 20px; }
              .print-header h1 { font-size: 24px; font-weight: bold; margin: 0 0 5px 0; }
              .print-header .address { font-size: 13px; font-weight: bold; margin: 2px 0; }
              .print-header .hotline { font-size: 13px; font-weight: bold; margin: 2px 0; }
              .print-title { text-align: center; font-size: 22px; font-weight: bold; margin: 25px 0 20px 0; }
              .print-info { margin-bottom: 15px; }
              .print-info-row { display: flex; margin-bottom: 6px; font-size: 14px; }
              .print-info-row .label { min-width: 100px; }
              .print-info-cccd-row { display: flex; margin-bottom: 6px; font-size: 14px; }
              .print-info-cccd-row .cccd-group { flex: 1; }
              .print-info-cccd-row .issued-group { flex: 1; text-align: left; padding-left: 40px; }
              .print-table { width: 100%; border-collapse: collapse; margin-bottom: 5px; font-size: 13px; }
              .print-table th, .print-table td { border: 1px solid #000; padding: 6px 8px; }
              .print-table th { background-color: #f0f0f0; font-weight: bold; text-align: center; font-size: 12px; }
              .print-table td.center { text-align: center; }
              .print-table td.right { text-align: right; }
              .print-total-row { display: flex; font-weight: bold; font-size: 14px; border: 1px solid #000; border-top: none; }
              .print-total-row .total-label { padding: 6px 8px; flex: 1; }
              .print-total-row .total-value { padding: 6px 8px; text-align: right; min-width: 150px; }
              .print-footer-info { margin-top: 8px; font-size: 14px; }
              .print-footer-info .row { margin-bottom: 3px; }
              .print-footer-info .bold { font-weight: bold; }
              .print-payment-row { display: flex; gap: 40px; }
              .print-thank-you { text-align: center; margin-top: 25px; font-size: 14px; }
              .print-signatures { display: flex; justify-content: space-between; margin-top: 10px; text-align: center; font-size: 14px; }
              .print-signatures .sign-col { width: 45%; }
              .print-signatures .sign-col .title { font-weight: bold; margin-bottom: 3px; }
              .print-signatures .sign-col .subtitle { font-size: 13px; font-style: italic; }
              .print-signatures .sign-col .sign-space { height: 70px; }
            </style>
          </head>
          <body>
            <div class="print-header">
              <h1>KIM PHƯỢNG MAI Silver & Jewelry</h1>
              <div class="address">Trụ sở: 43/44/20 Đỗ Thừa Luông, Phường Phú Thọ Hòa, TP Hồ Chí Minh</div>
              <div class="address">ĐC bán hàng: 100e Gò Dầu, Phường Tân Sơn Nhì, TP Hồ Chí Minh, Việt Nam</div>
              <div class="hotline">Hotline: 08.665.888.15</div>
            </div>
            <div class="print-title">PHIẾU ĐẢM BẢO</div>
            <div class="print-info">
              <div class="print-info-row">
                <span class="label">Ngày: ${new Date(warrantyData.createDate).toLocaleString('vi-VN', {hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric'})}</span>
              </div>
              <div class="print-info-row">
                <span class="label">Khách hàng: ${warrantyData.customer.name}</span>
              </div>
              <div class="print-info-row">
                <span class="label">SĐT: ${warrantyData.customer.phone}</span>
              </div>
              <div class="print-info-row">
                <div class="cccd-group">
                  <span>CCCD: ${warrantyData.customer.idNumber}</span>
                </div>
                <div class="issued-group">
                  ${warrantyData.customer.idIssuedDate ? `<span>Ngày cấp: ${new Date(warrantyData.customer.idIssuedDate).toLocaleDateString('vi-VN')}</span>` : ''}
                </div>
              </div>
              <div class="print-info-row">
                <span class="label">Địa chỉ: ${warrantyData.customer.address}</span>
              </div>
            </div>
            <table class="print-table">
              <thead>
                <tr>
                  <th style="width: 40px">STT</th>
                  <th>TÊN HÀNG HÓA</th>
                  <th style="width: 50px">ĐVT</th>
                  <th style="width: 40px">SL</th>
                  <th style="width: 100px">ĐƠN GIÁ</th>
                  <th style="width: 120px">THÀNH TIỀN</th>
                </tr>
              </thead>
              <tbody>
                ${warrantyData.items.map((item, index) => `
                  <tr>
                    <td class="center">${index + 1}</td>
                    <td>${item.productName || 'Sản phẩm không xác định'}</td>
                    <td class="center">Cái</td>
                    <td class="center">${item.quantity}</td>
                    <td class="right">${new Intl.NumberFormat('vi-VN').format(item.sellingPrice)}</td>
                    <td class="right">${new Intl.NumberFormat('vi-VN').format(item.quantity * item.sellingPrice)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
            <div class="print-total-row">
              <div class="total-label">TỔNG THANH TOÁN</div>
              <div class="total-value">${new Intl.NumberFormat('vi-VN').format(warrantyData.items.reduce((total, item) => total + (item.subtotal || 0), 0))}</div>
            </div>
            <div class="print-footer-info">
              <div class="row">
                <span class="bold">Ngày tạo phiếu: </span>
                <span>${new Date(warrantyData.createDate).toLocaleDateString('vi-VN')}</span>
              </div>
              <div class="print-payment-row">
                <span>
                  <span class="bold">Hình thức thanh toán: </span>
                  <span>${warrantyData.paymentMethod === 'bank' ? 'CK' : 'Tiền mặt'}</span>
                </span>
                <span>phiếu đảm bảo sản phẩm</span>
              </div>
            </div>
            <div class="print-thank-you">
              Cảm ơn quý khách đã tin tưởng và lựa chọn sản phẩm của cửa hàng!
            </div>
            <div class="print-signatures">
              <div class="sign-col">
                <div>&nbsp;</div>
                <div class="title">Nhân viên bán hàng</div>
                <div class="subtitle">(Ký, họ tên)</div>
                <div class="sign-space"></div>
              </div>
              <div class="sign-col">
                <div class="title">Ngày ${new Date(warrantyData.createDate).toLocaleDateString('vi-VN')}</div>
                <div class="title">Khách hàng</div>
                <div class="subtitle">(Ký, họ tên)</div>
                <div class="sign-space"></div>
              </div>
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 500);
      
    } catch (error) {
      console.error('Error creating warranty:', error);
      setMessage(`Lỗi tạo phiếu đảm bảo: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calculate total amount
  const calculateTotal = () => {
    return warrantyForm.items.reduce((total, item) => total + item.subtotal, 0);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const handleCancel = () => {
    if (window.confirm('Bạn có chắc muốn hủy tạo phiếu đảm bảo ? Tất cả thông tin đã nhập sẽ bị mất.')) {
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
          <h1 className="text-3xl font-bold text-gray-900">Tạo phiếu đảm bảo mới</h1>
          <p className="text-gray-600 mt-1">Điền thông tin khách hàng và chọn sản phẩm</p>
        </div>
        <button
          onClick={handleCancel}
          className="text-gray-600 hover:text-gray-800 transition-colors"
        >
          ← Quay lại
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

      {/* Create Warranty Form */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <form onSubmit={handlePrintWarranty} className="space-y-8">
          
          {/* Warranty Info */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Thông tin đảm bảo</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ngày tạo *
                </label>
                <input
                  type="date"
                  value={warrantyForm.createDate}
                  onChange={(e) => setWarrantyForm({ ...warrantyForm, createDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phương thức thanh toán *
                </label>
                <select
                  value={warrantyForm.paymentMethod}
                  onChange={(e) => setWarrantyForm({ ...warrantyForm, paymentMethod: e.target.value })}
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
                  value={warrantyForm.customer.idNumber}
                  onChange={(e) => handleCustomerFieldChange('idNumber', e.target.value)}
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
                  value={warrantyForm.customer.name}
                  onChange={(e) => handleCustomerFieldChange('name', e.target.value)}
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
                  value={warrantyForm.customer.phone}
                  onChange={(e) => handleCustomerFieldChange('phone', e.target.value)}
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
                  value={warrantyForm.customer.idIssuedDate}
                  onChange={(e) => handleCustomerFieldChange('idIssuedDate', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Địa chỉ *
                </label>
                <input
                  type="text"
                  value={warrantyForm.customer.address}
                  onChange={(e) => handleCustomerFieldChange('address', e.target.value)}
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
                              const isAlreadyAdded = warrantyForm.items.some(item => item.productId === product.id);
                              
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
                                        e.stopPropagation();
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
                        onClick={addSelectedProductsToWarranty}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      >
                        Thêm sản phẩm
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Warranty Items List */}
            {warrantyForm.items.length > 0 && (
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
                    {warrantyForm.items.map((item, index) => (
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
                            onChange={(e) => updateWarrantyItem(index, 'quantity', parseInt(e.target.value) || 1)}
                            className="w-20 px-2 py-1 text-center border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </td>
                        <td className="px-4 py-2 text-center">
                          <input
                            type="number"
                            min="0"
                            value={item.sellingPrice}
                            onChange={(e) => updateWarrantyItem(index, 'sellingPrice', parseFloat(e.target.value) || 0)}
                            className="w-32 px-2 py-1 text-center border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Nhập giá"
                          />
                        </td>
                        <td className="px-4 py-2 text-right font-medium">{formatCurrency(item.subtotal)}</td>
                        <td className="px-4 py-2 text-center">
                          <button
                            type="button"
                            onClick={() => removeItemFromWarranty(index)}
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

            {warrantyForm.items.length === 0 && (
              <div className="text-center py-8 border border-gray-300 border-dashed rounded-lg">
                <p className="text-gray-500">Chưa có sản phẩm nào được chọn</p>
                <p className="text-sm text-gray-400 mt-1">Nhấn "Chọn sản phẩm" để thêm sản phẩm vào đảm bảo</p>
              </div>
            )}
          </div>

  
          {/* Action Buttons */}
          <div className="flex justify-between items-center pt-6 border-t">
            <div>
              <p className="text-lg font-semibold text-gray-900">
                Tổng đơn hàng: <span className="text-blue-600">{formatCurrency(calculateTotal())}</span>
              </p>
              <p className="text-sm text-gray-500">
                💡 phiếu đảm bảo sẽ được tạo tự động với mã số duy nhất khi in
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
                disabled={isSubmitting || warrantyForm.items.length === 0}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isSubmitting ? 'Đang tạo...' : (
                  <>
                    <span>🖨️</span>
                    In phiếu đảm bảo
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateWarranty;