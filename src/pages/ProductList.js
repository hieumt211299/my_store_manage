import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import Loading from '../components/Loading';
import {
  Tables,
  ProductFields,
  StorageBuckets,
  buildProductInsertPayload,
  formatCurrency,
} from '../models';

function ProductList() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', sku: '', image: null });
  const [message, setMessage] = useState('');
  const [uploading, setUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch products from Supabase
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from(Tables.PRODUCTS)
        .select(`
          ${ProductFields.ID},
          ${ProductFields.NAME},
          ${ProductFields.SKU},
          ${ProductFields.IMAGE_URL},
          ${ProductFields.CREATED_AT},
          ${ProductFields.DELETED_AT},
          ${ProductFields.INCOMING_QUANTITY},
          ${ProductFields.RESERVED_QUANTITY},
          ${ProductFields.AVAILABLE_QUANTITY},
          ${ProductFields.STOCK_QUANTITY},
          ${ProductFields.AVERAGE_PRICE}
        `)
        .is(ProductFields.DELETED_AT, null)
        .order(ProductFields.CREATED_AT, { ascending: false });

      if (error) {
        throw error;
      }

      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      setMessage(`Lỗi tải sản phẩm: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Upload image to Supabase Storage
  const uploadImage = async (file) => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from(StorageBuckets.PRODUCT_IMAGES)
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const { data } = supabase.storage
        .from(StorageBuckets.PRODUCT_IMAGES)
        .getPublicUrl(filePath);

      return data.publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  };

  // Create new product
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.sku) {
      setMessage('Vui lòng điền đầy đủ thông tin');
      return;
    }

    try {
      setUploading(true);
      let imageUrl = null;

      // Upload image if provided
      if (formData.image) {
        imageUrl = await uploadImage(formData.image);
      }

      const { data, error } = await supabase
        .from(Tables.PRODUCTS)
        .insert([buildProductInsertPayload(formData.name, formData.sku, imageUrl)])
        .select();

      if (error) {
        throw error;
      }

      setProducts([...data, ...products]);
      setFormData({ name: '', sku: '', image: null });
      setShowCreateForm(false);
      setMessage('Tạo sản phẩm thành công!');
      
      // Reset file input
      const fileInput = document.getElementById('imageInput');
      if (fileInput) fileInput.value = '';
      
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error creating product:', error);
      setMessage(`Lỗi tạo sản phẩm: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  // Soft delete product (set deleted_at timestamp)
  const handleDelete = async (product) => {
    if (!window.confirm('Bạn có chắc muốn xóa sản phẩm này?')) {
      return;
    }

    try {
      // Soft delete: Update deleted_at field instead of actual deletion
      const { error } = await supabase
        .from(Tables.PRODUCTS)
        .update({ [ProductFields.DELETED_AT]: new Date().toISOString() })
        .eq(ProductFields.ID, product[ProductFields.ID]);

      if (error) {
        throw error;
      }

      // Remove from local state immediately
      setProducts(products.filter(p => p[ProductFields.ID] !== product[ProductFields.ID]));
      setMessage('Xóa sản phẩm thành công!');
      
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error soft deleting product:', error);
      setMessage(`Lỗi xóa sản phẩm: ${error.message}`);
    }
  };

  // Handle image file selection
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setMessage('Kích thước ảnh không được vượt quá 5MB');
        return;
      }
      
      // Check file type
      if (!file.type.startsWith('image/')) {
        setMessage('Vui lòng chọn file ảnh hợp lệ');
        return;
      }
      
      setFormData({ ...formData, image: file });
    }
  };

  // Filter products based on search term
  const filteredProducts = products.filter(product => 
    product[ProductFields.NAME].toLowerCase().includes(searchTerm.toLowerCase()) ||
    product[ProductFields.SKU].toLowerCase().includes(searchTerm.toLowerCase()) ||
    product[ProductFields.ID].toString().includes(searchTerm)
  );

  if (loading) {
    return <Loading type="page" message="Đang tải sản phẩm..." />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Danh sách sản phẩm</h1>
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
            {searchTerm ? `${filteredProducts.length} / ${products.length}` : `${products.length}`} sản phẩm
          </span>
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            + Thêm sản phẩm
          </button>
        </div>
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

      {/* Search Bar */}
      <div className="mb-6 bg-white rounded-lg shadow-md p-4">
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
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
        {searchTerm && (
          <p className="text-sm text-gray-500 mt-2">
            Tìm thấy {filteredProducts.length} sản phẩm
          </p>
        )}
      </div>

      {/* Create Form */}
      {showCreateForm && (
        <div className="mb-8 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Thêm sản phẩm mới</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tên sản phẩm *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Nhập tên sản phẩm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  SKU (Mã sản phẩm) *
                </label>
                <input
                  type="text"
                  value={formData.sku}
                  onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Nhập mã SKU"
                  required
                />
              </div>
            </div>
            
            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hình ảnh sản phẩm
              </label>
              <input
                id="imageInput"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-sm text-gray-500 mt-1">
                Chấp nhận: JPG, PNG, GIF (tối đa 5MB)
              </p>
              {formData.image && (
                <div className="mt-2 text-sm text-green-600">
                  ✅ Đã chọn: {formData.image.name}
                </div>
              )}
            </div>

            <div className="flex space-x-4">
              <button
                type="submit"
                disabled={uploading}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploading ? 'Đang tải...' : 'Lưu sản phẩm'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowCreateForm(false);
                  setFormData({ name: '', sku: '', image: null });
                  const fileInput = document.getElementById('imageInput');
                  if (fileInput) fileInput.value = '';
                }}
                className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
              >
                Hủy
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredProducts.length === 0 ? (
          <div className="col-span-full text-center py-12">
            {searchTerm ? (
              <div>
                <div className="text-gray-500 text-lg">Không tìm thấy sản phẩm phù hợp</div>
                <button
                  onClick={() => setSearchTerm('')}
                  className="mt-4 text-blue-600 hover:text-blue-800"
                >
                  Xóa bộ lọc
                </button>
              </div>
            ) : (
              <div>
                <div className="text-gray-500 text-lg">Chưa có sản phẩm nào</div>
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="mt-4 text-blue-600 hover:text-blue-800"
                >
                  Thêm sản phẩm đầu tiên
                </button>
              </div>
            )}
          </div>
        ) : (
          filteredProducts.map((product) => (
            <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden" key={product[ProductFields.ID]}>
              {/* Product Image */}
              <div className="h-48 bg-gray-100 flex items-center justify-center">
                {product[ProductFields.IMAGE_URL] ? (
                  <img 
                    src={product[ProductFields.IMAGE_URL]} 
                    alt={product[ProductFields.NAME]}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-6xl text-gray-400">📦</div>
                )}
              </div>
              
              {/* Product Info */}
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{product[ProductFields.NAME]}</h3>
                <span className="text-sm text-blue-600 bg-blue-50 px-2 py-1 rounded-md">SKU: {product[ProductFields.SKU]}</span>
                
                <div className="mt-3 space-y-1">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">Chờ nhập:</span>
                    <span className="font-medium text-amber-600">
                      {product[ProductFields.INCOMING_QUANTITY] || 0}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">Đang giữ:</span>
                    <span className="font-medium text-blue-600">
                      {product[ProductFields.RESERVED_QUANTITY] || 0}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">Có tại cửa hàng:</span>
                    <span className="font-medium">
                      {product[ProductFields.AVAILABLE_QUANTITY] || 0}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">Giá trung bình:</span>
                    <span className="font-medium text-green-600">
                      {product[ProductFields.AVERAGE_PRICE] > 0 
                        ? formatCurrency(product[ProductFields.AVERAGE_PRICE])
                        : 'Chưa có'
                      }
                    </span>
                  </div>
                </div>
                
                <div className="flex justify-end items-center mt-4">
                  <button
                    onClick={() => handleDelete(product)}
                    className="text-red-600 hover:text-red-800 text-sm font-medium"
                  >
                    Xóa
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default ProductList;
