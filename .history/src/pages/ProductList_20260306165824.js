import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

function ProductList() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', sku: '', image: null });
  const [message, setMessage] = useState('');
  const [uploading, setUploading] = useState(false);

  // Fetch products from Supabase
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

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
        .from('product-images')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const { data } = supabase.storage
        .from('product-images')
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
        .from('products')
        .insert([
          {
            name: formData.name,
            sku: formData.sku,
            image_url: imageUrl,
            created_at: new Date().toISOString()
          }
        ])
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

  // Delete product and its image
  const handleDelete = async (product) => {
    if (!window.confirm('Bạn có chắc muốn xóa sản phẩm này?')) {
      return;
    }

    try {
      // Delete image from storage if exists
      if (product.image_url) {
        const imagePath = product.image_url.split('/').pop();
        await supabase.storage
          .from('product-images')
          .remove([imagePath]);
      }

      // Delete product from database
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', product.id);

      if (error) {
        throw error;
      }

      setProducts(products.filter(p => p.id !== product.id));
      setMessage('Xóa sản phẩm thành công!');
      
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error deleting product:', error);
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

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-center items-center h-64">
          <div className="text-lg text-gray-600">Đang tải sản phẩm...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Danh sách sản phẩm</h1>
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
            {products.length} sản phẩm
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
        {products.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <div className="text-gray-500 text-lg">Chưa có sản phẩm nào</div>
            <button
              onClick={() => setShowCreateForm(true)}
              className="mt-4 text-blue-600 hover:text-blue-800"
            >
              Thêm sản phẩm đầu tiên
            </button>
          </div>
        ) : (
          products.map((product) => (
            <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden" key={product.id}>
              {/* Product Image */}
              <div className="h-48 bg-gray-100 flex items-center justify-center">
                {product.image_url ? (
                  <img 
                    src={product.image_url} 
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-6xl text-gray-400">📦</div>
                )}
              </div>
              
              {/* Product Info */}
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{product.name}</h3>
                <span className="text-sm text-blue-600 bg-blue-50 px-2 py-1 rounded-md">SKU: {product.sku}</span>
                
                <div className="flex justify-between items-center mt-4">
                  <span className="text-xs text-gray-500">
                    {new Date(product.created_at).toLocaleDateString('vi-VN')}
                  </span>
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
